import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Grid,
  MenuItem,
  Select,
  Slider,
  Typography,
  useTheme
} from '@mui/material'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import qs from 'qs'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import CardProduct from 'src/components/card-product/CardProduct'
import CustomPagination from 'src/components/custom-pagination'
import { PAGE_SIZE_OPTION } from 'src/configs/gridConfig'
import { ROUTE_CONFIG } from 'src/configs/route'
import { useFilter } from 'src/contexts/FilterContext'
import { getBrands } from 'src/services/brand'
import { getCategories } from 'src/services/category'
import { getMovementTypes } from 'src/services/movementType'
import { search } from 'src/services/watch'
import { TProduct } from 'src/types/product'

type TProps = {}

const LuxuryProductPage: NextPage<TProps> = () => {
  const theme = useTheme()
  const { t } = useTranslation()
  const router = useRouter()
  const { filters, updateSortBy, updateSearch } = useFilter()

  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTION[0])
  const [page, setPage] = useState(1)

  const [statusSelected, setStatusSelected] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState<number[]>([0, 50000000])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedMovementTypes, setSelectedMovementTypes] = useState<string[]>([])
  const [selectedGenders, setSelectedGenders] = useState<number[]>([])
  const [selectedRatings, setSelectedRatings] = useState<number[]>([])

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const [brands, setBrands] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [movementTypes, setMovementTypes] = useState<any[]>([])

  const [loading, setLoading] = useState(false)
  const [productsPublic, setProductsPublic] = useState<{
    data: any[]
    total: number
    totalPages: number
    currentPage: number
  }>({
    data: [],
    total: 0,
    totalPages: 0,
    currentPage: 1
  })

  const getPriceRangeValues = (range: string) => {
    switch (range) {
      case 'under-50k':
        return { min: 0, max: 50000 }
      case '50k-200k':
        return { min: 50000, max: 200000 }
      case '200k-400k':
        return { min: 200000, max: 400000 }
      case '400k-1m':
        return { min: 400000, max: 1000000 }
      case 'over-1m':
        return { min: 1000000, max: null }
      default:
        return null
    }
  }

  const formatFiltersForAPI = () => {
    const params: Record<string, any> = {
      page: page || 1,
      limit: pageSize || 10
    }

    if (filters.search?.trim()) {
      params['name__like'] = filters.search?.trim() || ''
    }

    if (statusSelected?.length > 0) {
      params.status = statusSelected.length === 1 ? statusSelected[0] : statusSelected
    }

    if (filters.priceRanges?.length > 0) {
      const priceRange = getPriceRangeValues(filters.priceRanges[0])
      if (priceRange) {
        if (priceRange.min !== null) params.min_price = priceRange.min
        if (priceRange.max !== null) params.max_price = priceRange.max
      }
    }

    if (filters.ratings?.length > 0) {
      const ratings = [...filters.ratings]
      const minRating = Math.min(...ratings)
      const maxRating = Math.max(...ratings)
      params.min_rating = minRating
      if (minRating !== maxRating) params.max_rating = maxRating
    }

    if (priceRange && (priceRange[0] > 0 || priceRange[1] < 50000000)) {
      params['base_price__range'] = `${priceRange[0]}:${priceRange[1]}`
    }

    if (filters.sortBy) {
      params.sort = filters.sortBy
    }

    Object.keys(params).forEach(key => {
      if (
        params[key] === undefined ||
        params[key] === null ||
        (Array.isArray(params[key]) && params[key].length === 0)
      ) {
        delete params[key]
      }
    })

    if (selectedBrands.length > 0) {
      params['brand_id__in'] = selectedBrands.join(',')
    }

    if (selectedCategories.length > 0) {
      params['category_id__in'] = selectedCategories.join(',')
    }

    if (selectedMovementTypes.length > 0) {
      params['movement_type_id__in'] = selectedMovementTypes.join(',')
    }

    if (selectedGenders.length > 0) {
      params['gender__in'] = selectedGenders.join(',')
    }

    if (selectedRatings.length > 0) {
      params['rating__gte'] = Math.min(...selectedRatings)
    }

    return params
  }

  const handleLoadBrands = async () => {
    try {
      const response = await getBrands()
      if (response && response.brands && response.brands.items) {
        setBrands(response.brands.items)
      }
    } catch (error) {
      console.error('Error loading brands:', error)
    }
  }

  const handleLoadCategories = async () => {
    try {
      const response = await getCategories()
      if (response && response.categories && response.categories.items) {
        setCategories(response.categories.items)
      }
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const handleLoadMovementTypes = async () => {
    try {
      const response = await getMovementTypes()
      if (response && response.movementTypes && response.movementTypes.rows) {
        setMovementTypes(response.movementTypes.rows)
      }
    } catch (error) {
      console.error('Error loading movement types:', error)
    }
  }

  const handleGetListProducts = async () => {
    try {
      setLoading(true)

      const queryParams = formatFiltersForAPI()
      console.log('Final queryParams for Elasticsearch:', queryParams)
      console.log('URL params will be:', qs.stringify(queryParams, { arrayFormat: 'repeat', encode: false }))

      const response = await search({
        params: queryParams,
        paramsSerializer: params =>
          qs.stringify(params, {
            arrayFormat: 'repeat',
            encode: false
          })
      })

      if (response && response.watches) {
        setProductsPublic({
          data: response.watches.items || [],
          total: response.watches.totalItems || 0,
          totalPages: response.watches.totalPages || 0,
          currentPage: response.watches.page || 1
        })
      } else {
        toast.error(t('load_products_error'))
      }
    } catch (error: any) {
      console.error('Error fetching products:', error)
      toast.error(error?.message || t('load_products_error'))
    } finally {
      setLoading(false)
    }
  }

  const clearAll = () => {
    setPriceRange([0, 50000000])
    setSelectedBrands([])
    setSelectedCategories([])
    setSelectedRatings([])
    updateSortBy('created_at:desc')
  }

  const handleOnchangePagination = (page: number, pageSize: number) => {
    setPage(page)
    setPageSize(pageSize)
  }

  const handleNavigateProduct = () => {
    router.push(`${ROUTE_CONFIG.PRODUCT}`)
  }

  useEffect(() => {
    handleGetListProducts()
  }, [
    page,
    pageSize,
    filters.search,
    filters.sortBy,
    filters.priceRanges,
    filters.ratings,
    statusSelected,
    priceRange,
    selectedBrands,
    selectedCategories,
    selectedMovementTypes,
    selectedGenders,
    selectedRatings
  ])

  // Load brands, categories, movement types and initial products on mount
  useEffect(() => {
    handleLoadBrands()
    handleLoadCategories()
    handleLoadMovementTypes()
    handleGetListProducts()
  }, [])

  return (
    <Box
      sx={{
        mx: 'auto',
        backgroundColor: theme.palette.background.default,
        minHeight: '100vh',
        width: '90%'
      }}
    >
      <Box sx={{ py: 6, px: 2, mb: 4 }}>
        <Typography
          component='div'
          sx={{
            fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', sans-serif !important`,
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            mb: 1,
            fontSize: { xs: 28, sm: 36, md: 44 }
          }}
        >
          Bộ sưu tập đồng hồ
        </Typography>
        <Typography
          component='div'
          sx={{
            fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', sans-serif !important`,
            color: 'text.secondary',
            fontSize: { xs: 14, sm: 16, md: 18 }
          }}
        >
          Khám phá {productsPublic.total} sản phẩm đồng hồ cao cấp
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Box
            sx={{
              position: 'sticky',
              top: 16,
              border: '1px solid',
              borderColor: 'divider',
              p: 2,
              borderRadius: 2,
              bgcolor: 'background.paper'
            }}
          >
            <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
              <Typography fontWeight={600}>Bộ lọc</Typography>
            </Box>

            <Box mb={3}>
              <Typography variant='body2' mb={1}>
                Khoảng giá: {priceRange[0].toLocaleString()} - {priceRange[1].toLocaleString()} VND
              </Typography>
              <Slider
                value={priceRange}
                onChange={(_, v) => {
                  const newRange = v as number[]
                  setPriceRange(newRange)
                }}
                min={0}
                max={50000000}
                step={1000000}
                valueLabelDisplay='auto'
                valueLabelFormat={value => `${(value / 1000000).toFixed(0)}M`}
              />
            </Box>

            <Box mb={3}>
              <Typography variant='body2' mb={1}>
                Thương hiệu
              </Typography>
              <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
                <FormGroup>
                  {brands.map(brand => (
                    <FormControlLabel
                      key={brand.id}
                      control={
                        <Checkbox
                          checked={selectedBrands.includes(brand.id)}
                          onChange={e => {
                            if (e.target.checked) {
                              setSelectedBrands([...selectedBrands, brand.id])
                            } else {
                              setSelectedBrands(selectedBrands.filter(id => id !== brand.id))
                            }
                          }}
                          size='small'
                        />
                      }
                      label={brand.name}
                    />
                  ))}
                </FormGroup>
              </Box>
            </Box>

            <Box mb={3}>
              <Typography variant='body2' mb={1}>
                Danh mục
              </Typography>
              <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
                <FormGroup>
                  {categories.map(category => (
                    <FormControlLabel
                      key={category.id}
                      control={
                        <Checkbox
                          checked={selectedCategories.includes(category.id)}
                          onChange={e => {
                            if (e.target.checked) {
                              setSelectedCategories([...selectedCategories, category.id])
                            } else {
                              setSelectedCategories(selectedCategories.filter(id => id !== category.id))
                            }
                          }}
                          size='small'
                        />
                      }
                      label={category.name}
                    />
                  ))}
                </FormGroup>
              </Box>
            </Box>

            <Box mb={3}>
              <Typography variant='body2' mb={1}>
                Loại máy
              </Typography>
              <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
                <FormGroup>
                  {movementTypes.map(movementType => (
                    <FormControlLabel
                      key={movementType.id}
                      control={
                        <Checkbox
                          checked={selectedMovementTypes.includes(movementType.id)}
                          onChange={e => {
                            if (e.target.checked) {
                              setSelectedMovementTypes([...selectedMovementTypes, movementType.id])
                            } else {
                              setSelectedMovementTypes(selectedMovementTypes.filter(id => id !== movementType.id))
                            }
                          }}
                          size='small'
                        />
                      }
                      label={movementType.name}
                    />
                  ))}
                </FormGroup>
              </Box>
            </Box>

            <Box mb={3}>
              <Typography variant='body2' mb={1}>
                Giới tính
              </Typography>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedGenders.includes(0)}
                      onChange={e => {
                        if (e.target.checked) {
                          setSelectedGenders([...selectedGenders, 0])
                        } else {
                          setSelectedGenders(selectedGenders.filter(g => g !== 0))
                        }
                      }}
                      size='small'
                    />
                  }
                  label='Nam'
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedGenders.includes(1)}
                      onChange={e => {
                        if (e.target.checked) {
                          setSelectedGenders([...selectedGenders, 1])
                        } else {
                          setSelectedGenders(selectedGenders.filter(g => g !== 1))
                        }
                      }}
                      size='small'
                    />
                  }
                  label='Nữ'
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedGenders.includes(3)}
                      onChange={e => {
                        if (e.target.checked) {
                          setSelectedGenders([...selectedGenders, 3])
                        } else {
                          setSelectedGenders(selectedGenders.filter(g => g !== 3))
                        }
                      }}
                      size='small'
                    />
                  }
                  label='Khác'
                />
              </FormGroup>
            </Box>

            <Box mb={3}>
              <Typography variant='body2' mb={1}>
                Đánh giá
              </Typography>
              <FormGroup>
                {[5, 4, 3, 2, 1].map(rating => (
                  <FormControlLabel
                    key={rating}
                    control={
                      <Checkbox
                        checked={selectedRatings.includes(rating)}
                        onChange={e => {
                          if (e.target.checked) {
                            setSelectedRatings([...selectedRatings, rating])
                          } else {
                            setSelectedRatings(selectedRatings.filter(r => r !== rating))
                          }
                        }}
                        size='small'
                      />
                    }
                    label={`${rating} sao trở lên`}
                  />
                ))}
              </FormGroup>
            </Box>
            <Button variant='outlined' fullWidth onClick={clearAll}>
              Xóa tất cả bộ lọc
            </Button>
          </Box>
        </Grid>

        <Grid item xs={12} md={9}>
          <Box display='flex' justifyContent='flex-end' alignItems='center' mb={2}>
            <Box display='flex' alignItems='center' gap={1}>
              <Typography variant='body2' color='text.secondary'>
                Sắp xếp:
              </Typography>
              <Select
                size='small'
                value={filters.sortBy || 'created_at:desc'}
                onChange={e => updateSortBy(e.target.value)}
                sx={{ minWidth: 200 }}
                MenuProps={{ disableScrollLock: true }}
              >
                <MenuItem value='created_at:desc'>Mới nhất</MenuItem>
                <MenuItem value='created_at:asc'>Cũ nhất</MenuItem>
                <MenuItem value='base_price:asc'>Giá thấp đến cao</MenuItem>
                <MenuItem value='base_price:desc'>Giá cao đến thấp</MenuItem>
                <MenuItem value='rating:desc'>Đánh giá cao nhất</MenuItem>
                <MenuItem value='sold:desc'>Bán chạy nhất</MenuItem>
              </Select>
            </Box>
          </Box>

          {loading ? (
            <Box display='flex' justifyContent='center' alignItems='center' minHeight='200px'>
              <Typography>Đang tải sản phẩm...</Typography>
            </Box>
          ) : viewMode === 'grid' ? (
            <Grid container spacing={2}>
              {productsPublic.data.map(w => {
                const item: TProduct = {
                  id: String(w.id),
                  name: w.name,
                  price: Number(w.base_price) || 0,
                  thumbnail: w.thumbnail || '/placeholder-product.jpg',
                  sold: w.sold || 0,
                  rating: Number(w.rating) || 0
                } as any

                return (
                  <Grid key={w.id} item xs={12} sm={6} md={4}>
                    <CardProduct item={item} />
                  </Grid>
                )
              })}
              {productsPublic.data.length === 0 && (
                <Grid item xs={12}>
                  <Typography textAlign='center' color='text.secondary'>
                    Không tìm thấy sản phẩm nào
                  </Typography>
                </Grid>
              )}
            </Grid>
          ) : (
            <Grid container spacing={2}>
              {productsPublic.data.map(w => {
                const item: TProduct = {
                  id: String(w.id),
                  name: w.name,
                  price: Number(w.base_price) || 0,
                  thumbnail: w.thumbnail || '/placeholder-product.jpg',
                  sold: w.sold || 0,
                  rating: Number(w.rating) || 0
                } as any

                return (
                  <Grid key={w.id} item xs={12}>
                    <CardProduct item={item} />
                  </Grid>
                )
              })}
              {productsPublic.data.length === 0 && (
                <Grid item xs={12}>
                  <Typography textAlign='center' color='text.secondary'>
                    Không tìm thấy sản phẩm nào
                  </Typography>
                </Grid>
              )}
            </Grid>
          )}
        </Grid>
        <Box sx={{ mt: 4, mb: 4, width: '100%' }} display='flex' justifyContent='center' alignItems='center'>
          <CustomPagination
            onChangePagination={handleOnchangePagination}
            pageSizeOptions={PAGE_SIZE_OPTION}
            pageSize={pageSize}
            totalPages={productsPublic?.totalPages}
            page={page}
            rowLength={10}
            isHideShowed
          />
        </Box>
      </Grid>
    </Box>
  )
}

export default LuxuryProductPage
