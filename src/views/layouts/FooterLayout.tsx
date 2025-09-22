import * as React from 'react'
import { NextPage } from 'next'
import { Box, Container, Grid, IconButton, Link, Stack, styled, Typography, useTheme, Divider } from '@mui/material'
import FacebookIcon from '@mui/icons-material/Facebook'
import InstagramIcon from '@mui/icons-material/Instagram'
import TwitterIcon from '@mui/icons-material/Twitter'
import YouTubeIcon from '@mui/icons-material/YouTube'
import PhoneIcon from '@mui/icons-material/Phone'
import EmailIcon from '@mui/icons-material/Email'
import LocationOnIcon from '@mui/icons-material/LocationOn'

type TProps = {}

const FooterContainer = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A202C' : '#2D3748',
  color: '#fff',
  paddingTop: theme.spacing(6),
  paddingBottom: theme.spacing(3),
  marginTop: 'auto'
}))

const FooterTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.125rem',
  fontWeight: 600,
  marginBottom: theme.spacing(3),
  color: '#fff'
}))

const FooterLink = styled(Link)(({ theme }) => ({
  display: 'block',
  color: '#E2E8F0',
  fontSize: '0.875rem',
  textDecoration: 'none',
  marginBottom: theme.spacing(1.5),
  transition: 'color 0.3s ease',
  '&:hover': {
    color: theme.palette.primary.main,
    textDecoration: 'none'
  }
}))

const FooterText = styled(Typography)(() => ({
  color: '#E2E8F0',
  fontSize: '0.875rem',
  lineHeight: 1.6
}))

const SocialButton = styled(IconButton)(({ theme }) => ({
  color: '#E2E8F0',
  border: '1px solid #4A5568',
  marginRight: theme.spacing(1),
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: theme.palette.primary.main,
    borderColor: theme.palette.primary.main,
    color: '#fff',
    transform: 'translateY(-2px)'
  }
}))

const ContactItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
  color: '#E2E8F0'
}))

const FooterLayout: NextPage<TProps> = () => {
  const theme = useTheme()

  return (
    <FooterContainer>
      <Container maxWidth='lg'>
        <Grid container spacing={4}>
          {/* Thông tin công ty */}
          <Grid item xs={12} md={4}>
            <FooterTitle>Fashion Store</FooterTitle>
            <FooterText sx={{ mb: 3 }}>
              Chuyên cung cấp thời trang nam nữ chất lượng cao với thiết kế hiện đại, phong cách trẻ trung và giá cả hợp
              lý. Mang đến cho bạn những trải nghiệm mua sắm tuyệt vời nhất.
            </FooterText>

            {/* Social Media */}
            <Box>
              <FooterTitle sx={{ fontSize: '1rem', mb: 2 }}>Kết nối với chúng tôi</FooterTitle>
              <Stack direction='row' spacing={1}>
                <SocialButton size='small'>
                  <FacebookIcon fontSize='small' />
                </SocialButton>
                <SocialButton size='small'>
                  <InstagramIcon fontSize='small' />
                </SocialButton>
                <SocialButton size='small'>
                  <TwitterIcon fontSize='small' />
                </SocialButton>
                <SocialButton size='small'>
                  <YouTubeIcon fontSize='small' />
                </SocialButton>
              </Stack>
            </Box>
          </Grid>

          {/* Danh mục sản phẩm */}
          <Grid item xs={12} sm={6} md={2}>
            <FooterTitle>Danh mục</FooterTitle>
            <FooterLink href='/product?category=nam'>Thời trang Nam</FooterLink>
            <FooterLink href='/product?category=nu'>Thời trang Nữ</FooterLink>
            <FooterLink href='/product?category=ao'>Áo thun</FooterLink>
            <FooterLink href='/product?category=quan'>Quần jeans</FooterLink>
            <FooterLink href='/product?category=giay'>Giày dép</FooterLink>
            <FooterLink href='/product?category=phukien'>Phụ kiện</FooterLink>
            <FooterLink href='/product?sale=true'>Sale off</FooterLink>
          </Grid>

          {/* Hỗ trợ khách hàng */}
          <Grid item xs={12} sm={6} md={2}>
            <FooterTitle>Hỗ trợ</FooterTitle>
            <FooterLink href='/huong-dan-mua-hang'>Hướng dẫn mua hàng</FooterLink>
            <FooterLink href='/huong-dan-thanh-toan'>Hướng dẫn thanh toán</FooterLink>
            <FooterLink href='/chinh-sach-doi-tra'>Chính sách đổi trả</FooterLink>
            <FooterLink href='/chinh-sach-bao-hanh'>Chính sách bảo hành</FooterLink>
            <FooterLink href='/size-chart'>Bảng size</FooterLink>
            <FooterLink href='/cham-soc-san-pham'>Chăm sóc sản phẩm</FooterLink>
          </Grid>

          {/* Thông tin liên hệ */}
          <Grid item xs={12} md={4}>
            <FooterTitle>Thông tin liên hệ</FooterTitle>

            <ContactItem>
              <LocationOnIcon sx={{ mr: 1.5, color: theme.palette.primary.main }} />
              <FooterText>123 Đường ABC, Quận 1, TP.HCM, Việt Nam</FooterText>
            </ContactItem>

            <ContactItem>
              <PhoneIcon sx={{ mr: 1.5, color: theme.palette.primary.main }} />
              <FooterText>
                Hotline: 1900 1234 (miễn phí)
                <br />
                Hỗ trợ: 0123 456 789
              </FooterText>
            </ContactItem>

            <ContactItem>
              <EmailIcon sx={{ mr: 1.5, color: theme.palette.primary.main }} />
              <FooterText>
                Email: support@fashionstore.com
                <br />
                Sale: sales@fashionstore.com
              </FooterText>
            </ContactItem>

            {/* Giờ làm việc */}
            <Box sx={{ mt: 3 }}>
              <FooterTitle sx={{ fontSize: '1rem', mb: 2 }}>Giờ làm việc</FooterTitle>
              <FooterText>
                Thứ 2 - Thứ 6: 8:00 - 22:00
                <br />
                Thứ 7 - Chủ nhật: 9:00 - 23:00
              </FooterText>
            </Box>
          </Grid>
        </Grid>

        {/* Divider */}
        <Divider sx={{ my: 4, borderColor: '#4A5568' }} />

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
          <FooterText>© {new Date().getFullYear()} Fashion Store. Tất cả quyền được bảo lưu.</FooterText>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ mt: { xs: 2, md: 0 } }}>
            <FooterLink href='/dieu-khoan-su-dung'>Điều khoản sử dụng</FooterLink>
            <FooterLink href='/chinh-sach-bao-mat'>Chính sách bảo mật</FooterLink>
            <FooterLink href='/sitemap'>Sitemap</FooterLink>
          </Stack>
        </Box>
      </Container>
    </FooterContainer>
  )
}

export default FooterLayout
