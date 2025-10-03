import { ArrowForward, CheckCircle, Favorite, Security, Watch } from '@mui/icons-material'
import { Avatar, Box, Button, Card, CardContent, Chip, Container, Grid, IconButton, Typography } from '@mui/material'
import Head from 'next/head'
import { useRouter } from 'next/router'

const AboutPage = () => {
  const router = useRouter()
  return (
    <>
      <Head>
        <title>Về chúng tôi | CHRONOS</title>
      </Head>
      <Box sx={{ backgroundColor: 'background.default' }}>
        {/* Hero */}
        <Box sx={{ pt: { xs: 8, md: 12 }, pb: { xs: 6, md: 10 }, px: { xs: 2, sm: 3, lg: 4 } }}>
          <Container maxWidth='lg'>
            <Grid container spacing={6} alignItems='center'>
              <Grid item xs={12} md={6}>
                <Typography variant='h2' fontWeight={800} sx={{ mb: 2, lineHeight: 1.2 }}>
                  Nâng tầm trải nghiệm thời gian
                </Typography>
                <Typography variant='h6' color='text.secondary' sx={{ mb: 4 }}>
                  CHRONOS là điểm đến dành cho những người yêu đồng hồ, nơi hội tụ các thương hiệu danh tiếng, dịch vụ
                  đẳng cấp và trải nghiệm mua sắm hiện đại.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button variant='contained' endIcon={<ArrowForward />} onClick={() => router.push('/product')}>
                    Khám phá sản phẩm
                  </Button>
                  <Button variant='outlined' onClick={() => router.push('/contact')}>
                    Liên hệ chúng tôi
                  </Button>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    position: 'relative',
                    height: { xs: 260, md: 380 },
                    borderRadius: 3,
                    overflow: 'hidden',
                    boxShadow: 6,
                    backgroundColor: 'grey.100'
                  }}
                >
                  <Box
                    component='img'
                    src='/luxury-watch-hero.jpg'
                    alt='CHRONOS'
                    sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </Box>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* Stats */}
        <Box sx={{ py: { xs: 4, md: 6 }, backgroundColor: 'grey.50' }}>
          <Container maxWidth='lg'>
            <Grid container spacing={3}>
              {[
                { label: 'Thương hiệu', value: '25+' },
                { label: 'Sản phẩm', value: '3.500+' },
                { label: 'Khách hàng hài lòng', value: '50.000+' },
                { label: 'Năm kinh nghiệm', value: '10+' }
              ].map((s, i) => (
                <Grid item xs={6} md={3} key={i}>
                  <Card sx={{ textAlign: 'center', p: 2.5, borderRadius: 3 }}>
                    <Typography variant='h4' fontWeight={800} sx={{ color: 'primary.main' }}>
                      {s.value}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      {s.label}
                    </Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        {/* Values */}
        <Box sx={{ py: { xs: 6, md: 10 }, px: { xs: 2, sm: 3, lg: 4 } }}>
          <Container maxWidth='lg'>
            <Box textAlign='center' mb={6}>
              <Typography variant='h3' fontWeight={800} sx={{ mb: 1 }}>
                Giá trị cốt lõi
              </Typography>
              <Typography color='text.secondary'>Chất lượng – Minh bạch – Tận tâm – Đổi mới</Typography>
            </Box>
            <Grid container spacing={4}>
              {[
                {
                  icon: <Security sx={{ color: 'text.primary' }} />,
                  title: 'Chính hãng 100%',
                  desc: 'Cam kết sản phẩm chính hãng, đầy đủ giấy tờ, kiểm định nghiêm ngặt.'
                },
                {
                  icon: <Watch sx={{ color: 'text.primary' }} />,
                  title: 'Tuyển chọn tinh hoa',
                  desc: 'Danh mục sản phẩm cân bằng giữa biểu tượng kinh điển và xu hướng mới.'
                },
                {
                  icon: <Favorite sx={{ color: 'text.primary' }} />,
                  title: 'Trải nghiệm cao cấp',
                  desc: 'Tư vấn cá nhân hóa, đóng gói sang trọng, bảo hành chu đáo.'
                },
                {
                  icon: <CheckCircle sx={{ color: 'text.primary' }} />,
                  title: 'Hậu mãi toàn diện',
                  desc: 'Bảo hành 5 năm, đổi trả 30 ngày, dịch vụ vệ sinh và bảo dưỡng.'
                }
              ].map((item, idx) => (
                <Grid item xs={12} md={6} key={idx}>
                  <Card sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Avatar variant='rounded' sx={{ bgcolor: 'grey.200', color: 'text.primary' }}>
                        {item.icon}
                      </Avatar>
                      <Box>
                        <Typography variant='h6' fontWeight={700}>
                          {item.title}
                        </Typography>
                        <Typography color='text.secondary'>{item.desc}</Typography>
                      </Box>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        {/* Timeline */}
        <Box sx={{ py: { xs: 6, md: 10 }, backgroundColor: 'grey.50', px: { xs: 2, sm: 3, lg: 4 } }}>
          <Container maxWidth='lg'>
            <Box textAlign='center' mb={6}>
              <Typography variant='h3' fontWeight={800} sx={{ mb: 1 }}>
                Hành trình phát triển
              </Typography>
            </Box>
            <Grid container spacing={3}>
              {[
                { year: '2015', text: 'Thành lập với sứ mệnh nâng tầm trải nghiệm mua sắm đồng hồ cao cấp.' },
                { year: '2018', text: 'Ký kết đối tác với 10+ thương hiệu quốc tế, mở rộng danh mục sản phẩm.' },
                { year: '2021', text: 'Ra mắt nền tảng trực tuyến mới với trải nghiệm hiện đại, đa nền tảng.' },
                { year: '2024', text: 'Cộng đồng 50.000+ khách hàng, triển khai dịch vụ chăm sóc hậu mãi toàn diện.' }
              ].map((i, k) => (
                <Grid item xs={12} md={3} key={k}>
                  <Card sx={{ p: 3, textAlign: 'center', borderRadius: 3 }}>
                    <Chip label={i.year} color='primary' sx={{ mb: 2 }} />
                    <Typography color='text.secondary'>{i.text}</Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>
      </Box>
    </>
  )
}

export default AboutPage
