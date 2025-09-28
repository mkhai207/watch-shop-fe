import { ChevronLeft, ChevronRight, ArrowForward } from '@mui/icons-material'
import { Box, Button, Container, Grid, IconButton, Typography, useTheme, Card, CardContent, Chip } from '@mui/material'
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
  const [isLoaded, setIsLoaded] = useState(false)

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
    setIsLoaded(true)
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
          backgroundColor: 'background.default',
          scrollBehavior: 'smooth',
          '& *': {
            scrollBehavior: 'smooth'
          }
        }}
      >
        {/* Hero Section */}
        <Box
          sx={{
            height: '100vh',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            px: { xs: 2, sm: 3, lg: 4 }
          }}
        >
          <Container maxWidth='lg'>
            <Box
              textAlign='center'
              sx={{
                opacity: isLoaded ? 1 : 0,
                transform: isLoaded ? 'translateY(0)' : 'translateY(50px)',
                transition: 'all 0.8s ease-out'
              }}
            >
              <Typography
                variant='h2'
                component='h1'
                sx={{
                  fontWeight: 'bold',
                  color: 'text.primary',
                  mb: 3,
                  fontSize: { xs: '2.5rem', md: '4rem', lg: '5rem' },
                  lineHeight: 1.2
                }}
              >
                Thời gian hoàn hảo
                <br />
                <Box component='span' sx={{ color: 'primary.main' }}>
                  bắt đầu từ đây
                </Box>
              </Typography>

              <Typography
                variant='h6'
                sx={{
                  color: 'text.secondary',
                  mb: 4,
                  maxWidth: '600px',
                  mx: 'auto',
                  fontSize: { xs: '1rem', md: '1.25rem' },
                  lineHeight: 1.6
                }}
              >
                Khám phá bộ sưu tập đồng hồ cao cấp với thiết kế tinh tế, chất lượng vượt trội và phong cách đẳng cấp
                dành cho những người sành điệu.
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  variant='contained'
                  size='large'
                  endIcon={<ArrowForward />}
                  onClick={handleNavigateProduct}
                  sx={{
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: 2,
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                      transform: 'translateY(-2px)',
                      boxShadow: 4
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Khám phá bộ sưu tập
                </Button>
                <Button
                  variant='outlined'
                  size='large'
                  sx={{
                    borderColor: 'primary.main',
                    color: 'primary.main',
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: 2,
                    '&:hover': {
                      backgroundColor: 'primary.main',
                      color: 'primary.contrastText',
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Tìm hiểu thêm
                </Button>
              </Box>
            </Box>
          </Container>
        </Box>

        {/* Featured Collection Section */}
        <Box
          sx={{
            py: { xs: 6, sm: 8, md: 10, lg: 12 },
            px: { xs: 2, sm: 3, lg: 4 },
            backgroundColor: 'background.default'
          }}
        >
          <Container maxWidth='lg'>
            <Box
              sx={{
                position: 'relative',
                height: { xs: 300, md: 500 },
                borderRadius: 3,
                overflow: 'hidden',
                mb: 8,
                boxShadow: 3,
                cursor: 'pointer',
                backgroundColor: 'background.default',
                '&:hover': {
                  transform: 'scale(1.02)',
                  transition: 'transform 0.3s ease'
                }
              }}
              onClick={handleNavigateProduct}
            >
              <Box
                component='img'
                src='/images/luxury-watch-collection-display-with-elegant-light.jpg'
                alt='Featured Collection'
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                  p: 4,
                  color: 'white'
                }}
              >
                <Typography variant='h4' fontWeight='bold' sx={{ mb: 1 }}>
                  Bộ sưu tập mới 2024
                </Typography>
                <Typography variant='h6' sx={{ opacity: 0.9 }}>
                  Thiết kế độc quyền, chất lượng vượt trội
                </Typography>
              </Box>
            </Box>
          </Container>
        </Box>

        {/* Featured Watches Gallery */}
        <Box
          sx={{
            py: { xs: 6, sm: 8, md: 10, lg: 12 },
            px: { xs: 2, sm: 3, lg: 4 },
            backgroundColor: 'background.default'
          }}
        >
          <Container maxWidth='lg'>
            <Box textAlign='center' mb={6}>
              <Typography variant='h3' component='h2' fontWeight='bold' sx={{ mb: 2 }}>
                Bộ sưu tập đồng hồ cao cấp
              </Typography>
              <Typography variant='h6' color='text.secondary' sx={{ maxWidth: '600px', mx: 'auto' }}>
                Khám phá những chiếc đồng hồ đẳng cấp từ các thương hiệu danh tiếng thế giới
              </Typography>
            </Box>

            <Grid container spacing={4} mb={8}>
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    position: 'relative',
                    height: { xs: 300, md: 400 },
                    borderRadius: 3,
                    overflow: 'hidden',
                    boxShadow: 3,
                    cursor: 'pointer',
                    backgroundColor: 'background.default',
                    '&:hover': {
                      transform: 'scale(1.02)',
                      transition: 'transform 0.3s ease'
                    }
                  }}
                  onClick={handleNavigateProduct}
                >
                  <Box
                    component='img'
                    src='/images/luxury-rolex-submariner.png'
                    alt='Rolex Submariner'
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                      p: 3,
                      color: 'white'
                    }}
                  >
                    <Typography variant='h5' fontWeight='bold' sx={{ mb: 1 }}>
                      Rolex Submariner
                    </Typography>
                    <Typography variant='body1' sx={{ opacity: 0.9 }}>
                      Biểu tượng của sự sang trọng và độ bền
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    position: 'relative',
                    height: { xs: 300, md: 400 },
                    borderRadius: 3,
                    overflow: 'hidden',
                    boxShadow: 3,
                    cursor: 'pointer',
                    backgroundColor: 'background.default',
                    '&:hover': {
                      transform: 'scale(1.02)',
                      transition: 'transform 0.3s ease'
                    }
                  }}
                  onClick={handleNavigateProduct}
                >
                  <Box
                    component='img'
                    src='/images/cartier-tank-luxury-watch.jpg'
                    alt='Cartier Tank'
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                      p: 3,
                      color: 'white'
                    }}
                  >
                    <Typography variant='h5' fontWeight='bold' sx={{ mb: 1 }}>
                      Cartier Tank
                    </Typography>
                    <Typography variant='body1' sx={{ opacity: 0.9 }}>
                      Thiết kế cổ điển với phong cách Pháp tinh tế
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    position: 'relative',
                    height: { xs: 300, md: 400 },
                    borderRadius: 3,
                    overflow: 'hidden',
                    boxShadow: 3,
                    cursor: 'pointer',
                    backgroundColor: 'background.default',
                    '&:hover': {
                      transform: 'scale(1.02)',
                      transition: 'transform 0.3s ease'
                    }
                  }}
                  onClick={handleNavigateProduct}
                >
                  <Box
                    component='img'
                    src='/images/omega-speedmaster-professional-watch.jpg'
                    alt='Omega Speedmaster'
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                      p: 3,
                      color: 'white'
                    }}
                  >
                    <Typography variant='h5' fontWeight='bold' sx={{ mb: 1 }}>
                      Omega Speedmaster
                    </Typography>
                    <Typography variant='body1' sx={{ opacity: 0.9 }}>
                      Đồng hồ của các phi hành gia NASA
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    position: 'relative',
                    height: { xs: 300, md: 400 },
                    borderRadius: 3,
                    overflow: 'hidden',
                    boxShadow: 3,
                    cursor: 'pointer',
                    backgroundColor: 'background.default',
                    '&:hover': {
                      transform: 'scale(1.02)',
                      transition: 'transform 0.3s ease'
                    }
                  }}
                  onClick={handleNavigateProduct}
                >
                  <Box
                    sx={{
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
                      color: 'white'
                    }}
                  >
                    <Typography variant='h3' sx={{ mb: 2 }}>
                      🕰️
                    </Typography>
                    <Typography variant='h4' fontWeight='bold' sx={{ mb: 2 }}>
                      Khám phá thêm
                    </Typography>
                    <Typography variant='h6' sx={{ opacity: 0.9, textAlign: 'center' }}>
                      Hàng trăm mẫu đồng hồ cao cấp đang chờ bạn
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* Features Section */}
        <Box
          sx={{
            py: { xs: 6, sm: 8, md: 10, lg: 12 },
            px: { xs: 2, sm: 3, lg: 4 },
            backgroundColor: 'grey.50'
          }}
        >
          <Container maxWidth='lg'>
            <Box textAlign='center' mb={6}>
              <Typography variant='h3' component='h2' fontWeight='bold' sx={{ mb: 2, color: 'text.primary' }}>
                Tại sao chọn CHRONOS?
              </Typography>
              <Typography variant='h6' color='text.secondary' sx={{ maxWidth: '600px', mx: 'auto' }}>
                Chúng tôi cam kết mang đến những sản phẩm chất lượng cao nhất với dịch vụ tận tâm
              </Typography>
            </Box>

            <Grid container spacing={4}>
              {[
                {
                  title: 'Chất lượng cao cấp',
                  description: 'Mỗi chiếc đồng hồ đều được tuyển chọn kỹ lưỡng từ các thương hiệu uy tín',
                  icon: '⭐'
                },
                {
                  title: 'Bảo hành toàn diện',
                  description: 'Chế độ bảo hành lên đến 5 năm cùng dịch vụ hậu mãi chuyên nghiệp',
                  icon: '🛡️'
                },
                {
                  title: 'Giao hàng nhanh chóng',
                  description: 'Giao hàng miễn phí toàn quốc trong vòng 24h với đóng gói cao cấp',
                  icon: '🚚'
                }
              ].map((feature, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <Card
                    sx={{
                      height: '100%',
                      p: 3,
                      textAlign: 'center',
                      borderRadius: 3,
                      border: '1px solid',
                      borderColor: 'grey.200',
                      backgroundColor: 'background.default',
                      '&:hover': {
                        boxShadow: 4,
                        transform: 'translateY(-4px)',
                        transition: 'all 0.3s ease'
                      }
                    }}
                  >
                    <CardContent>
                      <Typography variant='h3' sx={{ mb: 2 }}>
                        {feature.icon}
                      </Typography>
                      <Typography variant='h5' fontWeight='600' sx={{ mb: 2 }}>
                        {feature.title}
                      </Typography>
                      <Typography variant='body1' color='text.secondary'>
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        {/* Best Sellers Section */}
        <Box
          sx={{
            py: { xs: 6, sm: 8, md: 10, lg: 12 },
            px: { xs: 2, sm: 3, lg: 4 },
            backgroundColor: 'background.default'
          }}
        >
          <Container maxWidth='lg'>
            <Box textAlign='center' mb={6}>
              <Typography variant='h3' component='h2' fontWeight='bold' sx={{ mb: 2 }}>
                {t('best-seller')}
              </Typography>
              <Typography variant='h6' color='text.secondary' sx={{ fontStyle: 'italic' }}>
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
                  backgroundColor: 'white',
                  boxShadow: 2,
                  '&:hover': {
                    backgroundColor: 'grey.100',
                    transform: 'translateY(-50%) scale(1.1)'
                  },
                  transition: 'all 0.3s ease'
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
                  backgroundColor: 'white',
                  boxShadow: 2,
                  '&:hover': {
                    backgroundColor: 'grey.100',
                    transform: 'translateY(-50%) scale(1.1)'
                  },
                  transition: 'all 0.3s ease'
                }}
                onClick={nextSlide}
              >
                <ChevronRight />
              </IconButton>

              {/* Products Grid */}
              <Grid container spacing={3}>
                {displayedProducts.length > 0 ? (
                  displayedProducts.map((item: TProduct) => (
                    <Grid item key={item.id} xs={12} sm={6} md={3}>
                      <CardProduct item={item} />
                    </Grid>
                  ))
                ) : (
                  <Grid item xs={12}>
                    <Typography textAlign='center' variant='h6' color='text.secondary'>
                      {t('no_products')}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>

            {/* Pagination Dots */}
            <Box display='flex' justifyContent='center' gap={1} mt={4}>
              {Array.from({ length: totalPages }).map((_, index) => (
                <Box
                  key={index}
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: currentSlide === index ? 'primary.main' : 'grey.300',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: currentSlide === index ? 'primary.dark' : 'grey.400',
                      transform: 'scale(1.2)'
                    }
                  }}
                  onClick={() => setCurrentSlide(index)}
                />
              ))}
            </Box>

            {/* View More Button */}
            <Box textAlign='center' mt={6}>
              <Button
                variant='outlined'
                size='large'
                endIcon={<ArrowForward />}
                onClick={handleNavigateProduct}
                sx={{
                  px: 6,
                  py: 2,
                  fontSize: '1.1rem',
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: 2,
                  borderWidth: 2,
                  '&:hover': {
                    borderWidth: 2,
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    transform: 'translateY(-2px)',
                    boxShadow: 4
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                {t('view_more')}
              </Button>
            </Box>
          </Container>
        </Box>

        {/* You May Like Section */}
        {user && user?.id && productFavourite.data.length > 0 && (
          <Box
            sx={{
              py: { xs: 6, sm: 8, md: 10, lg: 12 },
              px: { xs: 2, sm: 3, lg: 4 },
              backgroundColor: 'background.default'
            }}
          >
            <Container maxWidth='lg'>
              <Box textAlign='center' mb={6}>
                <Typography variant='h3' component='h2' fontWeight='bold' sx={{ mb: 2 }}>
                  {t('you-may-like')}
                </Typography>
                <Chip label='Dành riêng cho bạn' color='primary' variant='outlined' sx={{ fontWeight: 600 }} />
              </Box>

              <Grid container spacing={3}>
                {productFavourite.data.map((product: TProduct) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                    <CardProduct item={product} />
                  </Grid>
                ))}
              </Grid>
            </Container>
          </Box>
        )}

        {/* CTA Section */}
        <Box
          sx={{
            py: { xs: 6, sm: 8, md: 10, lg: 12 },
            px: { xs: 2, sm: 3, lg: 4 },
            backgroundColor: 'primary.main',
            color: 'primary.contrastText'
          }}
        >
          <Container maxWidth='lg'>
            <Box textAlign='center'>
              <Typography variant='h3' component='h2' fontWeight='bold' sx={{ mb: 3 }}>
                Sẵn sàng tìm kiếm chiếc đồng hồ hoàn hảo?
              </Typography>
              <Typography variant='h6' sx={{ mb: 4, opacity: 0.9, maxWidth: '600px', mx: 'auto' }}>
                Hãy để chúng tôi giúp bạn tìm được chiếc đồng hồ phù hợp nhất với phong cách và cá tính của bạn.
              </Typography>
              <Button
                variant='contained'
                size='large'
                endIcon={<ArrowForward />}
                onClick={handleNavigateProduct}
                sx={{
                  backgroundColor: 'white',
                  color: 'primary.main',
                  px: 6,
                  py: 2,
                  fontSize: '1.1rem',
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: 'grey.100',
                    transform: 'translateY(-2px)',
                    boxShadow: 4
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Bắt đầu mua sắm
              </Button>
            </Box>
          </Container>
        </Box>
      </Box>
    </>
  )
}

export default HomePage
