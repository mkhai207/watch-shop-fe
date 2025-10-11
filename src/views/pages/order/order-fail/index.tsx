import CloseIcon from '@mui/icons-material/Close'
import {
  Avatar,
  Box,
  Button,
  Paper,
  Typography,
  Container,
  Card,
  CardContent,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material'
import { useRouter } from 'next/router'
import { ROUTE_CONFIG } from 'src/configs/route'
import { useEffect, useState } from 'react'

const OrderFailPage = () => {
  const router = useRouter()
  const [orderInfo, setOrderInfo] = useState<any>(null)

  useEffect(() => {
    // Lấy thông tin đơn hàng từ localStorage hoặc URL params
    const orderData = localStorage.getItem('lastOrderData')
    if (orderData) {
      try {
        setOrderInfo(JSON.parse(orderData))
        localStorage.removeItem('lastOrderData')
      } catch (error) {
        console.error('Error parsing order data:', error)
      }
    }
  }, [])

  const handleGoHome = () => {
    router.push(ROUTE_CONFIG.HOME)
  }

  const handleViewOrders = () => {
    router.push(ROUTE_CONFIG.ORDER_HISTORY)
  }

  return (
    <Container maxWidth='lg' sx={{ py: 4 }}>
      {/* Fail Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Avatar
          sx={{
            backgroundColor: '#f44336',
            width: 80,
            height: 80,
            margin: '0 auto 24px auto'
          }}
        >
          <CloseIcon sx={{ fontSize: 40, color: 'white' }} />
        </Avatar>

        <Typography
          variant='h4'
          component='h1'
          sx={{
            fontWeight: 'bold',
            marginBottom: 2,
            color: '#333'
          }}
        >
          Thanh toán thất bại
        </Typography>

        <Typography
          variant='h6'
          sx={{
            color: '#f44336',
            marginBottom: 1,
            fontWeight: 'bold'
          }}
        >
          Rất tiếc, giao dịch của bạn không thành công
        </Typography>

        <Typography
          variant='body1'
          sx={{
            color: '#666',
            lineHeight: 1.6,
            marginBottom: 3
          }}
        >
          Có thể do lỗi mạng, thông tin thẻ không chính xác hoặc số dư không đủ. Vui lòng kiểm tra lại và thử lại.
        </Typography>
      </Box>

      {/* Error Details */}
      <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant='h6' sx={{ fontWeight: 'bold', mb: 3, color: '#333' }}>
            Nguyên nhân có thể
          </Typography>

          <List>
            <ListItem>
              <ListItemIcon>
                <Avatar sx={{ bgcolor: '#ff9800', width: 32, height: 32 }}>
                  <Typography variant='body2' sx={{ color: 'white', fontWeight: 'bold' }}>
                    1
                  </Typography>
                </Avatar>
              </ListItemIcon>
              <ListItemText
                primary='Thông tin thẻ không chính xác'
                secondary='Vui lòng kiểm tra lại số thẻ, ngày hết hạn và CVV'
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <Avatar sx={{ bgcolor: '#ff9800', width: 32, height: 32 }}>
                  <Typography variant='body2' sx={{ color: 'white', fontWeight: 'bold' }}>
                    2
                  </Typography>
                </Avatar>
              </ListItemIcon>
              <ListItemText primary='Số dư không đủ' secondary='Tài khoản của bạn không đủ số dư để thanh toán' />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <Avatar sx={{ bgcolor: '#ff9800', width: 32, height: 32 }}>
                  <Typography variant='body2' sx={{ color: 'white', fontWeight: 'bold' }}>
                    3
                  </Typography>
                </Avatar>
              </ListItemIcon>
              <ListItemText primary='Lỗi kết nối mạng' secondary='Kết nối internet không ổn định, vui lòng thử lại' />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <Avatar sx={{ bgcolor: '#ff9800', width: 32, height: 32 }}>
                  <Typography variant='body2' sx={{ color: 'white', fontWeight: 'bold' }}>
                    4
                  </Typography>
                </Avatar>
              </ListItemIcon>
              <ListItemText
                primary='Thẻ bị khóa hoặc hết hạn'
                secondary='Liên hệ ngân hàng để kiểm tra trạng thái thẻ'
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>

      {/* Order Info (if available) */}
      {orderInfo && (
        <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant='h6' sx={{ fontWeight: 'bold', mb: 3, color: '#333' }}>
              Thông tin đơn hàng
            </Typography>

            <Alert severity='warning' sx={{ mb: 2 }}>
              Đơn hàng này chưa được thanh toán thành công. Bạn có thể thử thanh toán lại hoặc tạo đơn hàng mới.
            </Alert>

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 2,
                backgroundColor: '#f8f9fa',
                borderRadius: 2
              }}
            >
              <Box>
                <Typography variant='subtitle2' sx={{ fontWeight: 'bold' }}>
                  Tổng tiền đơn hàng
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {orderInfo.items?.length || 0} sản phẩm
                </Typography>
              </Box>
              <Typography variant='h6' color='error' sx={{ fontWeight: 'bold' }}>
                {orderInfo.total?.toLocaleString('vi-VN') || '0'} VNĐ
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Button
          variant='outlined'
          color='primary'
          onClick={handleGoHome}
          sx={{
            textTransform: 'none',
            px: 4,
            py: 1.5,
            borderRadius: 2
          }}
        >
          Về trang chủ
        </Button>
        <Button
          variant='contained'
          color='primary'
          onClick={handleViewOrders}
          sx={{
            textTransform: 'none',
            px: 4,
            py: 1.5,
            borderRadius: 2
          }}
        >
          Xem đơn hàng của tôi
        </Button>
      </Box>
    </Container>
  )
}

export default OrderFailPage
