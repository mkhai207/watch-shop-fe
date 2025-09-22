import { Box, FormControl, Grid, MenuItem, Select, SelectChangeEvent, Typography, useTheme } from '@mui/material'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import qs from 'qs'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import CustomPagination from 'src/components/custom-pagination'
import Spinner from 'src/components/spinner'
import { PAGE_SIZE_OPTION } from 'src/configs/gridConfig'
import { ROUTE_CONFIG } from 'src/configs/route'
import { useFilter } from 'src/contexts/FilterContext'
import { searchProducts } from 'src/services/product'
import { TProduct } from 'src/types/product'
import CardProduct from '../../../components/card-product/CardProduct'
import FilterAccordion from './components/Filter'

type TProps = {}

type SortOptionKey = 'Mới nhất' | 'Sản phẩm nổi bật' | 'Giá: Tăng dần' | 'Giá: Giảm dần' | 'Tên: A-Z'

const ProductPage: NextPage<TProps> = () => {
  const theme = useTheme()
  const { t } = useTranslation()
  const router = useRouter()
  const { filters, updateSortBy } = useFilter()

  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTION[0])
  const [page, setPage] = useState(1)

  // Filter states
  const [statusSelected, setStatusSelected] = useState<string[]>([])

  // Data states
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

  // const formatFiltersForAPI = () => {
  //   const params: Record<string, any> = {
  //     page: page || 1,
  //     limit: pageSize || 10,
  //     sort: filters.sortBy
  //   }

  //   if (searchBy?.trim()) {
  //     params.name = `like:${searchBy.trim()}`
  //   }

  //   if (statusSelected?.length > 0) {
  //     params.status = statusSelected.length === 1 ? statusSelected[0] : statusSelected
  //   }

  //   if (filters.priceRanges?.length > 0) {
  //     const priceRange = getPriceRangeValues(filters.priceRanges[0])
  //     if (priceRange) {
  //       params.price = []
  //       if (priceRange.min !== null) params.price.push(`gt:${priceRange.min}`)
  //       if (priceRange.max !== null) params.price.push(`lt:${priceRange.max}`)
  //     }
  //   }

  //   if (filters.ratings?.length > 0) {
  //     const rating = Math.min(...filters.ratings)
  //     params.rating = `gt:${rating}`
  //   }

  //   Object.keys(params).forEach(key => {
  //     if (
  //       params[key] === undefined ||
  //       params[key] === null ||
  //       (Array.isArray(params[key]) && params[key].length === 0)
  //     ) {
  //       delete params[key]
  //     }
  //   })

  //   return params
  // }

  // const handleGetListProducts = async () => {
  //   try {
  //     setLoading(true)

  //     const queryParams = formatFiltersForAPI()

  //     const response = await getAllProductsPublic({
  //       params: queryParams,
  //       paramsSerializer: params => qs.stringify(params, { arrayFormat: 'repeat', encode: false })
  //     })

  //     if (response.status === 'success') {
  //       setProductsPublic({
  //         data: response?.data || [],
  //         total: response.meta?.totalItems || 0,
  //         totalPages: response.meta?.totalPages || 0,
  //         currentPage: response.meta?.currentPage || 1
  //       })

  //       toast.success('Tải sản phẩm thành công!')
  //     } else {
  //       toast.error(response.message || 'Có lỗi xảy ra khi tải sản phẩm')
  //     }
  //   } catch (error: any) {
  //     console.error('Error fetching products:', error)
  //     toast.error(error?.message || 'Có lỗi xảy ra khi tải sản phẩm')
  //   } finally {
  //     setLoading(false)
  //   }
  // }

  const formatFiltersForAPI = () => {
    const params: Record<string, any> = {
      page: page || 1,
      limit: pageSize || 10
    }

    if (filters.search?.trim()) {
      params.q = filters.search?.trim()
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

    if (filters.sortBy) {
      const [sortBy, sortOrder] = filters.sortBy.split(':')
      params.sort_by = sortBy || 'relevance'
      params.sort_order = sortOrder || 'asc'
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

    return params
  }

  const handleGetListProducts = async () => {
    try {
      setLoading(true)

      const queryParams = formatFiltersForAPI()

      const response = await searchProducts({
        params: queryParams,
        paramsSerializer: params =>
          qs.stringify(params, {
            arrayFormat: 'repeat',
            encode: false
          })
      })

      if (response.status === 'success') {
        setProductsPublic({
          data: response.data.products || [],
          total: response.data.total || 0,
          totalPages: response.data.totalPages || 0,
          currentPage: response.data.currentPage || 1
        })
      } else {
        toast.error(response.message || t('load_products_error'))
      }
    } catch (error: any) {
      console.error('Error fetching products:', error)
      toast.error(error?.message || t('load_products_error'))
    } finally {
      setLoading(false)
    }
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
  }, [page, pageSize, filters.search, filters.sortBy, filters.priceRanges, filters.ratings, statusSelected])

  // only run on mount
  useEffect(() => {
    handleGetListProducts()
  }, [])

  const [sortValue, setSortValue] = useState<SortOptionKey>('Mới nhất')

  const sortOptions: Record<SortOptionKey, string> = {
    'Mới nhất': 'created_at:DESC',
    'Sản phẩm nổi bật': 'sold:DESC',
    'Giá: Tăng dần': 'price:ASC',
    'Giá: Giảm dần': 'price:DESC',
    'Tên: A-Z': 'name:ASC'
  }

  const handleChange = (event: SelectChangeEvent<SortOptionKey>) => {
    const selectedValue = event.target.value as SortOptionKey
    setSortValue(selectedValue)
    const sortApiValue = sortOptions[selectedValue]
    updateSortBy(sortApiValue)
  }

  return (
    <>
      {loading && <Spinner />}
      <Box
        sx={{
          mx: 'auto',
          backgroundColor: theme.palette.background.paper,
          minHeight: '100vh',
          width: '80%'
        }}
      >
        {/* Banner Section */}
        <Box
          sx={{
            width: '100%',
            height: 'auto',
            mb: 10,
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 2,
            boxShadow: theme.shadows[2],
            cursor: 'pointer'
          }}
          onClick={() => handleNavigateProduct()}
        >
          <img
            src='/images/product-banner.jpg'
            alt={t('banner_alt')}
            style={{
              width: '100%',
              height: 'auto',
              objectFit: 'cover'
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 5 }}>
          <Typography variant='h4' component='h1' fontWeight='bold' mb={1} sx={{ justifyContent: 'flex-start' }}>
            {t('all-product')}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'flex-end', mb: 5 }}>
            <Typography variant='body1'>{t('sort')}</Typography>
            <FormControl sx={{ minWidth: 200 }}>
              <Select
                value={sortValue}
                onChange={handleChange}
                displayEmpty
                renderValue={selected => <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>{selected}</Box>}
                MenuProps={{
                  anchorOrigin: {
                    vertical: 'bottom',
                    horizontal: 'left'
                  },
                  transformOrigin: {
                    vertical: 'top',
                    horizontal: 'left'
                  }
                }}
              >
                <MenuItem value='Mới nhất'>{t('newest')}</MenuItem>
                <MenuItem value='Sản phẩm nổi bật'>{t('top-trending')}</MenuItem>
                <MenuItem value='Giá: Tăng dần'>{t('price-asc')}</MenuItem>
                <MenuItem value='Giá: Giảm dần'>{t('price-desc')}</MenuItem>
                <MenuItem value='Tên: A-Z'>{t('name-asc')}</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        {/* Main Content with Filter and Products in Two Columns */}
        <Grid container spacing={3} sx={{ flexGrow: 1 }}>
          {/* Filter Sidebar (Left Column) */}
          <Grid item xs={12} md={3}>
            <FilterAccordion />
          </Grid>

          {/* Products Grid (Right Column) */}
          <Grid item xs={12} md={9} sx={{ flexGrow: 1 }}>
            <Box sx={{ width: '100%' }}>
              <Grid container spacing={3} justifyContent='flex-start'>
                {productsPublic?.data?.length > 0 ? (
                  productsPublic.data.map((item: TProduct) => (
                    <Grid item key={item.id} xs={12} sm={6} md={4} lg={3}>
                      <CardProduct item={item} />
                    </Grid>
                  ))
                ) : (
                  <Grid item xs={12}>
                    <Typography>{t('no-products-found')}</Typography>
                  </Grid>
                )}
              </Grid>
            </Box>

            {/* Pagination */}
            <Box sx={{ mt: 4, mb: 4 }}>
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
        </Grid>
      </Box>
    </>
  )
}

export default ProductPage
