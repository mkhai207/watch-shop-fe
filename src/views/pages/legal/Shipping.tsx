import { Box, Container, Typography } from '@mui/material'
import Head from 'next/head'

const ShippingPage = () => {
  return (
    <>
      <Head>
        <title>Chính sách vận chuyển | CHRONOS</title>
      </Head>
      <Box sx={{ backgroundColor: 'background.default', px: { xs: 2, sm: 3, lg: 4 }, py: { xs: 6, md: 10 } }}>
        <Container maxWidth='md'>
          <Typography variant='h3' fontWeight={800} sx={{ mb: 4 }}>
            Chính sách vận chuyển
          </Typography>
          {[
            { h: '1. Phạm vi', p: 'Giao hàng toàn quốc qua các đối tác uy tín.' },
            { h: '2. Thời gian', p: 'Nội thành 1-2 ngày, ngoại tỉnh 2-5 ngày làm việc.' },
            { h: '3. Phí vận chuyển', p: 'Miễn phí cho đơn từ 2,000,000đ; dưới mức này phí 30,000đ.' },
            { h: '4. Đóng gói', p: 'Đóng gói chống sốc, chống ẩm, niêm phong bảo vệ sản phẩm.' },
            { h: '5. Theo dõi', p: 'Cung cấp mã vận đơn để theo dõi trạng thái.' },
            { h: '6. Rủi ro vận chuyển', p: 'Nếu hư hại do vận chuyển, chúng tôi hỗ trợ đổi mới theo quy định.' }
          ].map((s, i) => (
            <Box key={i} sx={{ mb: 3 }}>
              <Typography variant='h6' fontWeight={700} sx={{ mb: 1 }}>
                {s.h}
              </Typography>
              <Typography color='text.secondary'>{s.p}</Typography>
            </Box>
          ))}
        </Container>
      </Box>
    </>
  )
}

export default ShippingPage
