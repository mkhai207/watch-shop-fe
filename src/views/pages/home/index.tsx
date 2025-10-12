import { ChevronLeft, ChevronRight, ArrowForward } from '@mui/icons-material'
import { Box, Button, Container, Grid, IconButton, Typography, useTheme, Card, CardContent, Chip } from '@mui/material'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { ROUTE_CONFIG } from 'src/configs/route'
import { useAuth } from 'src/hooks/useAuth'
import { getProductRecommend } from 'src/services/product'
import { getWatches } from 'src/services/watch'
import { getBrands } from 'src/services/brand'
import { TBrand } from 'src/types/brand'
import { TProduct } from 'src/types/product'
import { TWatch } from 'src/types/watch'
import CardProduct from '../../../components/card-product/CardProduct'

type TProps = {}

const HomePage: NextPage<TProps> = () => {
  const theme = useTheme()
  const { t } = useTranslation()
  const router = useRouter()
  const { user } = useAuth()

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

  const [brands, setBrands] = useState<TBrand[]>([])
  const [brandSlide, setBrandSlide] = useState(0)
  const [dragStartX, setDragStartX] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isBrandTransitioning, setIsBrandTransitioning] = useState(true)
  const [brandAutoPausedUntil, setBrandAutoPausedUntil] = useState(0)
  const [watches, setWatches] = useState<TWatch[]>([])
  const [watchSlide, setWatchSlide] = useState(0)
  const [watchDragStartX, setWatchDragStartX] = useState<number | null>(null)
  const [isWatchDragging, setIsWatchDragging] = useState(false)
  const [isWatchTransitioning, setIsWatchTransitioning] = useState(true)
  const [watchAutoPausedUntil, setWatchAutoPausedUntil] = useState(0)

  const handleGetBrands = async () => {
    try {
      const response = await getBrands()
      // API returns { brands: { count, rows } }
      const rows: TBrand[] = response?.brands?.rows || []
      // Prefer visible brands (del_flag === '0') first
      const visible = rows.filter(item => item.del_flag !== '1')
      setBrands(visible.length ? visible : rows)
    } catch (error: any) {
      // silent fail to avoid blocking homepage
    }
  }

  const handleGetWatches = async () => {
    try {
      const response = await getWatches()
      const items: TWatch[] = (response as any)?.watches?.items || []
      const visible = items.filter(item => item.del_flag !== '1')
      setWatches(visible.length ? visible : items)
    } catch (error: any) {}
  }

  const handleGetProductRecommend = async () => {
    try {
      const response = await getProductRecommend(user?.id.toString() || '')

      if (response.status === 'success') {
        setProductFavourite({
          data: response.data || [],
          total: response.data.total || 0,
          totalPages: response.data.totalPages || 0,
          currentPage: response.data.currentPage || 1
        })
      }
    } catch (error: any) {
      // Silent fail for recommendation API
    }
  }

  useEffect(() => {
    setIsLoaded(true)
    handleGetBrands()
    handleGetWatches()
  }, [])

  useEffect(() => {
    if (user?.id) {
      handleGetProductRecommend()
    }
  }, [user?.id])

  // Auto-advance brands carousel by 1, loop infinitely (smooth)
  useEffect(() => {
    const len = brands?.length || 0
    if (len <= 1) return
    const timer = setInterval(() => {
      if (Date.now() >= brandAutoPausedUntil) {
        setIsBrandTransitioning(true)
        setBrandSlide(prev => prev + 1)
      }
    }, 4000)
    return () => clearInterval(timer)
  }, [brands, brandAutoPausedUntil])

  // Auto-advance watches carousel by 1, loop infinitely (smooth)
  useEffect(() => {
    const len = watches?.length || 0
    if (len <= 1) return
    const timer = setInterval(() => {
      if (Date.now() >= watchAutoPausedUntil) {
        setIsWatchTransitioning(true)
        setWatchSlide(prev => prev + 1)
      }
    }, 4000)
    return () => clearInterval(timer)
  }, [watches, watchAutoPausedUntil])

  const handleBrandDragStart = (clientX: number) => {
    setDragStartX(clientX)
    setIsDragging(true)
    setBrandAutoPausedUntil(Date.now() + 4000)
  }

  const handleBrandDragEnd = (clientX: number) => {
    if (dragStartX === null) return
    const delta = clientX - dragStartX
    const threshold = 40
    const len = brands?.length || 0
    if (len > 0) {
      if (delta > threshold) {
        if (brandSlide === 0) {
          setIsBrandTransitioning(false)
          setBrandSlide(len)
          setTimeout(() => {
            setIsBrandTransitioning(true)
            setBrandSlide(len - 1)
          }, 0)
        } else {
          setIsBrandTransitioning(true)
          setBrandSlide(prev => prev - 1)
        }
      } else if (delta < -threshold) {
        setIsBrandTransitioning(true)
        setBrandSlide(prev => prev + 1)
      }
    }
    setDragStartX(null)
    setIsDragging(false)
  }

  const handleWatchDragStart = (clientX: number) => {
    setWatchDragStartX(clientX)
    setIsWatchDragging(true)
  }

  const handleWatchDragEnd = (clientX: number) => {
    if (watchDragStartX === null) return
    const delta = clientX - watchDragStartX
    const threshold = 40
    const len = watches?.length || 0
    if (len > 0) {
      if (delta > threshold) {
        if (watchSlide === 0) {
          setIsWatchTransitioning(false)
          setWatchSlide(len)
          setTimeout(() => {
            setIsWatchTransitioning(true)
            setWatchSlide(len - 1)
          }, 0)
        } else {
          setIsWatchTransitioning(true)
          setWatchSlide(prev => prev - 1)
        }
      } else if (delta < -threshold) {
        setIsWatchTransitioning(true)
        setWatchSlide(prev => prev + 1)
      }
    }
    setWatchDragStartX(null)
    setIsWatchDragging(false)
  }

  return (
    <>
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
                <Typography variant='h4' fontWeight='bold' sx={{ mb: 1, color: 'primary.main' }}>
                  Bộ sưu tập mới 2024
                </Typography>
                <Typography variant='h6' sx={{ opacity: 0.9, color: 'common.white' }}>
                  Thiết kế độc quyền, chất lượng vượt trội
                </Typography>
              </Box>
            </Box>
          </Container>
        </Box>

        {/* Brands Carousel - Bộ sưu tập theo từng Brand */}
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
                Khám phá các bộ sưu tập theo thương hiệu
              </Typography>
            </Box>

            {/* Carousel Slider for Brands (auto + drag + smooth) */}
            <Box
              position='relative'
              mb={8}
              onMouseDown={e => handleBrandDragStart(e.clientX)}
              onMouseUp={e => handleBrandDragEnd(e.clientX)}
              onMouseLeave={() => setIsDragging(false)}
              onTouchStart={e => handleBrandDragStart(e.touches[0].clientX)}
              onTouchEnd={e => handleBrandDragEnd(e.changedTouches[0].clientX)}
              sx={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            >
              <IconButton
                sx={{
                  position: 'absolute',
                  left: -20,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 2,
                  backgroundColor: 'white',
                  boxShadow: 2,
                  '&:hover': { backgroundColor: 'grey.100', transform: 'translateY(-50%) scale(1.1)' },
                  transition: 'all 0.3s ease'
                }}
                onClick={() => {
                  const len = brands?.length || 0
                  if (len > 0) {
                    if (brandSlide === 0) {
                      setIsBrandTransitioning(false)
                      setBrandSlide(len)
                      setTimeout(() => {
                        setIsBrandTransitioning(true)
                        setBrandSlide(len - 1)
                      }, 0)
                    } else {
                      setIsBrandTransitioning(true)
                      setBrandSlide(prev => prev - 1)
                    }
                  }
                }}
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
                  '&:hover': { backgroundColor: 'grey.100', transform: 'translateY(-50%) scale(1.1)' },
                  transition: 'all 0.3s ease'
                }}
                onClick={() => {
                  const len = brands?.length || 0
                  if (len > 0) {
                    setIsBrandTransitioning(true)
                    setBrandSlide(prev => prev + 1)
                    setBrandAutoPausedUntil(Date.now() + 4000)
                  }
                }}
              >
                <ChevronRight />
              </IconButton>

              {/* Smooth sliding track forward-only clones for perfect alignment */}
              <Box sx={{ overflow: 'hidden', position: 'relative' }}>
                <Box
                  sx={{
                    display: 'flex',
                    gap: 0,
                    transform: `translateX(-${brandSlide * (100 / 3)}%)`,
                    transition: isBrandTransitioning ? 'transform 600ms ease' : 'none'
                  }}
                  onTransitionEnd={() => {
                    const len = brands.length
                    if (len > 0) {
                      if (brandSlide >= len) {
                        setIsBrandTransitioning(false)
                        setBrandSlide(brandSlide % len)
                        setTimeout(() => setIsBrandTransitioning(true), 0)
                      } else if (brandSlide < 0) {
                        setIsBrandTransitioning(false)
                        setBrandSlide(((brandSlide % len) + len) % len)
                        setTimeout(() => setIsBrandTransitioning(true), 0)
                      }
                    }
                  }}
                >
                  {(() => {
                    const base = brands
                    const clonesHead = base.slice(0, Math.min(3, base.length))
                    const renderList = [...base, ...clonesHead]
                    if (base.length === 0) {
                      return (
                        <Box sx={{ width: '100%' }}>
                          <Typography textAlign='center' variant='h6' color='text.secondary'>
                            {t('no_products')}
                          </Typography>
                        </Box>
                      )
                    }
                    return renderList.map((brand, idx) => (
                      <Box key={`${brand.id}-${idx}`} sx={{ flex: '0 0 33.3333%', boxSizing: 'border-box', p: 1.5 }}>
                        <Box
                          sx={{
                            position: 'relative',
                            height: { xs: 260, md: 360 },
                            borderRadius: 3,
                            overflow: 'hidden',
                            boxShadow: 3,
                            cursor: 'pointer',
                            backgroundColor: 'grey.100',
                            '&:hover': { transform: 'translateY(-4px)', boxShadow: 6, transition: 'all 0.3s ease' }
                          }}
                          onClick={handleNavigateProduct}
                        >
                          <Box
                            component='img'
                            src={brand.logo_url || '/images/placeholder-brand.jpg'}
                            alt={brand.name}
                            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          <Box
                            sx={{
                              position: 'absolute',
                              inset: 0,
                              background:
                                'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.6) 70%, rgba(0,0,0,0.85) 100%)'
                            }}
                          />
                          <Box sx={{ position: 'absolute', left: 16, right: 16, bottom: 16, color: 'white' }}>
                            <Typography variant='h5' fontWeight='bold' sx={{ mb: 0.5, color: 'primary.main' }}>
                              {brand.name}
                            </Typography>
                            {!!brand.description && (
                              <Typography variant='body2' sx={{ opacity: 0.9, color: 'common.white' }}>
                                {brand.description}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </Box>
                    ))
                  })()}
                </Box>
              </Box>
              <Box display='flex' justifyContent='center' gap={1.5} mt={3}>
                {Array.from({ length: Math.max(brands?.length || 0, 1) }).map((_, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      backgroundColor:
                        (brands.length ? ((brandSlide % brands.length) + brands.length) % brands.length : 0) === idx
                          ? 'primary.main'
                          : 'grey.300',
                      cursor: 'pointer'
                    }}
                    onClick={() => setBrandSlide(idx)}
                  />
                ))}
              </Box>
            </Box>
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

        {/* Best Sellers Section - Watches Carousel */}
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

            {/* Watches smooth carousel (3 per view, step 1) */}
            <Box
              position='relative'
              onMouseDown={e => handleWatchDragStart(e.clientX)}
              onMouseUp={e => handleWatchDragEnd(e.clientX)}
              onMouseLeave={() => setIsWatchDragging(false)}
              onTouchStart={e => handleWatchDragStart(e.touches[0].clientX)}
              onTouchEnd={e => handleWatchDragEnd(e.changedTouches[0].clientX)}
              sx={{ cursor: isWatchDragging ? 'grabbing' : 'grab' }}
            >
              <IconButton
                sx={{
                  position: 'absolute',
                  left: -20,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 2,
                  backgroundColor: 'white',
                  boxShadow: 2,
                  '&:hover': { backgroundColor: 'grey.100', transform: 'translateY(-50%) scale(1.1)' },
                  transition: 'all 0.3s ease'
                }}
                onClick={() => {
                  const len = watches?.length || 0
                  if (len > 0) {
                    if (watchSlide === 0) {
                      setIsWatchTransitioning(false)
                      setWatchSlide(len)
                      setTimeout(() => {
                        setIsWatchTransitioning(true)
                        setWatchSlide(len - 1)
                      }, 0)
                    } else {
                      setIsWatchTransitioning(true)
                      setWatchSlide(prev => prev - 1)
                    }
                    setWatchAutoPausedUntil(Date.now() + 4000)
                  }
                }}
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
                  '&:hover': { backgroundColor: 'grey.100', transform: 'translateY(-50%) scale(1.1)' },
                  transition: 'all 0.3s ease'
                }}
                onClick={() => {
                  const len = watches?.length || 0
                  if (len > 0) {
                    setIsWatchTransitioning(true)
                    setWatchSlide(prev => prev + 1)
                    setWatchAutoPausedUntil(Date.now() + 4000)
                  }
                }}
              >
                <ChevronRight />
              </IconButton>

              <Box sx={{ overflow: 'hidden', position: 'relative' }}>
                <Box
                  sx={{
                    display: 'flex',
                    gap: 0,
                    transform: `translateX(-${watchSlide * (100 / 4)}%)`,
                    transition: isWatchTransitioning ? 'transform 600ms ease' : 'none'
                  }}
                  onTransitionEnd={() => {
                    const len = watches.length
                    if (len > 0) {
                      if (watchSlide >= len) {
                        setIsWatchTransitioning(false)
                        setWatchSlide(watchSlide % len)
                        setTimeout(() => setIsWatchTransitioning(true), 0)
                      } else if (watchSlide < 0) {
                        setIsWatchTransitioning(false)
                        setWatchSlide(((watchSlide % len) + len) % len)
                        setTimeout(() => setIsWatchTransitioning(true), 0)
                      }
                    }
                  }}
                >
                  {(() => {
                    const base = watches
                    const clonesHead = base.slice(0, Math.min(4, base.length))
                    const renderList = [...base, ...clonesHead]
                    if (base.length === 0) {
                      return (
                        <Box sx={{ width: '100%' }}>
                          <Typography textAlign='center' variant='h6' color='text.secondary'>
                            {t('no_products')}
                          </Typography>
                        </Box>
                      )
                    }
                    return renderList.map((watch, idx) => (
                      <Box key={`${watch.id}-${idx}`} sx={{ flex: '0 0 25%', boxSizing: 'border-box', p: 1.5 }}>
                        <CardProduct
                          item={
                            {
                              id: watch.id,
                              name: watch.name,
                              thumbnail: watch.thumbnail || '',
                              price: watch.base_price,
                              sold: watch.sold || 0
                            } as any
                          }
                        />
                      </Box>
                    ))
                  })()}
                </Box>
              </Box>

              <Box display='flex' justifyContent='center' gap={1.5} mt={3}>
                {Array.from({ length: Math.max(watches?.length || 0, 1) }).map((_, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      backgroundColor:
                        (watches.length ? ((watchSlide % watches.length) + watches.length) % watches.length : 0) === idx
                          ? 'primary.main'
                          : 'grey.300',
                      cursor: 'pointer'
                    }}
                    onClick={() => setWatchSlide(idx)}
                  />
                ))}
              </Box>
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
              <Typography variant='h3' component='h2' fontWeight='bold' sx={{ mb: 3, color: 'common.white' }}>
                Sẵn sàng tìm kiếm chiếc đồng hồ hoàn hảo?
              </Typography>
              <Typography
                variant='h6'
                sx={{ mb: 4, opacity: 0.9, maxWidth: '600px', mx: 'auto', color: 'common.white' }}
              >
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
