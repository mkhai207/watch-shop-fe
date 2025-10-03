import CloseIcon from '@mui/icons-material/Close'
import { Avatar, Box, Button, Paper, Typography } from '@mui/material'
import { useRouter } from 'next/router'
import { ROUTE_CONFIG } from 'src/configs/route'

const OrderFailPage = () => {
  const router = useRouter()

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '50vh',
        backgroundColor: '#f5f5f5',
        padding: 2
      }}
    >
      <Paper
        elevation={2}
        sx={{
          padding: 4,
          textAlign: 'center',
          maxWidth: 400,
          width: '100%',
          borderRadius: 2,
          backgroundColor: '#fafafa'
        }}
      >
        <Avatar sx={{ backgroundColor: '#f44336', width: 64, height: 64, margin: '0 auto 24px auto' }}>
          <CloseIcon sx={{ fontSize: 32, color: 'white' }} />
        </Avatar>

        <Typography variant='h5' component='h1' sx={{ fontWeight: 500, mb: 2, color: '#333' }}>
          Thanh toán thất bại
        </Typography>

        <Typography variant='body1' sx={{ color: '#666', lineHeight: 1.6, mb: 1 }}>
          Rất tiếc, giao dịch của bạn không thành công. Bạn có thể thử lại sau.
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 5 }}>
          <Button
            variant='outlined'
            color='primary'
            onClick={() => router.push(ROUTE_CONFIG.HOME)}
            sx={{ textTransform: 'none' }}
          >
            Về trang chủ
          </Button>
          <Button
            variant='contained'
            color='primary'
            onClick={() => router.push(ROUTE_CONFIG.ORDER_HISTORY)}
            sx={{ textTransform: 'none' }}
          >
            Xem lại đơn hàng
          </Button>
        </Box>
      </Paper>
    </Box>
  )
}

export default OrderFailPage
