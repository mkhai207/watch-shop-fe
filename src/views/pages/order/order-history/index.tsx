import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Paper,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  CircularProgress,
  Alert
} from '@mui/material'
import {
  Visibility as VisibilityIcon,
  Payment as PaymentIcon,
  LocalShipping as ShippingIcon,
  Receipt as ReceiptIcon,
  AccessTime as TimeIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon
} from '@mui/icons-material'
import dayjs from 'dayjs'
import { useRouter } from 'next/router'
import qs from 'qs'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import CustomPagination from 'src/components/custom-pagination'
import Spinner from 'src/components/spinner'
import { PAGE_SIZE_OPTION } from 'src/configs/gridConfig'
import { ROUTE_CONFIG } from 'src/configs/route'
import { getListOrders, retryPayOrder, getOrderDetail, getOrderStatuses } from 'src/services/order'
import { getStatusColor, getStatusText } from 'src/utils/status-style'

const OrderHistoryPage = () => {
  const router = useRouter()
  const { t } = useTranslation()

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTION[0])
  const [orders, setOrders] = useState<{
    data: any[]
    total: number
    totalPages: number
    currentPage: number
  }>({
    data: [],
    total: 0,
    totalPages: 0,
    currentPage: 1
  })
  const [loading, setLoading] = useState(false)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [orderDetails, setOrderDetails] = useState<any>(null)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [orderStatuses, setOrderStatuses] = useState<any[]>([])

  const handleOnchangePagination = (page: number, pageSize: number) => {
    setPage(page)
    setPageSize(pageSize)
  }

  const formatFiltersForAPI = () => {
    const params: Record<string, any> = {
      page: page || 1,
      limit: pageSize || 6
    }

    Object.keys(params).forEach(key => {
      if (
        params[key] === undefined ||
        params[key] === null ||
        (Array.isArray(params[key]) && params[key].length === 0)
      ) {
        delete params[key]
      }
    })

    return params
  }

  const handlePayOrder = async (orderId: string) => {
    try {
      setLoading(true)
      const response = await retryPayOrder(orderId)

      if (response?.status === 'success' && response?.data) {
        setLoading(false)
        const url = response?.data?.vnpayUrl
        console.log('url', url)
        if (url) {
          window.location.href = url
        }
      }
    } catch (error) {
      setLoading(false)
    }
  }

  const handleViewOrder = (orderId: string) => {
    router.push(`${ROUTE_CONFIG.ORDER}/${orderId}`)
  }

  const handleViewDetails = async (order: any) => {
    setSelectedOrder(order)
    setDetailDialogOpen(true)
    setLoadingDetails(true)

    try {
      const response = await getOrderDetail(order.id)
      if (response?.order) {
        setOrderDetails(response.order)
      }
    } catch (error) {
      toast.error('Có lỗi khi tải chi tiết đơn hàng')
    } finally {
      setLoadingDetails(false)
    }
  }

  const handleGetListOrders = async () => {
    try {
      setLoading(true)

      const queryParams = formatFiltersForAPI()

      const response = await getListOrders({
        params: queryParams,
        paramsSerializer: params => qs.stringify(params, { arrayFormat: 'repeat', encode: false })
      })

      if (response.status === 'success') {
        setOrders({
          data: response?.data || [],
          total: response.meta?.totalItems || 0,
          totalPages: response.meta?.totalPages || 0,
          currentPage: response.meta?.currentPage || 1
        })
      }
    } catch (error: any) {
      toast.error(error?.message || 'Có lỗi xảy ra khi tải đơn hàng')
    } finally {
      setLoading(false)
    }
  }

  const handleGetOrderStatuses = async () => {
    try {
      const response = await getOrderStatuses()
      if (response?.orderStatuses?.rows) {
        setOrderStatuses(response.orderStatuses.rows)
      }
    } catch (error) {
      console.error('Error loading order statuses:', error)
    }
  }

  const getStatusInfo = (statusId: string) => {
    const status = orderStatuses.find(s => s.id === statusId)
    return status || { name: 'Không xác định', hex_code: '#9e9e9e' }
  }

  const getStatusIcon = (statusId: string) => {
    const status = getStatusInfo(statusId)
    switch (status.code) {
      case 'PENDING':
        return <PendingIcon sx={{ color: status.hex_code }} />
      case 'PENDINGPAYMENT':
        return <TimeIcon sx={{ color: status.hex_code }} />
      case 'PAID':
        return <CheckCircleIcon sx={{ color: status.hex_code }} />
      case 'PREPARING':
        return <ShippingIcon sx={{ color: status.hex_code }} />
      default:
        return <TimeIcon sx={{ color: status.hex_code }} />
    }
  }

  const getStatusColorValue = (statusId: string) => {
    const status = getStatusInfo(statusId)
    return status.hex_code
  }

  const getStatusText = (statusId: string) => {
    const status = getStatusInfo(statusId)
    return status.name
  }

  useEffect(() => {
    handleGetListOrders()
  }, [page, pageSize])

  useEffect(() => {
    handleGetOrderStatuses()
  }, [])

  return (
    <>
      {loading && <Spinner />}
      <Container maxWidth='lg' sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant='h4' sx={{ fontWeight: 'bold', color: '#333', mb: 1 }}>
            Lịch sử đơn hàng
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            Theo dõi và quản lý các đơn hàng của bạn
          </Typography>
        </Box>

        {/* Orders List */}
        {orders?.data.length === 0 && !loading ? (
          <Alert severity='info' sx={{ mb: 3 }}>
            Bạn chưa có đơn hàng nào. Hãy mua sắm để tạo đơn hàng đầu tiên!
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {orders?.data.map(order => (
              <Grid item xs={12} key={order.id}>
                <Card
                  sx={{
                    borderRadius: 3,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant='h6' sx={{ fontWeight: 'bold', color: '#333', mb: 0.5 }}>
                          {order.code}
                        </Typography>
                        <Typography variant='body2' color='text.secondary'>
                          Đặt hàng lúc {dayjs(order.created_at).format('DD/MM/YYYY HH:mm')}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getStatusIcon(order.status)}
                        <Chip
                          label={getStatusText(order.status)}
                          sx={{
                            backgroundColor: getStatusColorValue(order.status),
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '0.75rem'
                          }}
                        />
                      </Box>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <ReceiptIcon sx={{ color: '#666', fontSize: 20 }} />
                          <Typography variant='body2' color='text.secondary'>
                            Người nhận: <strong>{order.name}</strong>
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <ShippingIcon sx={{ color: '#666', fontSize: 20 }} />
                          <Typography variant='body2' color='text.secondary'>
                            {order.shipping_address}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PaymentIcon sx={{ color: '#666', fontSize: 20 }} />
                          <Typography variant='body2' color='text.secondary'>
                            {order.phone}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                          <Typography variant='h6' sx={{ fontWeight: 'bold', color: '#e91e63', mb: 1 }}>
                            {order.final_amount?.toLocaleString('vi-VN')} VNĐ
                          </Typography>
                          {order.discount_amount > 0 && (
                            <Typography variant='body2' color='success.main'>
                              Đã giảm: {order.discount_amount.toLocaleString('vi-VN')} VNĐ
                            </Typography>
                          )}
                        </Box>
                      </Grid>
                    </Grid>

                    <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'flex-end' }}>
                      <Button
                        variant='outlined'
                        startIcon={<VisibilityIcon />}
                        onClick={() => handleViewDetails(order)}
                        sx={{
                          borderRadius: 2,
                          textTransform: 'none',
                          px: 3
                        }}
                      >
                        Xem chi tiết
                      </Button>
                      {getStatusInfo(order.status).code === 'PENDINGPAYMENT' && (
                        <Button
                          variant='contained'
                          startIcon={<PaymentIcon />}
                          onClick={() => handlePayOrder(order.id)}
                          sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            px: 3,
                            backgroundColor: '#e91e63',
                            '&:hover': {
                              backgroundColor: '#c2185b'
                            }
                          }}
                        >
                          Thanh toán
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Pagination */}
        {orders?.totalPages > 1 && (
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
            <CustomPagination
              onChangePagination={handleOnchangePagination}
              pageSizeOptions={PAGE_SIZE_OPTION}
              pageSize={pageSize}
              totalPages={orders?.totalPages}
              page={page}
              rowLength={10}
              isHideShowed
            />
          </Box>
        )}

        {/* Order Detail Dialog */}
        <Dialog
          open={detailDialogOpen}
          onClose={() => setDetailDialogOpen(false)}
          maxWidth='md'
          fullWidth
          PaperProps={{
            sx: { borderRadius: 3 }
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Typography variant='h6' sx={{ fontWeight: 'bold' }}>
              Chi tiết đơn hàng {selectedOrder?.code}
            </Typography>
          </DialogTitle>
          <DialogContent>
            {loadingDetails ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : orderDetails ? (
              <Box>
                {/* Order Info */}
                <Paper sx={{ p: 2, mb: 3, backgroundColor: '#f8f9fa' }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                        Thông tin giao hàng
                      </Typography>
                      <Typography variant='body2' sx={{ mb: 1 }}>
                        <strong>Người nhận:</strong> {orderDetails.guess_name}
                      </Typography>
                      <Typography variant='body2' sx={{ mb: 1 }}>
                        <strong>Số điện thoại:</strong> {orderDetails.guess_phone}
                      </Typography>
                      <Typography variant='body2' sx={{ mb: 1 }}>
                        <strong>Email:</strong> {orderDetails.guess_email}
                      </Typography>
                      <Typography variant='body2'>
                        <strong>Địa chỉ:</strong> {orderDetails.shipping_address}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                        Thông tin đơn hàng
                      </Typography>
                      <Typography variant='body2' sx={{ mb: 1 }}>
                        <strong>Mã đơn hàng:</strong> {orderDetails.code}
                      </Typography>
                      <Typography variant='body2' sx={{ mb: 1 }}>
                        <strong>Ngày đặt:</strong> {dayjs(orderDetails.created_at).format('DD/MM/YYYY HH:mm')}
                      </Typography>
                      <Typography variant='body2' sx={{ mb: 1 }}>
                        <strong>Trạng thái:</strong> {getStatusText(orderDetails.current_status_id)}
                      </Typography>
                      {orderDetails.note && (
                        <Typography variant='body2'>
                          <strong>Ghi chú:</strong> {orderDetails.note}
                        </Typography>
                      )}
                    </Grid>
                  </Grid>
                </Paper>

                {/* Order Items */}
                <Typography variant='subtitle1' sx={{ fontWeight: 'bold', mb: 2 }}>
                  Sản phẩm đã đặt
                </Typography>
                {orderDetails.details && orderDetails.details.length > 0 ? (
                  <List>
                    {orderDetails.details.map((detail: any, index: number) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar
                            src={detail.variant?.watch?.thumbnail}
                            alt={detail.variant?.watch?.name}
                            sx={{ width: 60, height: 60 }}
                          />
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant='subtitle1' sx={{ fontWeight: 'bold' }}>
                              {detail.variant?.watch?.name}
                            </Typography>
                          }
                          secondary={
                            <Box>
                              <Typography variant='body2' color='text.secondary'>
                                Mã sản phẩm: {detail.variant?.watch?.code}
                              </Typography>
                              <Typography variant='body2' color='text.secondary'>
                                Giá: {detail.variant?.watch?.base_price?.toLocaleString('vi-VN')} VNĐ
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Alert severity='info'>Không có sản phẩm nào trong đơn hàng này.</Alert>
                )}

                {/* Order Summary */}
                <Paper sx={{ p: 2, mt: 3, backgroundColor: '#f8f9fa' }}>
                  <Typography variant='subtitle1' sx={{ fontWeight: 'bold', mb: 2 }}>
                    Tổng kết đơn hàng
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant='body2'>Tạm tính:</Typography>
                    <Typography variant='body2'>{orderDetails.total_amount?.toLocaleString('vi-VN')} VNĐ</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant='body2'>Phí vận chuyển:</Typography>
                    <Typography variant='body2'>{orderDetails.shipping_fee?.toLocaleString('vi-VN')} VNĐ</Typography>
                  </Box>
                  {orderDetails.discount_amount > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant='body2' color='success.main'>
                        Giảm giá:
                      </Typography>
                      <Typography variant='body2' color='success.main'>
                        -{orderDetails.discount_amount?.toLocaleString('vi-VN')} VNĐ
                      </Typography>
                    </Box>
                  )}
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant='h6' sx={{ fontWeight: 'bold' }}>
                      Tổng cộng:
                    </Typography>
                    <Typography variant='h6' sx={{ fontWeight: 'bold', color: '#e91e63' }}>
                      {orderDetails.final_amount?.toLocaleString('vi-VN')} VNĐ
                    </Typography>
                  </Box>
                </Paper>
              </Box>
            ) : (
              <Alert severity='error'>Không thể tải chi tiết đơn hàng.</Alert>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setDetailDialogOpen(false)} sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}>
              Đóng
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  )
}

export default OrderHistoryPage
