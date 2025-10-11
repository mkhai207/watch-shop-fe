import CheckIcon from '@mui/icons-material/Check'
import {
  Avatar,
  Box,
  Button,
  Paper,
  Typography,
  Stack,
  Container,
  Grid,
  Card,
  CardContent,
  Divider,
  Chip,
  Alert
} from '@mui/material'
import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'
import { ROUTE_CONFIG } from 'src/configs/route'
import { useEffect, useState } from 'react'
import dayjs from 'dayjs'

const OrderSuccessPage = () => {
  const { t } = useTranslation()
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

  const handleNavigateOrders = () => {
    router.push(ROUTE_CONFIG.ORDER_HISTORY)
  }

  const handleContinueShopping = () => {
    router.push(ROUTE_CONFIG.HOME)
  }

  return (
    <Container maxWidth='lg' sx={{ py: 4 }}>
      {/* Success Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Avatar
          sx={{
            backgroundColor: '#4caf50',
            width: 80,
            height: 80,
            margin: '0 auto 24px auto'
          }}
        >
          <CheckIcon sx={{ fontSize: 40, color: 'white' }} />
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
          Đặt hàng thành công!
        </Typography>

        <Typography
          variant='h6'
          sx={{
            color: '#4caf50',
            marginBottom: 1,
            fontWeight: 'bold'
          }}
        >
          Cảm ơn bạn đã mua sắm tại cửa hàng của chúng tôi
        </Typography>

        <Typography
          variant='body1'
          sx={{
            color: '#666',
            lineHeight: 1.6,
            marginBottom: 3
          }}
        >
          Đơn hàng của bạn đã được xử lý thành công. Chúng tôi sẽ gửi email xác nhận đến địa chỉ email của bạn.
        </Typography>
      </Box>

      {/* Order Summary */}
      {orderInfo && (
        <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant='h6' sx={{ fontWeight: 'bold', mb: 3, color: '#333' }}>
              Tóm tắt đơn hàng
            </Typography>

            <Grid container spacing={3}>
              {/* Order Info */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, backgroundColor: '#f8f9fa' }}>
                  <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                    Thông tin đơn hàng
                  </Typography>
                  <Typography variant='body2' sx={{ mb: 1 }}>
                    <strong>Mã đơn hàng:</strong> {orderInfo.code || 'Đang xử lý...'}
                  </Typography>
                  <Typography variant='body2' sx={{ mb: 1 }}>
                    <strong>Ngày đặt:</strong> {dayjs().format('DD/MM/YYYY HH:mm')}
                  </Typography>
                  <Typography variant='body2' sx={{ mb: 1 }}>
                    <strong>Trạng thái:</strong>
                    <Chip label='Đã đặt hàng' color='success' size='small' sx={{ ml: 1 }} />
                  </Typography>
                  <Typography variant='body2'>
                    <strong>Phương thức thanh toán:</strong> {orderInfo.paymentMethod || 'VNPay'}
                  </Typography>
                </Paper>
              </Grid>

              {/* Delivery Info */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, backgroundColor: '#f8f9fa' }}>
                  <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                    Thông tin giao hàng
                  </Typography>
                  <Typography variant='body2' sx={{ mb: 1 }}>
                    <strong>Người nhận:</strong> {orderInfo.name || 'Nguyễn Văn A'}
                  </Typography>
                  <Typography variant='body2' sx={{ mb: 1 }}>
                    <strong>Số điện thoại:</strong> {orderInfo.phone || '0966802555'}
                  </Typography>
                  <Typography variant='body2'>
                    <strong>Địa chỉ:</strong>{' '}
                    {orderInfo.shipping_address || '123 Nguyễn Huệ, Hiệp Bình Chánh, Thủ Đức, Hồ Chí Minh'}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Order Items */}
            <Typography variant='subtitle1' sx={{ fontWeight: 'bold', mb: 2 }}>
              Sản phẩm đã đặt
            </Typography>

            {orderInfo.items && orderInfo.items.length > 0 ? (
              orderInfo.items.map((item: any, index: number) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 2,
                    p: 2,
                    border: '1px solid #e0e0e0',
                    borderRadius: 2
                  }}
                >
                  <Box sx={{ mr: 2 }}>
                    <img
                      src={item.thumbnail || '/placeholder.svg'}
                      alt={item.name}
                      style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }}
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant='subtitle2' sx={{ fontWeight: 'bold' }}>
                      {item.name}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      {item.color} / Dây: {item.strapMaterial}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Số lượng: {item.quantity}
                    </Typography>
                  </Box>
                  <Typography variant='h6' color='error' sx={{ fontWeight: 'bold' }}>
                    {(item.price * item.quantity).toLocaleString('vi-VN')} VNĐ
                  </Typography>
                </Box>
              ))
            ) : (
              <Alert severity='info'>Thông tin sản phẩm sẽ được cập nhật sau.</Alert>
            )}

            <Divider sx={{ my: 3 }} />

            {/* Order Total */}
            <Box sx={{ textAlign: 'right' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Tạm tính:</Typography>
                <Typography>{orderInfo.subtotal?.toLocaleString('vi-VN') || '0'} VNĐ</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Phí vận chuyển:</Typography>
                <Typography>{orderInfo.shippingFee?.toLocaleString('vi-VN') || '0'} VNĐ</Typography>
              </Box>
              {orderInfo.discountAmount > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography color='success.main'>Giảm giá:</Typography>
                  <Typography color='success.main'>-{orderInfo.discountAmount?.toLocaleString('vi-VN')} VNĐ</Typography>
                </Box>
              )}
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant='h6' sx={{ fontWeight: 'bold' }}>
                  Tổng cộng:
                </Typography>
                <Typography variant='h6' sx={{ fontWeight: 'bold', color: '#e91e63' }}>
                  {orderInfo.total?.toLocaleString('vi-VN') || '0'} VNĐ
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Next Steps */}
      <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant='h6' sx={{ fontWeight: 'bold', mb: 2, color: '#333' }}>
            Bước tiếp theo
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: '#4caf50', width: 32, height: 32 }}>
                <Typography variant='body2' sx={{ color: 'white', fontWeight: 'bold' }}>
                  1
                </Typography>
              </Avatar>
              <Typography variant='body1'>
                <strong>Xác nhận đơn hàng:</strong> Chúng tôi sẽ gửi email xác nhận trong vòng 5 phút
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: '#2196f3', width: 32, height: 32 }}>
                <Typography variant='body2' sx={{ color: 'white', fontWeight: 'bold' }}>
                  2
                </Typography>
              </Avatar>
              <Typography variant='body1'>
                <strong>Chuẩn bị hàng:</strong> Đơn hàng sẽ được chuẩn bị trong 1-2 ngày làm việc
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: '#ff9800', width: 32, height: 32 }}>
                <Typography variant='body2' sx={{ color: 'white', fontWeight: 'bold' }}>
                  3
                </Typography>
              </Avatar>
              <Typography variant='body1'>
                <strong>Giao hàng:</strong> Thời gian giao hàng dự kiến 3-5 ngày làm việc
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Button
          variant='outlined'
          color='primary'
          onClick={handleContinueShopping}
          sx={{
            textTransform: 'none',
            px: 4,
            py: 1.5,
            borderRadius: 2
          }}
        >
          Tiếp tục mua sắm
        </Button>
        <Button
          variant='contained'
          color='primary'
          onClick={handleNavigateOrders}
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

export default OrderSuccessPage
