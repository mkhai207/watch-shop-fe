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
  Chip,
  Breadcrumbs
} from '@mui/material'
import { NextPage } from 'next'
import Link from 'next/link'
import qs from 'qs'
import { useEffect, useMemo, useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import CardProduct from 'src/components/card-product/CardProduct'
import CustomPagination from 'src/components/custom-pagination'
import { PAGE_SIZE_OPTION } from 'src/configs/gridConfig'
import { useFilter } from 'src/contexts/FilterContext'
import { getBrands } from 'src/services/brand'
import { getCategories } from 'src/services/category'
import { getMovementTypes } from 'src/services/movementType'
import { search } from 'src/services/watch'
import { TProduct } from 'src/types/product'
import { useFormatPrice } from 'src/utils/formatNumber'

type TProps = {}

const LuxuryProductPage: NextPage<TProps> = () => {
  const { t } = useTranslation()
  const { filters, updateSortBy, updateSingleFilter } = useFilter()

  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTION[0])
  const [page, setPage] = useState(1)

  const [statusSelected] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState<number[]>([0, 50_000_000])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedMovementTypes, setSelectedMovementTypes] = useState<string[]>([])
  const [selectedGenders, setSelectedGenders] = useState<number[]>([])
  const [selectedRatings, setSelectedRatings] = useState<number[]>([])

  const [brands, setBrands] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [movementTypes, setMovementTypes] = useState<any[]>([])

  const [loading, setLoading] = useState(false)
  const formattedPriceRange = useFormatPrice(priceRange[0])
  const formattedPriceRangeMax = useFormatPrice(priceRange[1])
  const [productsPublic, setProductsPublic] = useState<{
    data: any[]
    total: number
    totalPages: number
    currentPage: number
  }>({ data: [], total: 0, totalPages: 0, currentPage: 1 })

  const getPriceRangeValues = (range: string) => {
    switch (range) {
      case 'under-50k':
        return { min: 0, max: 50_000 }
      case '50k-200k':
        return { min: 50_000, max: 200_000 }
      case '200k-400k':
        return { min: 200_000, max: 400_000 }
      case '400k-1m':
        return { min: 400_000, max: 1_000_000 }
      case 'over-1m':
        return { min: 1_000_000, max: null }
      default:
        return null
    }
  }

  const formatFiltersForAPI = useCallback(() => {
    const params: Record<string, any> = {
      page: page || 1,
      limit: pageSize || 10
    }

    if (filters.search?.trim()) params['q'] = filters.search.trim()

    if (statusSelected?.length > 0) {
      params.status = statusSelected.length === 1 ? statusSelected[0] : statusSelected
    }

    if (filters.priceRanges?.length > 0) {
      const pr = getPriceRangeValues(filters.priceRanges[0])
      if (pr) {
        if (pr.min !== null) params.min_price = pr.min
        if (pr.max !== null) params.max_price = pr.max
      }
    }

    if (filters.ratings?.length > 0) {
      const ratings = [...filters.ratings]
      const minRating = Math.min(...ratings)
      const maxRating = Math.max(...ratings)
      params.min_rating = minRating
      if (minRating !== maxRating) params.max_rating = maxRating
    }

    if (priceRange && (priceRange[0] > 0 || priceRange[1] < 50_000_000)) {
      params['base_price__range'] = `${priceRange[0]}:${priceRange[1]}`
    }

    if (filters.sortBy) params.sort = filters.sortBy

    Object.keys(params).forEach(key => {
      const v = params[key]
      if (v === undefined || v === null || (Array.isArray(v) && v.length === 0)) delete params[key]
    })

    if (selectedBrands.length > 0) params['brand_id__in'] = selectedBrands.join(',')
    if (selectedCategories.length > 0) params['category_id__in'] = selectedCategories.join(',')
    if (selectedMovementTypes.length > 0) params['movement_type_id__in'] = selectedMovementTypes.join(',')
    if (selectedGenders.length > 0) params['gender__in'] = selectedGenders.join(',')
    if (selectedRatings.length > 0) params['rating__gte'] = Math.min(...selectedRatings)

    if (filters.brandId) params['brand_id'] = filters.brandId
    if (filters.categoryId) params['category_id'] = filters.categoryId
    if (filters.movementTypeId) params['movement_type_id'] = filters.movementTypeId
    if (filters.colorId) params['color_id'] = filters.colorId
    if (filters.strapMaterialId) params['strap_material_id'] = filters.strapMaterialId

    return params
  }, [
    page,
    pageSize,
    filters.search,
    filters.priceRanges,
    filters.ratings,
    filters.sortBy,
    filters.brandId,
    filters.categoryId,
    filters.movementTypeId,
    filters.colorId,
    filters.strapMaterialId,
    statusSelected,
    priceRange,
    selectedBrands,
    selectedCategories,
    selectedMovementTypes,
    selectedGenders,
    selectedRatings
  ])

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
      const items = response?.categories?.items || response?.categorys?.items || []
      setCategories(items)
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const handleLoadMovementTypes = async () => {
    try {
      const response = await getMovementTypes()
      if (response && response.movementTypes && response.movementTypes.items) {
        setMovementTypes(response.movementTypes.items)
      }
    } catch (error) {
      console.error('Error loading movement types:', error)
    }
  }

  const handleGetListProducts = useCallback(async () => {
    try {
      setLoading(true)
      const queryParams = formatFiltersForAPI()

      const response = await search({
        params: queryParams,
        paramsSerializer: params => qs.stringify(params, { arrayFormat: 'repeat', encode: false })
      })

      if (response?.watches) {
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
  }, [formatFiltersForAPI, t])

  const clearAll = () => {
    setPriceRange([0, 50_000_000])
    setSelectedBrands([])
    setSelectedCategories([])
    setSelectedMovementTypes([])
    setSelectedGenders([])
    setSelectedRatings([])
    updateSortBy('created_at:desc')
    setPage(1)

    updateSingleFilter('brandId', '')
    updateSingleFilter('categoryId', '')
    updateSingleFilter('movementTypeId', '')
    updateSingleFilter('colorId', '')
    updateSingleFilter('strapMaterialId', '')
  }

  const handleOnchangePagination = (nextPage: number, nextPageSize: number) => {
    setPage(nextPage)
    setPageSize(nextPageSize)
  }

  useEffect(() => {
    handleLoadBrands()
    handleLoadCategories()
    handleLoadMovementTypes()
  }, [])

  useEffect(() => {
    if (filters.brandId && filters.brandId.trim() && !selectedBrands.includes(filters.brandId)) {
      setSelectedBrands(prev => [...prev, filters.brandId!])
    }
  }, [filters.brandId, selectedBrands])

  useEffect(() => {
    if (filters.categoryId && filters.categoryId.trim() && !selectedCategories.includes(filters.categoryId)) {
      setSelectedCategories(prev => [...prev, filters.categoryId!])
    }
  }, [filters.categoryId, selectedCategories])

  useEffect(() => {
    if (
      filters.movementTypeId &&
      filters.movementTypeId.trim() &&
      !selectedMovementTypes.includes(filters.movementTypeId)
    ) {
      setSelectedMovementTypes(prev => [...prev, filters.movementTypeId!])
    }
  }, [filters.movementTypeId, selectedMovementTypes])

  useEffect(() => {
    handleGetListProducts()
  }, [
    handleGetListProducts,
    page,
    pageSize,
    filters.search,
    filters.sortBy,
    filters.priceRanges,
    filters.ratings,
    filters.brandId,
    filters.categoryId,
    filters.movementTypeId,
    filters.colorId,
    filters.strapMaterialId,
    statusSelected,
    priceRange,
    selectedBrands,
    selectedCategories,
    selectedMovementTypes,
    selectedGenders,
    selectedRatings
  ])

  const activeFilterChips = useMemo(() => {
    const chips: { key: string; label: string; onDelete: () => void }[] = []

    if (selectedBrands.length && !filters.brandId)
      selectedBrands.forEach(id => {
        const n = brands.find(b => b.id === id)?.name || id
        chips.push({
          key: `brand-${id}`,
          label: `Thương hiệu: ${n}`,
          onDelete: () => setSelectedBrands(prev => prev.filter(x => x !== id))
        })
      })

    if (selectedCategories.length && !filters.categoryId)
      selectedCategories.forEach(id => {
        const n = categories.find(c => c.id === id)?.name || id
        chips.push({
          key: `cat-${id}`,
          label: `Danh mục: ${n}`,
          onDelete: () => setSelectedCategories(prev => prev.filter(x => x !== id))
        })
      })

    if (selectedMovementTypes.length && !filters.movementTypeId)
      selectedMovementTypes.forEach(id => {
        const n = movementTypes.find(m => m.id === id)?.name || id
        chips.push({
          key: `mv-${id}`,
          label: `Loại máy: ${n}`,
          onDelete: () => setSelectedMovementTypes(prev => prev.filter(x => x !== id))
        })
      })

    if (selectedGenders.length)
      selectedGenders.forEach(g => {
        const n = g === 0 ? 'Nam' : g === 1 ? 'Nữ' : 'Khác'
        chips.push({
          key: `g-${g}`,
          label: `Giới tính: ${n}`,
          onDelete: () => setSelectedGenders(prev => prev.filter(x => x !== g))
        })
      })

    if (selectedRatings.length) {
      const minR = Math.min(...selectedRatings)
      chips.push({ key: `rating`, label: `${minR} sao trở lên`, onDelete: () => setSelectedRatings([]) })
    }

    if (priceRange[0] !== 0 || priceRange[1] !== 50_000_000) {
      chips.push({
        key: 'price',
        label: `Giá: ${priceRange[0].toLocaleString()} - ${priceRange[1].toLocaleString()} VND`,
        onDelete: () => setPriceRange([0, 50_000_000])
      })
    }

    if (filters.brandId) {
      const brand = brands.find(b => b.id.toString() === filters.brandId)
      chips.push({
        key: 'mega-brand',
        label: `Thương hiệu: ${brand?.name || filters.brandId}`,
        onDelete: () => {
          updateSingleFilter('brandId', '')

          setSelectedBrands(prev => prev.filter(id => id !== filters.brandId))
        }
      })
    }

    if (filters.categoryId) {
      const category = categories.find(c => c.id.toString() === filters.categoryId)
      chips.push({
        key: 'mega-category',
        label: `Danh mục: ${category?.name || filters.categoryId}`,
        onDelete: () => {
          updateSingleFilter('categoryId', '')

          setSelectedCategories(prev => prev.filter(id => id !== filters.categoryId))
        }
      })
    }

    if (filters.movementTypeId) {
      const movement = movementTypes.find(m => m.id.toString() === filters.movementTypeId)
      chips.push({
        key: 'mega-movement',
        label: `Bộ máy: ${movement?.name || filters.movementTypeId}`,
        onDelete: () => {
          updateSingleFilter('movementTypeId', '')
        }
      })
    }

    if (filters.colorId) {
      chips.push({
        key: 'mega-color',
        label: `Màu sắc: ${filters.colorId}`,
        onDelete: () => updateSingleFilter('colorId', '')
      })
    }

    if (filters.strapMaterialId) {
      chips.push({
        key: 'mega-strap',
        label: `Chất liệu dây: ${filters.strapMaterialId}`,
        onDelete: () => updateSingleFilter('strapMaterialId', '')
      })
    }

    return chips
  }, [
    brands,
    categories,
    movementTypes,
    priceRange,
    selectedBrands,
    selectedCategories,
    selectedGenders,
    selectedMovementTypes,
    selectedRatings,
    filters.brandId,
    filters.categoryId,
    filters.movementTypeId,
    filters.colorId,
    filters.strapMaterialId,
    updateSingleFilter
  ])

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header / Hero */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, rgba(25,118,210,0.08) 0%, rgba(25,118,210,0.02) 100%)',
          borderBottom: '1px solid',
          borderColor: 'grey.200'
        }}
      >
        <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 3 }, py: { xs: 3, md: 5 } }}>
          <Breadcrumbs sx={{ mb: 1, color: 'text.secondary' }} aria-label='breadcrumb'>
            <Link href='/' style={{ color: 'inherit', textDecoration: 'none' }}>
              Trang chủ
            </Link>
            <Typography color='text.primary'>Bộ sưu tập đồng hồ</Typography>
          </Breadcrumbs>

          <Typography variant='h3' sx={{ fontWeight: 700, lineHeight: 1.2, mb: 1, fontSize: { xs: 28, md: 36 } }}>
            Bộ sưu tập đồng hồ
          </Typography>
          <Typography sx={{ color: 'text.secondary', mb: 2 }}>
            Khám phá các mẫu đồng hồ cao cấp, được tuyển chọn kỹ lưỡng.
          </Typography>

          {/* Active chips */}
          {activeFilterChips.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {activeFilterChips.map(ch => (
                <Chip key={ch.key} label={ch.label} onDelete={ch.onDelete} size='small' />
              ))}
              <Button onClick={clearAll} size='small' sx={{ ml: 0.5 }}>
                Xóa tất cả
              </Button>
            </Box>
          )}
        </Box>
      </Box>

      {/* 2-Column Layout */}
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 3 }, py: { xs: 3, md: 4 } }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Box
              sx={{
                position: { md: 'sticky' },
                top: { md: 24 },
                border: '1px solid',
                borderColor: 'grey.200',
                bgcolor: 'background.paper',
                borderRadius: 2,
                p: 2.5
              }}
            >
              <Typography variant='h6' sx={{ fontWeight: 700, mb: 2 }}>
                Bộ lọc
              </Typography>

              {/* Price */}
              <Box mb={3}>
                <Typography sx={{ fontWeight: 600, mb: 1 }}>Khoảng giá</Typography>
                <Box sx={{ p: 2, border: '1px solid', borderColor: 'grey.200', borderRadius: 2, bgcolor: 'grey.50' }}>
                  <Typography variant='body2' sx={{ textAlign: 'center', color: 'text.secondary', mb: 1 }}>
                    {priceRange[0].toLocaleString()} - {priceRange[1].toLocaleString()} VND
                  </Typography>
                  <Slider
                    value={priceRange}
                    onChange={(_, v) => setPriceRange(v as number[])}
                    min={0}
                    max={50_000_000}
                    step={1_000_000}
                    valueLabelDisplay='auto'
                    valueLabelFormat={value => `${(value / 1_000_000).toFixed(0)}M`}
                  />
                </Box>
              </Box>

              {/* Brand */}
              <Box mb={3}>
                <Typography sx={{ fontWeight: 600, mb: 1 }}>Thương hiệu</Typography>
                <Box sx={{ maxHeight: 220, overflowY: 'auto', pr: 1 }}>
                  <FormGroup>
                    {brands.map(brand => (
                      <FormControlLabel
                        key={brand.id}
                        control={
                          <Checkbox
                            checked={selectedBrands.includes(brand.id)}
                            onChange={e => {
                              if (filters.brandId) {
                                updateSingleFilter('brandId', '')
                              }
                              setSelectedBrands(prev =>
                                e.target.checked ? [...prev, brand.id] : prev.filter(id => id !== brand.id)
                              )
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

              {/* Category */}
              <Box mb={3}>
                <Typography sx={{ fontWeight: 600, mb: 1 }}>Danh mục</Typography>
                <Box sx={{ maxHeight: 220, overflowY: 'auto', pr: 1 }}>
                  <FormGroup>
                    {categories.map(category => (
                      <FormControlLabel
                        key={category.id}
                        control={
                          <Checkbox
                            checked={selectedCategories.includes(category.id)}
                            onChange={e => {
                              if (filters.categoryId) {
                                updateSingleFilter('categoryId', '')
                              }
                              setSelectedCategories(prev =>
                                e.target.checked ? [...prev, category.id] : prev.filter(id => id !== category.id)
                              )
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

              {/* Movement Types */}
              <Box mb={3}>
                <Typography sx={{ fontWeight: 600, mb: 1 }}>Loại máy</Typography>
                <Box sx={{ maxHeight: 220, overflowY: 'auto', pr: 1 }}>
                  <FormGroup>
                    {movementTypes.map(mt => (
                      <FormControlLabel
                        key={mt.id}
                        control={
                          <Checkbox
                            checked={selectedMovementTypes.includes(mt.id)}
                            onChange={e => {
                              if (filters.movementTypeId) {
                                updateSingleFilter('movementTypeId', '')
                              }
                              setSelectedMovementTypes(prev =>
                                e.target.checked ? [...prev, mt.id] : prev.filter(id => id !== mt.id)
                              )
                            }}
                            size='small'
                          />
                        }
                        label={mt.name}
                      />
                    ))}
                  </FormGroup>
                </Box>
              </Box>

              {/* Gender */}
              <Box mb={3}>
                <Typography sx={{ fontWeight: 600, mb: 1 }}>Giới tính</Typography>
                <FormGroup row>
                  {[
                    { id: 0, label: 'Nam' },
                    { id: 1, label: 'Nữ' },
                    { id: 3, label: 'Khác' }
                  ].map(g => (
                    <FormControlLabel
                      key={g.id}
                      control={
                        <Checkbox
                          checked={selectedGenders.includes(g.id)}
                          onChange={e => {
                            setSelectedGenders(prev =>
                              e.target.checked ? [...prev, g.id] : prev.filter(x => x !== g.id)
                            )
                          }}
                          size='small'
                        />
                      }
                      label={g.label}
                    />
                  ))}
                </FormGroup>
              </Box>

              {/* Rating */}
              <Box mb={2}>
                <Typography sx={{ fontWeight: 600, mb: 1 }}>Đánh giá</Typography>
                <FormGroup>
                  {[5, 4, 3, 2, 1].map(r => (
                    <FormControlLabel
                      key={r}
                      control={
                        <Checkbox
                          checked={selectedRatings.includes(r)}
                          onChange={e =>
                            setSelectedRatings(prev => (e.target.checked ? [...prev, r] : prev.filter(x => x !== r)))
                          }
                          size='small'
                        />
                      }
                      label={`${r} sao trở lên`}
                    />
                  ))}
                </FormGroup>
              </Box>

              <Button variant='outlined' fullWidth onClick={clearAll} sx={{ mt: 1 }}>
                Xóa tất cả bộ lọc
              </Button>
            </Box>
          </Grid>

          <Grid item xs={12} md={9}>
            {/* Sort bar */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 2,
                p: 2.5,
                border: '1px solid',
                borderColor: 'grey.200',
                bgcolor: 'background.paper',
                borderRadius: 2,
                mb: 2
              }}
            >
              <Box display='flex' alignItems='center' justifyContent='flex-end' gap={2}>
                <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                  Sắp xếp theo
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
              <Box mb={3}>
                <Typography variant='body2' mb={1}>
                  Khoảng giá: {formattedPriceRange} - {formattedPriceRangeMax} VND
                </Typography>
                <Slider
                  value={priceRange}
                  onChange={(_, v) => {
                    const newRange = v as number[]
                    setPriceRange(newRange)
                  }}
                />
              </Box>
            ) : productsPublic.data.length === 0 ? (
              <Box
                sx={{
                  p: 6,
                  textAlign: 'center',
                  border: '1px solid',
                  borderColor: 'grey.200',
                  bgcolor: 'background.paper',
                  borderRadius: 2
                }}
              >
                <Typography sx={{ color: 'text.secondary' }}>Không tìm thấy sản phẩm nào</Typography>
              </Box>
            ) : (
              <Box
                sx={{
                  p: 2.5,
                  border: '1px solid',
                  borderColor: 'grey.200',
                  bgcolor: 'background.paper',
                  borderRadius: 2
                }}
              >
                <Grid container spacing={2.5}>
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
                        <Box sx={{ transition: 'transform .2s ease', '&:hover': { transform: 'translateY(-4px)' } }}>
                          <CardProduct item={item} />
                        </Box>
                      </Grid>
                    )
                  })}
                </Grid>
              </Box>
            )}
            <Box
              sx={{
                mt: 2,
                p: 2.5,
                display: 'flex',
                justifyContent: 'center',
                border: '1px solid',
                borderColor: 'grey.200',
                bgcolor: 'background.paper',
                borderRadius: 2
              }}
            >
              <CustomPagination
                onChangePagination={handleOnchangePagination}
                pageSizeOptions={PAGE_SIZE_OPTION}
                pageSize={pageSize}
                totalPages={productsPublic.totalPages}
                page={page}
                rowLength={10}
                isHideShowed
              />
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
}

export default LuxuryProductPage
