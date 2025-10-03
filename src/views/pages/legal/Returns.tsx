import { Box, Container, Typography } from '@mui/material'
import Head from 'next/head'

const ReturnsPage = () => {
  return (
    <>
      <Head>
        <title>Chính sách đổi trả | CHRONOS</title>
      </Head>
      <Box sx={{ backgroundColor: 'background.default', px: { xs: 2, sm: 3, lg: 4 }, py: { xs: 6, md: 10 } }}>
        <Container maxWidth='md'>
          <Typography variant='h3' fontWeight={800} sx={{ mb: 4 }}>
            Chính sách đổi trả
          </Typography>
          {[
            { h: '1. Thời hạn', p: 'Đổi trả trong vòng 30 ngày kể từ ngày nhận hàng.' },
            { h: '2. Điều kiện', p: 'Sản phẩm còn nguyên tem, hộp, chưa qua sử dụng, đầy đủ phụ kiện.' },
            { h: '3. Phí', p: 'Miễn phí đổi 1 lần; trả hàng sẽ trừ phí vận chuyển phát sinh.' },
            { h: '4. Quy trình', p: 'Liên hệ CSKH, cung cấp hóa đơn và video mở hộp để xử lý nhanh chóng.' },
            { h: '5. Không áp dụng', p: 'Sản phẩm khắc tên, giảm giá sâu, hoặc hư hại do người dùng.' }
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

export default ReturnsPage
