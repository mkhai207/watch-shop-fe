import CheckIcon from '@mui/icons-material/Check'
import { Avatar, Box, Button, Paper, Typography, Stack } from '@mui/material'
import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'
import { ROUTE_CONFIG } from 'src/configs/route'

const OrderSuccessPage = () => {
  const { t } = useTranslation()
  const router = useRouter()

  const handleNavigateOrders = () => {
    router.push(ROUTE_CONFIG.ORDER_HISTORY)
  }

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
        <Avatar
          sx={{
            backgroundColor: '#4caf50',
            width: 64,
            height: 64,
            margin: '0 auto 24px auto'
          }}
        >
          <CheckIcon sx={{ fontSize: 32, color: 'white' }} />
        </Avatar>

        <Typography
          variant='h5'
          component='h1'
          sx={{
            fontWeight: 500,
            marginBottom: 2,
            color: '#333'
          }}
        >
          {t('order-success')}
        </Typography>

        <Typography
          variant='body1'
          sx={{
            color: '#666',
            lineHeight: 1.6,
            marginBottom: 1
          }}
        >
          {t('order-delivery-info')}
        </Typography>

        <Stack direction='row' spacing={2} justifyContent='center' sx={{ mt: 5 }}>
          <Button
            variant='outlined'
            color='primary'
            onClick={() => router.push(ROUTE_CONFIG.HOME)}
            sx={{ textTransform: 'none' }}
          >
            Về trang chủ
          </Button>
          <Button variant='contained' color='primary' onClick={handleNavigateOrders} sx={{ textTransform: 'none' }}>
            {t('view-orders')}
          </Button>
        </Stack>
      </Paper>
    </Box>
  )
}

export default OrderSuccessPage
