import { Box, Container, Typography } from '@mui/material'
import Head from 'next/head'

const TermsPage = () => {
  return (
    <>
      <Head>
        <title>Điều khoản sử dụng | CHRONOS</title>
      </Head>
      <Box sx={{ backgroundColor: 'background.default', px: { xs: 2, sm: 3, lg: 4 }, py: { xs: 6, md: 10 } }}>
        <Container maxWidth='md'>
          <Typography variant='h3' fontWeight={800} sx={{ mb: 4 }}>
            Điều khoản sử dụng
          </Typography>
          {[
            {
              h: '1. Chấp nhận điều khoản',
              p: 'Khi truy cập và sử dụng CHRONOS, bạn đồng ý tuân thủ các điều khoản và điều kiện này.'
            },
            { h: '2. Tài khoản', p: 'Bạn chịu trách nhiệm bảo mật tài khoản và mọi hoạt động phát sinh từ tài khoản.' },
            {
              h: '3. Sản phẩm & dịch vụ',
              p: 'Thông tin sản phẩm mang tính tham khảo, có thể thay đổi mà không cần thông báo. Chúng tôi đảm bảo nguồn gốc và tính chính hãng.'
            },
            { h: '4. Thanh toán', p: 'Hỗ trợ nhiều phương thức thanh toán an toàn. Mọi giao dịch đều được mã hóa.' },
            {
              h: '5. Hạn chế trách nhiệm',
              p: 'Chúng tôi không chịu trách nhiệm cho các thiệt hại gián tiếp phát sinh từ việc sử dụng dịch vụ.'
            },
            { h: '6. Thay đổi điều khoản', p: 'Điều khoản có thể được cập nhật theo thời gian để phù hợp pháp luật.' }
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

export default TermsPage
