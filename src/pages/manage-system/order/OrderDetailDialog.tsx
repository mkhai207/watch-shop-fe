import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Typography,
  CircularProgress,
  Alert
} from '@mui/material'
import React, { useEffect, useState, useCallback } from 'react'
import IconifyIcon from 'src/components/Icon'
import { CONFIG_API } from 'src/configs/api'
import instanceAxios from 'src/helpers/axios'
import { Order, OrderStatus } from 'src/types/order'

export interface OrderDetailDialogProps {
  open: boolean
  onClose: () => void
  orderId?: string
  orderStatuses: OrderStatus[]
}

export interface OrderDetail {
  id: string
  quantity: number
  variant: {
    id: string
    watch: {
      id: string
      code: string
      name: string
      description: string
      thumbnail: string
      base_price: number
    }
    color: {
      id: string
      name: string
    }
    strapMaterial: {
      id: string
      name: string
    }
  }
}

export interface FullOrderData extends Order {
  details: OrderDetail[]
}

const paymentMethodMap: Record<string, string> = {
  '0': 'COD',
  '1': 'Thanh toán VNPay'
}

const OrderDetailDialog: React.FC<OrderDetailDialogProps> = ({ open, onClose, orderId, orderStatuses }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [orderData, setOrderData] = useState<FullOrderData | null>(null)

  const fetchOrderDetails = useCallback(async () => {
    if (!orderId) return

    try {
      setLoading(true)
      setError(null)

      const response = await instanceAxios.get(`${CONFIG_API.ORDER.INDEX}/${orderId}`)

      console.log('Order detail response:', response.data)

      // Parse response - handle different response formats
      let data = response.data
      if (data?.order) {
        data = data.order
      }

      setOrderData(data as FullOrderData)
    } catch (error: any) {
      console.error('Error fetching order details:', error)
      const errorMessage = error?.response?.data?.message || 'Lỗi khi tải chi tiết đơn hàng'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [orderId])

  useEffect(() => {
    if (open && orderId) {
      fetchOrderDetails()
    }
  }, [open, orderId, fetchOrderDetails])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    if (!dateString || dateString.length !== 14) {
      return dateString
    }

    const year = dateString.substring(0, 4)
    const month = dateString.substring(4, 6)
    const day = dateString.substring(6, 8)
    const hour = dateString.substring(8, 10)
    const minute = dateString.substring(10, 12)
    const second = dateString.substring(12, 14)

    const date = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`)

    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusInfo = (statusId: string) => {
    const status = orderStatuses.find(s => s.id === statusId)

    return {
      name: status?.name || `Trạng thái ${statusId}`,
      color: status?.hex_code || '#999999',
      sortOrder: status?.sort_order || 0
    }
  }

  const getPaymentMethodChip = (paymentMethod?: string) => {
    if (!paymentMethod) return <Chip label='Chưa chọn' color='default' size='small' />
    const method = paymentMethodMap[paymentMethod] || 'Khác'

    return <Chip label={method} color='primary' size='small' />
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle>Chi tiết đơn hàng {orderData?.code || (orderId && `(${orderId})`)}</DialogTitle>
      <DialogContent>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity='error' sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {orderData && !loading && (
          <Box sx={{ mt: 2 }}>
            {/* Order Code and Metadata */}
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant='body2' color='textSecondary'>
                      Mã đơn hàng
                    </Typography>
                    <Typography variant='body2' fontWeight={600}>
                      {orderData.code}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant='body2' color='textSecondary'>
                      Ngày tạo
                    </Typography>
                    <Typography variant='body2' fontWeight={600}>
                      {formatDate(orderData.created_at)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant='body2' color='textSecondary'>
                      ID khách
                    </Typography>
                    <Typography variant='body2' fontWeight={600}>
                      {orderData.user_id}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant='body2' color='textSecondary'>
                      Trạng thái
                    </Typography>
                    <Chip
                      label={orderData.del_flag === '0' ? 'Active' : 'Deleted'}
                      size='small'
                      color={orderData.del_flag === '0' ? 'success' : 'error'}
                      variant='outlined'
                      sx={{ mt: 0.5 }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Customer Info */}
            <Card sx={{ mb: 2 }}>
              <CardHeader title='Thông tin khách hàng' />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant='body2' color='textSecondary'>
                      Họ tên
                    </Typography>
                    <Typography variant='body1' fontWeight={600}>
                      {orderData.guess_name}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant='body2' color='textSecondary'>
                      Email
                    </Typography>
                    <Typography variant='body1'>{orderData.guess_email}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant='body2' color='textSecondary'>
                      Số điện thoại
                    </Typography>
                    <Typography variant='body1'>{orderData.guess_phone}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant='body2' color='textSecondary'>
                      Địa chỉ giao hàng
                    </Typography>
                    <Typography variant='body1'>{orderData.shipping_address}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Payment Info */}
            <Card sx={{ mb: 2 }}>
              <CardHeader title='Thông tin thanh toán' />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant='body2' color='textSecondary'>
                      Phương thức
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>{getPaymentMethodChip(orderData.payment_method)}</Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant='body2' color='textSecondary'>
                      Trạng thái
                    </Typography>
                    <Chip
                      label={getStatusInfo(orderData.current_status_id).name}
                      sx={{
                        backgroundColor: getStatusInfo(orderData.current_status_id).color,
                        color: '#fff',
                        mt: 0.5
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Typography variant='body2' color='textSecondary'>
                      Tạm tính
                    </Typography>
                    <Typography variant='body1'>{formatPrice(orderData.total_amount)}</Typography>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Typography variant='body2' color='textSecondary'>
                      Phí vận chuyển
                    </Typography>
                    <Typography variant='body1'>{formatPrice(orderData.shipping_fee)}</Typography>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Typography variant='body2' color='textSecondary'>
                      Giảm giá
                    </Typography>
                    <Typography variant='body1' color='success.main'>
                      -{formatPrice(orderData.discount_amount)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Typography variant='body2' color='textSecondary'>
                      Tổng cộng
                    </Typography>
                    <Typography variant='h6' fontWeight={700}>
                      {formatPrice(orderData.final_amount)}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Products */}
            <Card sx={{ mb: 2 }}>
              <CardHeader title={`Sản phẩm (${orderData.details?.length || 0})`} />
              <CardContent>
                {orderData.details && orderData.details.length > 0 ? (
                  orderData.details.map((item, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        gap: 2,
                        mb: 2,
                        pb: 2,
                        borderBottom: index < orderData.details.length - 1 ? '1px solid' : 'none',
                        borderColor: 'divider'
                      }}
                    >
                      {/* Product Image */}
                      <Box
                        sx={{
                          flexShrink: 0,
                          width: 80,
                          height: 80,
                          borderRadius: 1,
                          overflow: 'hidden',
                          backgroundColor: '#f5f5f5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1px solid #e0e0e0'
                        }}
                      >
                        {item.variant?.watch?.thumbnail ? (
                          <Box
                            component='img'
                            src={item.variant.watch.thumbnail}
                            alt={item.variant.watch.name}
                            sx={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                        ) : (
                          <IconifyIcon icon='mdi:image-off' width={32} height={32} />
                        )}
                      </Box>

                      {/* Product Details */}
                      <Box sx={{ flex: 1 }}>
                        <Typography variant='body2' fontWeight={600} sx={{ mb: 0.5 }}>
                          {item.variant?.watch?.code}
                        </Typography>
                        <Typography variant='caption' color='textSecondary' sx={{ display: 'block', mb: 1 }}>
                          {item.variant?.watch?.name}
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                          <Chip label={`Màu: ${item.variant?.color?.name || 'N/A'}`} size='small' variant='outlined' />
                          <Chip
                            label={`Dây: ${item.variant?.strapMaterial?.name || 'N/A'}`}
                            size='small'
                            variant='outlined'
                          />
                          <Chip label={`SL: ${item.quantity}`} size='small' />
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant='body2'>
                            {formatPrice(item.variant?.watch?.base_price || 0)} × {item.quantity}
                          </Typography>
                          <Typography variant='body2' fontWeight={600}>
                            {formatPrice((item.variant?.watch?.base_price || 0) * item.quantity)}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  ))
                ) : (
                  <Typography variant='body2' color='textSecondary'>
                    Không có sản phẩm
                  </Typography>
                )}
              </CardContent>
            </Card>

            {/* Notes */}
            {orderData.note && (
              <Card sx={{ mb: 2 }}>
                <CardHeader title='Ghi chú' />
                <CardContent>
                  <Typography variant='body2'>{orderData.note}</Typography>
                </CardContent>
              </Card>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  )
}

export default OrderDetailDialog
