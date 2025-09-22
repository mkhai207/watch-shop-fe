import { ChevronLeft, ChevronRight } from '@mui/icons-material'
import { Box, Button, Container, Grid, IconButton, Typography, useTheme } from '@mui/material'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import Spinner from 'src/components/spinner'
import { ROUTE_CONFIG } from 'src/configs/route'
import { useAuth } from 'src/hooks/useAuth'
import { getAllProductsPublic, getProductRecommend } from 'src/services/product'
import { TProduct } from 'src/types/product'
import CardProduct from '../../../components/card-product/CardProduct'
import ChatBot from 'src/views/layouts/components/chatBot/ChatBot'

type TProps = {}

const HomePage: NextPage<TProps> = () => {
  const theme = useTheme()
  const { t } = useTranslation()
  const router = useRouter()
  const { user } = useAuth()

  const [currentSlide, setCurrentSlide] = useState(0)
  const totalPages = 5
  const productsPerPage = 4

  const [productFavourite, setProductFavourite] = useState<{
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

  const handleNavigateProduct = () => {
    router.push(`${ROUTE_CONFIG.PRODUCT}`)
  }

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % totalPages)
  }

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + totalPages) % totalPages)
  }

  const [loading, setLoading] = useState(false)
  const [newProducts, setNewProducts] = useState<TProduct[]>([])

  const formatFiltersForAPI = (customLimit?: number, customSort?: string) => {
    const params: Record<string, any> = {
      page: 1,
      limit: customLimit || 20,
      sort: customSort || 'created_at:DESC'
    }

    return params
  }

  const handleGetListNewProducts = async () => {
    try {
      setLoading(true)
      const queryParams = formatFiltersForAPI(20, 'sold:DESC')
      const response = await getAllProductsPublic({ params: queryParams })

      if (response.status === 'success') {
        setNewProducts(response?.data || [])
        toast.success(t('load_new_products_success'))
      } else {
        toast.error(response.message || t('load_products_error'))
      }
    } catch (error: any) {
      toast.error(error?.message || t('load_products_error'))
    } finally {
      setLoading(false)
    }
  }

  const handleGetProductRecommend = async () => {
    try {
      setLoading(true)

      const response = await getProductRecommend(user?.id.toString() || '')
      console.log('response', response)

      if (response.status === 'success') {
        setProductFavourite({
          data: response.data || [],
          total: response.data.total || 0,
          totalPages: response.data.totalPages || 0,
          currentPage: response.data.currentPage || 1
        })
        console.log(productFavourite)
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

  useEffect(() => {
    handleGetListNewProducts()
  }, [])

  useEffect(() => {
    handleGetProductRecommend()
  }, [])

  const displayedProducts = newProducts.slice(currentSlide * productsPerPage, (currentSlide + 1) * productsPerPage)

  return (
    <>
      {loading && <Spinner />}
      <Box
        sx={{
          backgroundColor: theme.palette.background.paper,
          height: '100%',
          width: '100%',
          maxWidth: '100vw',
          overflow: 'hidden'
        }}
      >
        {/* Banner Section */}
        <Box
          sx={{
            width: '100vw',
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
            src='/images/home-banner.png'
            alt={t('banner_alt')}
            style={{
              width: '100%',
              height: 'auto',
              objectFit: 'cover'
            }}
          />
        </Box>

        <Container maxWidth='lg' sx={{ py: 4 }}>
          {/* Header */}
          <Box textAlign='center' mb={4}>
            <Typography variant='h4' component='h1' fontWeight='bold' mb={1}>
              {t('best-seller')}
            </Typography>
            <Typography variant='body1' color='text.secondary' fontStyle='italic'>
              {t('top-trending')}
            </Typography>
          </Box>

          {/* Product Carousel */}
          <Box position='relative'>
            {/* Navigation Arrows */}
            <IconButton
              sx={{
                position: 'absolute',
                left: -20,
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 2,
                bgcolor: 'white',
                boxShadow: 1,
                '&:hover': { bgcolor: 'grey.100' }
              }}
              onClick={prevSlide}
            >
              <ChevronLeft />
            </IconButton>

            <IconButton
              sx={{
                position: 'absolute',
                right: -20,
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 2,
                bgcolor: 'white',
                boxShadow: 1,
                '&:hover': { bgcolor: 'grey.100' }
              }}
              onClick={nextSlide}
            >
              <ChevronRight />
            </IconButton>

            {/* Products Grid */}
            <Grid container spacing={2}>
              {displayedProducts.length > 0 ? (
                displayedProducts.map((item: TProduct) => (
                  <Grid item key={item.id} xs={12} sm={6} md={3}>
                    <CardProduct item={item} />
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Typography>{t('no_products')}</Typography>
                </Grid>
              )}
            </Grid>
          </Box>

          {/* Pagination Dots */}
          <Box display='flex' justifyContent='center' gap={1} mt={3}>
            {Array.from({ length: totalPages }).map((_, index) => (
              <Box
                key={index}
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: currentSlide === index ? 'primary.main' : 'grey.300',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </Box>

          {/* View More Button */}
          <Box textAlign='center' mt={4}>
            <Button
              variant='outlined'
              size='large'
              sx={{
                borderRadius: 0,
                px: 4,
                py: 1,
                textTransform: 'none',
                fontWeight: 'normal'
              }}
              onClick={() => handleNavigateProduct()}
            >
              {t('view_more')} →
            </Button>
          </Box>
        </Container>

        {/* You may like */}
        {user && user?.id && (
          <Container maxWidth='lg' style={{ padding: '20px' }}>
            <Box textAlign='center' mb={7}>
              <Typography variant='h4' component='h1' fontWeight='bold' mb={1}>
                {t('you-may-like')}
              </Typography>
            </Box>

            <Grid container spacing={3}>
              {productFavourite.data.map((product: TProduct) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                  <CardProduct item={product} />
                </Grid>
              ))}
            </Grid>
          </Container>
        )}
      </Box>
    </>
  )
}

export default HomePage
