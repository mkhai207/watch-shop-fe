import { Email, Facebook, LocationOn, LocalPhone, Schedule } from '@mui/icons-material'
import { Box, Button, Card, CardContent, Container, Grid, TextField, Typography } from '@mui/material'
import Head from 'next/head'

const ContactPage = () => {
  return (
    <>
      <Head>
        <title>Liên hệ | CHRONOS</title>
      </Head>
      <Box sx={{ backgroundColor: 'background.default', px: { xs: 2, sm: 3, lg: 4 }, py: { xs: 6, md: 10 } }}>
        <Container maxWidth='lg'>
          <Grid container spacing={6}>
            <Grid item xs={12} md={6}>
              <Typography variant='h3' fontWeight={800} sx={{ mb: 2 }}>
                Liên hệ với chúng tôi
              </Typography>
              <Typography color='text.secondary' sx={{ mb: 4 }}>
                Chúng tôi luôn sẵn sàng hỗ trợ 24/7. Hãy để lại thông tin, đội ngũ tư vấn sẽ liên hệ trong thời gian sớm
                nhất.
              </Typography>

              <Card sx={{ p: 3, borderRadius: 3, mb: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField label='Họ và tên' fullWidth size='medium' />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField label='Email' type='email' fullWidth size='medium' />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField label='Số điện thoại' fullWidth size='medium' />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField label='Chủ đề' fullWidth size='medium' />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField label='Nội dung' fullWidth multiline rows={5} />
                  </Grid>
                </Grid>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                  <Button variant='contained' size='large'>
                    Gửi yêu cầu
                  </Button>
                </Box>
              </Card>

              <Card sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant='h6' fontWeight={700} sx={{ mb: 2 }}>
                  Thông tin liên hệ
                </Typography>
                <Grid container spacing={2}>
                  {[
                    { icon: <LocationOn color='primary' />, label: 'Địa chỉ', value: '123 Nguyễn Huệ, Q.1, TP.HCM' },
                    { icon: <LocalPhone color='primary' />, label: 'Điện thoại', value: '1900 1234' },
                    { icon: <Email color='primary' />, label: 'Email', value: 'support@chronos.vn' },
                    { icon: <Schedule color='primary' />, label: 'Giờ làm việc', value: '08:00 - 21:00 (T2 - CN)' }
                  ].map((i, k) => (
                    <Grid item xs={12} key={k}>
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        {i.icon}
                        <Box>
                          <Typography fontWeight={700}>{i.label}</Typography>
                          <Typography color='text.secondary'>{i.value}</Typography>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ p: 0, borderRadius: 3, overflow: 'hidden', height: '100%' }}>
                <Box sx={{ height: 420, width: '100%', backgroundColor: 'grey.100' }}>
                  <Box
                    component='img'
                    alt='map'
                    src='/images/luxury-watch-collection-display-with-elegant-light.jpg'
                    sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </Box>
                <CardContent>
                  <Typography variant='h6' fontWeight={700} sx={{ mb: 1 }}>
                    Kết nối mạng xã hội
                  </Typography>
                  <Button startIcon={<Facebook />} variant='outlined'>
                    Facebook
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  )
}

export default ContactPage
