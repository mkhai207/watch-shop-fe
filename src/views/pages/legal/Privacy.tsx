import { Box, Container, Typography } from '@mui/material'
import Head from 'next/head'

const PrivacyPage = () => {
  return (
    <>
      <Head>
        <title>Chính sách bảo mật | CHRONOS</title>
      </Head>
      <Box sx={{ backgroundColor: 'background.default', px: { xs: 2, sm: 3, lg: 4 }, py: { xs: 6, md: 10 } }}>
        <Container maxWidth='md'>
          <Typography variant='h3' fontWeight={800} sx={{ mb: 4 }}>
            Chính sách bảo mật
          </Typography>
          {[
            { h: '1. Thu thập dữ liệu', p: 'Chúng tôi thu thập thông tin cơ bản để phục vụ mua sắm và hỗ trợ.' },
            { h: '2. Sử dụng dữ liệu', p: 'Dùng để xử lý đơn hàng, chăm sóc khách hàng và cải thiện dịch vụ.' },
            { h: '3. Lưu trữ & bảo mật', p: 'Dữ liệu được mã hóa, lưu trữ an toàn, tuân thủ quy định pháp luật.' },
            {
              h: '4. Chia sẻ với bên thứ ba',
              p: 'Chỉ chia sẻ khi cần thiết cho vận chuyển, thanh toán, theo quy định pháp luật.'
            },
            { h: '5. Quyền của bạn', p: 'Bạn có quyền truy cập, chỉnh sửa, xóa dữ liệu cá nhân theo yêu cầu.' },
            { h: '6. Cookie', p: 'Sử dụng cookie để cá nhân hóa trải nghiệm và đo lường hiệu quả.' }
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

export default PrivacyPage
