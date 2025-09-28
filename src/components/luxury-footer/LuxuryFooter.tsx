import React from 'react'
import { Box, Container, Grid, Typography, Link, IconButton, Divider, useTheme } from '@mui/material'
import { Facebook, Instagram, Twitter, YouTube, Phone, Email, LocationOn } from '@mui/icons-material'
import { useRouter } from 'next/router'
import Image from 'next/image'

const LuxuryFooter: React.FC = () => {
  const theme = useTheme()
  const router = useRouter()

  const handleLinkClick = (href: string) => {
    router.push(href)
  }

  return (
    <Box
      component='footer'
      sx={{
        backgroundColor: 'grey.100',
        py: 6,
        mt: 'auto'
      }}
    >
      <Container maxWidth='lg'>
        <Grid container spacing={4}>
          {/* Company Info */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  backgroundColor: 'primary.main',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 1
                }}
              >
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    border: '2px solid',
                    borderColor: 'primary.contrastText',
                    borderRadius: '50%'
                  }}
                />
              </Box>
              <Typography variant='h6' fontWeight='bold' color='text.primary'>
                CHRONOS
              </Typography>
            </Box>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 3, lineHeight: 1.6 }}>
              Nơi thời gian trở nên tinh tế. Chúng tôi cam kết mang đến những chiếc đồng hồ cao cấp với thiết kế tinh
              tế, chất lượng vượt trội và phong cách đẳng cấp dành cho những người sành điệu.
            </Typography>

            {/* Social Media */}
            <Box>
              <Typography variant='subtitle2' fontWeight='600' sx={{ mb: 2 }}>
                Kết nối với chúng tôi
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton
                  size='small'
                  sx={{
                    color: 'text.secondary',
                    border: '1px solid',
                    borderColor: 'grey.300',
                    '&:hover': {
                      backgroundColor: 'primary.main',
                      color: 'primary.contrastText',
                      borderColor: 'primary.main'
                    }
                  }}
                >
                  <Facebook fontSize='small' />
                </IconButton>
                <IconButton
                  size='small'
                  sx={{
                    color: 'text.secondary',
                    border: '1px solid',
                    borderColor: 'grey.300',
                    '&:hover': {
                      backgroundColor: 'primary.main',
                      color: 'primary.contrastText',
                      borderColor: 'primary.main'
                    }
                  }}
                >
                  <Instagram fontSize='small' />
                </IconButton>
                <IconButton
                  size='small'
                  sx={{
                    color: 'text.secondary',
                    border: '1px solid',
                    borderColor: 'grey.300',
                    '&:hover': {
                      backgroundColor: 'primary.main',
                      color: 'primary.contrastText',
                      borderColor: 'primary.main'
                    }
                  }}
                >
                  <Twitter fontSize='small' />
                </IconButton>
                <IconButton
                  size='small'
                  sx={{
                    color: 'text.secondary',
                    border: '1px solid',
                    borderColor: 'grey.300',
                    '&:hover': {
                      backgroundColor: 'primary.main',
                      color: 'primary.contrastText',
                      borderColor: 'primary.main'
                    }
                  }}
                >
                  <YouTube fontSize='small' />
                </IconButton>
              </Box>
            </Box>
          </Grid>

          {/* Products */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant='subtitle1' fontWeight='600' sx={{ mb: 2 }}>
              Sản phẩm
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link
                component='button'
                variant='body2'
                color='text.secondary'
                onClick={() => handleLinkClick('/product?category=luxury')}
                sx={{
                  textAlign: 'left',
                  textDecoration: 'none',
                  '&:hover': {
                    color: 'primary.light',
                    textDecoration: 'none'
                  }
                }}
              >
                Đồng hồ cao cấp
              </Link>
              <Link
                component='button'
                variant='body2'
                color='text.secondary'
                onClick={() => handleLinkClick('/product?category=sport')}
                sx={{
                  textAlign: 'left',
                  textDecoration: 'none',
                  '&:hover': {
                    color: 'primary.light',
                    textDecoration: 'none'
                  }
                }}
              >
                Đồng hồ thể thao
              </Link>
              <Link
                component='button'
                variant='body2'
                color='text.secondary'
                onClick={() => handleLinkClick('/product?category=classic')}
                sx={{
                  textAlign: 'left',
                  textDecoration: 'none',
                  '&:hover': {
                    color: 'primary.light',
                    textDecoration: 'none'
                  }
                }}
              >
                Đồng hồ cổ điển
              </Link>
              <Link
                component='button'
                variant='body2'
                color='text.secondary'
                onClick={() => handleLinkClick('/product?category=smart')}
                sx={{
                  textAlign: 'left',
                  textDecoration: 'none',
                  '&:hover': {
                    color: 'primary.light',
                    textDecoration: 'none'
                  }
                }}
              >
                Đồng hồ thông minh
              </Link>
            </Box>
          </Grid>

          {/* Support */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant='subtitle1' fontWeight='600' sx={{ mb: 2 }}>
              Hỗ trợ
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link
                component='button'
                variant='body2'
                color='text.secondary'
                onClick={() => handleLinkClick('/support')}
                sx={{
                  textAlign: 'left',
                  textDecoration: 'none',
                  '&:hover': {
                    color: 'primary.light',
                    textDecoration: 'none'
                  }
                }}
              >
                Trung tâm hỗ trợ
              </Link>
              <Link
                component='button'
                variant='body2'
                color='text.secondary'
                onClick={() => handleLinkClick('/warranty')}
                sx={{
                  textAlign: 'left',
                  textDecoration: 'none',
                  '&:hover': {
                    color: 'primary.light',
                    textDecoration: 'none'
                  }
                }}
              >
                Chính sách bảo hành
              </Link>
              <Link
                component='button'
                variant='body2'
                color='text.secondary'
                onClick={() => handleLinkClick('/shipping')}
                sx={{
                  textAlign: 'left',
                  textDecoration: 'none',
                  '&:hover': {
                    color: 'primary.light',
                    textDecoration: 'none'
                  }
                }}
              >
                Vận chuyển
              </Link>
              <Link
                component='button'
                variant='body2'
                color='text.secondary'
                onClick={() => handleLinkClick('/returns')}
                sx={{
                  textAlign: 'left',
                  textDecoration: 'none',
                  '&:hover': {
                    color: 'primary.light',
                    textDecoration: 'none'
                  }
                }}
              >
                Đổi trả
              </Link>
            </Box>
          </Grid>

          {/* Contact */}
          <Grid item xs={12} md={4}>
            <Typography variant='subtitle1' fontWeight='600' sx={{ mb: 2 }}>
              Liên hệ
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Phone sx={{ color: 'primary.main', fontSize: 20 }} />
                <Typography variant='body2' color='text.secondary'>
                  Hotline: 1900 1234
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Email sx={{ color: 'primary.main', fontSize: 20 }} />
                <Typography variant='body2' color='text.secondary'>
                  Email: info@chronos.vn
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <LocationOn sx={{ color: 'primary.main', fontSize: 20, mt: 0.2 }} />
                <Typography variant='body2' color='text.secondary'>
                  Địa chỉ: 123 Đường ABC, Quận 1, TP.HCM
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Divider */}
        <Divider sx={{ my: 4 }} />

        {/* Copyright */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            textAlign: { xs: 'center', md: 'left' }
          }}
        >
          <Typography variant='body2' color='text.secondary'>
            © {new Date().getFullYear()} CHRONOS. Tất cả quyền được bảo lưu.
          </Typography>
          <Box sx={{ display: 'flex', gap: 3, mt: { xs: 2, md: 0 } }}>
            <Link
              component='button'
              variant='body2'
              color='text.secondary'
              onClick={() => handleLinkClick('/terms')}
              sx={{
                textDecoration: 'none',
                '&:hover': {
                  color: 'primary.main',
                  textDecoration: 'none'
                }
              }}
            >
              Điều khoản sử dụng
            </Link>
            <Link
              component='button'
              variant='body2'
              color='text.secondary'
              onClick={() => handleLinkClick('/privacy')}
              sx={{
                textDecoration: 'none',
                '&:hover': {
                  color: 'primary.main',
                  textDecoration: 'none'
                }
              }}
            >
              Chính sách bảo mật
            </Link>
            <Link
              component='button'
              variant='body2'
              color='text.secondary'
              onClick={() => handleLinkClick('/sitemap')}
              sx={{
                textDecoration: 'none',
                '&:hover': {
                  color: 'primary.main',
                  textDecoration: 'none'
                }
              }}
            >
              Sitemap
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  )
}

export default LuxuryFooter
