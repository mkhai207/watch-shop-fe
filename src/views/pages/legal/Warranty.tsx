import { Box, Container, Typography } from '@mui/material'
import Head from 'next/head'

const WarrantyPage = () => {
  return (
    <>
      <Head>
        <title>Chính sách bảo hành | CHRONOS</title>
      </Head>
      <Box sx={{ backgroundColor: 'background.default', px: { xs: 2, sm: 3, lg: 4 }, py: { xs: 6, md: 10 } }}>
        <Container maxWidth='md'>
          <Typography variant='h3' fontWeight={800} sx={{ mb: 4 }}>
            Chính sách bảo hành
          </Typography>
          {[
            { h: '1. Thời gian bảo hành', p: 'Từ 24 - 60 tháng tùy thương hiệu và dòng sản phẩm.' },
            {
              h: '2. Phạm vi',
              p: 'Lỗi kỹ thuật do nhà sản xuất. Không áp dụng cho hao mòn, trầy xước, vào nước do sử dụng sai.'
            },
            { h: '3. Quy trình', p: 'Tiếp nhận – Kiểm tra – Thông báo – Xử lý – Bàn giao. Thời gian 7-21 ngày.' },
            { h: '4. Bảo dưỡng', p: 'Vệ sinh, căn chỉnh, thay pin miễn phí trong thời gian bảo hành.' },
            { h: '5. Trung tâm ủy quyền', p: 'Liên kết hệ thống bảo hành chính hãng toàn quốc.' }
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

export default WarrantyPage
