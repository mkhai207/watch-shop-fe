import {
  LocationOn as LocationIcon,
  CreditCard as PaymentIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Print as PrintIcon,
  Receipt as ReceiptIcon,
  ArrowBack as ArrowBackIcon,
  Star as StarIcon
} from '@mui/icons-material'
import { useTheme } from '@mui/material'
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Rating,
  Stack,
  Typography
} from '@mui/material'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import IconifyIcon from 'src/components/Icon'
import Spinner from 'src/components/spinner'
import { getOrderDetail, getOrderStatusHistories, OrderStatusHistoryItem } from 'src/services/order'
import { createReviewV1 } from 'src/services/review'
import { useAuth } from 'src/hooks/useAuth'
import { getStatusColor, getStatusText } from 'src/utils/status-style'
import ReviewModal from '../components/ReviewModal'
import { TReview } from 'src/types/review'

const OrderDetailPage = () => {
  const theme = useTheme()
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [orderDetail, setOrderDetail] = useState<any>(null)
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [statusHistories, setStatusHistories] = useState<OrderStatusHistoryItem[]>([])

  const fetchGetDetailOrder = async () => {
    try {
      setLoading(true)

      const response = await getOrderDetail(router?.query?.orderId as string)
      const historiesRes = await getOrderStatusHistories(router?.query?.orderId as string)

      if (response.status === 'success') {
        console.log('data', response?.data)
        setOrderDetail(response?.data)
        if ((historiesRes as any)?.orderStatusHistorys) {
          setStatusHistories((historiesRes as any).orderStatusHistorys)
        }

        toast.success('Tải chi tiết đơn hàng thành công!')
      } else {
        toast.error(response.message || 'Có lỗi xảy ra khi tải chi tiết đơn hàng')
      }
    } catch (error: any) {
      console.error('Error fetching products:', error)
      toast.error(error?.message || 'Có lỗi xảy ra khi tải chi tiết đơn hàng')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleBack = () => {
    router.back()
  }

  const handlePrint = () => {
    window.print()
  }

  useEffect(() => {
    fetchGetDetailOrder()
  }, [])

  return (
    <>
      {loading && <Spinner />}
      <Container maxWidth='lg' sx={{ py: 4 }}>
        {/* Header với nút Back */}
        <Box sx={{ mb: 4 }}>
          <Box display='flex' alignItems='center' justifyContent='space-between' mb={2}>
            <Box display='flex' alignItems='center'>
              <IconButton
                onClick={handleBack}
                sx={{
                  mr: 2,
                  '&:hover': {
                    backgroundColor: 'primary.light',
                    color: 'white'
                  }
                }}
              >
                <ArrowBackIcon />
              </IconButton>
              <Typography
                variant='h3'
                component='h1'
                fontWeight='bold'
                sx={{
                  background: theme.palette.primary.main,
                  backgroundClip: 'text',
                  textFillColor: 'transparent',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Chi tiết đơn hàng #{orderDetail?.id}
              </Typography>
            </Box>
            <Stack direction='row' spacing={2}>
              {orderDetail?.status === 'COMPLETED' && (
                <Button
                  variant='contained'
                  startIcon={<StarIcon />}
                  onClick={() => setReviewModalOpen(true)}
                  size='large'
                  sx={{
                    background: 'linear-gradient(45deg, #FF9800 30%, #FFB74D 90%)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #F57C00 30%, #FF9800 90%)'
                    }
                  }}
                >
                  Đánh giá
                </Button>
              )}
              <Button
                variant='contained'
                startIcon={<PrintIcon />}
                onClick={handlePrint}
                size='large'
                sx={{
                  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1976D2 30%, #0288D1 90%)'
                  }
                }}
              >
                In đơn hàng
              </Button>
            </Stack>
          </Box>
          <Divider />
        </Box>

        {/* Content */}
        <Grid container spacing={4}>
          {/* Thông tin đơn hàng */}
          <Grid item xs={12} md={6}>
            <Card
              elevation={4}
              sx={{
                height: '100%',

                // background: 'linear-gradient(145deg, #f0f4f8 0%, #ffffff 100%)',
                background: theme.palette.background.paper,
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 8
                },
                transition: 'all 0.3s ease'
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box display='flex' alignItems='center' mb={3}>
                  <ReceiptIcon color='primary' sx={{ mr: 2, fontSize: 28 }} />
                  <Typography variant='h5' fontWeight='bold' color='primary'>
                    Thông tin đơn hàng
                  </Typography>
                </Box>
                <List>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText
                      primary={
                        <Typography variant='body1' color='text.secondary' fontWeight='medium'>
                          Mã đơn hàng
                        </Typography>
                      }
                      secondary={
                        <Typography variant='h6' fontWeight='bold' color='text.primary'>
                          #{orderDetail?.id}
                        </Typography>
                      }
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText
                      primary={
                        <Typography variant='body1' color='text.secondary' fontWeight='medium'>
                          Ngày đặt hàng
                        </Typography>
                      }
                      secondary={
                        <Typography variant='body1' fontWeight='bold'>
                          {formatDate(orderDetail?.created_at)}
                        </Typography>
                      }
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText
                      primary={
                        <Typography variant='body1' color='text.secondary' fontWeight='medium'>
                          Trạng thái
                        </Typography>
                      }
                      secondary={
                        <Chip
                          label={getStatusText(orderDetail?.status)}
                          color={getStatusColor(orderDetail?.status)}
                          size='medium'
                          sx={{ fontWeight: 'bold', mt: 1 }}
                        />
                      }
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText
                      primary={
                        <Typography variant='body1' color='text.secondary' fontWeight='medium'>
                          Mã giao dịch
                        </Typography>
                      }
                      secondary={
                        <Typography variant='body1' fontWeight='bold'>
                          {orderDetail?.transaction_id}
                        </Typography>
                      }
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Thông tin khách hàng */}
          <Grid item xs={12} md={6}>
            <Card
              elevation={4}
              sx={{
                height: '100%',

                // background: 'linear-gradient(145deg, #f0f4f8 0%, #ffffff 100%)',
                background: theme.palette.background.paper,
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 8
                },
                transition: 'all 0.3s ease'
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box display='flex' alignItems='center' mb={3}>
                  <PersonIcon color='primary' sx={{ mr: 2, fontSize: 28 }} />
                  <Typography variant='h5' fontWeight='bold' color='primary'>
                    Thông tin khách hàng
                  </Typography>
                </Box>
                <List>
                  <ListItem sx={{ px: 0, pb: 2 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                        <PersonIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant='body1' color='text.secondary' fontWeight='medium'>
                          Tên khách hàng
                        </Typography>
                      }
                      secondary={
                        <Typography variant='h6' fontWeight='bold'>
                          {orderDetail?.name}
                        </Typography>
                      }
                      sx={{ ml: 2 }}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0, pb: 2 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'success.main', width: 48, height: 48 }}>
                        <PhoneIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant='body1' color='text.secondary' fontWeight='medium'>
                          Số điện thoại
                        </Typography>
                      }
                      secondary={
                        <Typography variant='h6' fontWeight='bold'>
                          {orderDetail?.phone}
                        </Typography>
                      }
                      sx={{ ml: 2 }}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0, pb: 2 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'info.main', width: 48, height: 48 }}>
                        <LocationIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant='body1' color='text.secondary' fontWeight='medium'>
                          Địa chỉ giao hàng
                        </Typography>
                      }
                      secondary={
                        <Typography variant='h6' fontWeight='bold'>
                          {orderDetail?.shipping_address}
                        </Typography>
                      }
                      sx={{ ml: 2 }}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0, pb: 0 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'warning.main', width: 48, height: 48 }}>
                        <PaymentIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant='body1' color='text.secondary' fontWeight='medium'>
                          Phương thức thanh toán
                        </Typography>
                      }
                      secondary={
                        <Typography variant='h6' fontWeight='bold'>
                          {orderDetail?.payment_method === 'ONLINE' ? 'Thanh toán online' : 'COD'}
                        </Typography>
                      }
                      sx={{ ml: 2 }}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Chi tiết sản phẩm */}
          <Grid item xs={12}>
            <Card
              elevation={4}
              sx={{
                background: theme.palette.background.paper,
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 8
                },
                transition: 'all 0.3s ease'
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box display='flex' alignItems='center' mb={4}>
                  <IconifyIcon
                    icon='material-symbols:shopping-bag'
                    style={{ fontSize: 28, marginRight: 16, color: '#1976d2' }}
                  />
                  <Typography variant='h5' fontWeight='bold' color='primary'>
                    Chi tiết sản phẩm
                  </Typography>
                </Box>
                {orderDetail?.orderDetails.map((item: any, index: number) => (
                  <Box key={item.id}>
                    <Paper
                      elevation={3}
                      sx={{
                        p: 3,
                        mb: 3,

                        background: 'linear-gradient(145deg, #f0f4f8 0%, #ffffff 100%)',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: 6
                        },
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <Grid container spacing={3} alignItems='center'>
                        <Grid item xs={12} sm={4} md={3}>
                          <Box
                            component='img'
                            sx={{
                              width: '100%',
                              height: 180,
                              objectFit: 'cover',
                              borderRadius: 3,
                              boxShadow: 3
                            }}
                            src={item.variant.product.thumbnail}
                            alt={item.variant.product.name}
                          />
                        </Grid>
                        <Grid item xs={12} sm={5} md={6}>
                          <Typography variant='h5' gutterBottom fontWeight='bold' color='text.primary'>
                            {item.variant.product.name}
                          </Typography>
                          <Typography variant='body1' color='text.secondary' sx={{ mb: 3, lineHeight: 1.6 }}>
                            {item.variant.product.description}
                          </Typography>
                          <Stack direction='row' spacing={2} sx={{ mb: 2 }}>
                            <Chip
                              label={`Size: ${item.variant.size.name}`}
                              variant='outlined'
                              color='primary'
                              sx={{ fontWeight: 'bold' }}
                            />
                            <Chip
                              label={`Màu: ${item.variant.color.name}`}
                              variant='outlined'
                              color='secondary'
                              sx={{ fontWeight: 'bold' }}
                              icon={
                                <Box
                                  sx={{
                                    width: 16,
                                    height: 16,
                                    borderRadius: '50%',
                                    backgroundColor: item.variant.color.hex_code,
                                    border: '2px solid #ccc',
                                    ml: 1
                                  }}
                                />
                              }
                            />
                          </Stack>
                          <Typography variant='body1' color='warning.main' fontWeight='bold'>
                            ⭐ {item.variant.product.rating}/5 đánh giá
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <Box textAlign={{ xs: 'left', sm: 'right' }}>
                            <Typography variant='h4' color='error.main' fontWeight='bold' gutterBottom>
                              {formatCurrency(item.price)}
                            </Typography>
                            <Typography variant='h6' color='text.secondary' gutterBottom>
                              Số lượng: <strong>{item.quantity}</strong>
                            </Typography>
                            <Typography variant='h5' fontWeight='bold' color='primary.main'>
                              Thành tiền: {formatCurrency(item.price * item.quantity)}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Paper>
                    {index < orderDetail?.orderDetails.length - 1 && <Divider sx={{ my: 3 }} />}
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Lịch sử trạng thái đơn hàng */}
          <Grid item xs={12}>
            <Card
              elevation={4}
              sx={{
                background: theme.palette.background.paper,
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 8
                },
                transition: 'all 0.3s ease'
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box display='flex' alignItems='center' mb={4}>
                  <IconifyIcon
                    icon='material-symbols:timeline'
                    style={{ fontSize: 28, marginRight: 16, color: '#1976d2' }}
                  />
                  <Typography variant='h5' fontWeight='bold' color='primary'>
                    Lịch sử trạng thái
                  </Typography>
                </Box>

                {statusHistories && statusHistories.length > 0 ? (
                  <List>
                    {statusHistories.map((h, idx) => (
                      <>
                        <ListItem key={h.id} alignItems='flex-start' sx={{ px: 0 }}>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                              <IconifyIcon icon='material-symbols:flag' />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Stack direction='row' spacing={2} alignItems='center'>
                                <Chip
                                  label={h.status?.name || h.status?.code || 'Trạng thái'}
                                  color={getStatusColor(h.status?.code || orderDetail?.status)}
                                  sx={{ fontWeight: 'bold' }}
                                />
                                <Typography variant='body2' color='text.secondary'>
                                  {h.status?.description}
                                </Typography>
                              </Stack>
                            }
                            secondary={
                              <Typography variant='body2' color='text.secondary'>
                                {h.note || ''} {formatDate(h.created_at)}
                              </Typography>
                            }
                          />
                        </ListItem>
                        {idx < statusHistories.length - 1 && <Divider sx={{ my: 2 }} />}
                      </>
                    ))}
                  </List>
                ) : (
                  <Typography color='text.secondary'>Không có lịch sử trạng thái.</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card
              elevation={4}
              sx={{
                background: theme.palette.background.paper,
                border: '2px solid #e2e8f0',
                borderRadius: 3,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 6
                },
                transition: 'all 0.3s ease'
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box
                  display='flex'
                  justifyContent='space-between'
                  alignItems='center'
                  sx={{
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: { xs: 2, sm: 0 }
                  }}
                >
                  <Box display='flex' alignItems='center'>
                    <IconifyIcon
                      icon='material-symbols:receipt-long'
                      style={{ fontSize: 32, marginRight: 12, color: '#1976d2' }}
                    />
                    <Typography variant='h5' fontWeight='bold' color='primary.main'>
                      Tổng tiền đơn hàng:
                    </Typography>
                  </Box>
                  <Box textAlign={{ xs: 'center', sm: 'right' }}>
                    <Typography
                      variant='h4'
                      fontWeight='bold'
                      color='error.main'
                      sx={{
                        fontSize: { xs: '1.75rem', sm: '2.125rem' },
                        textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
                      }}
                    >
                      {formatCurrency(orderDetail?.total_money)}
                    </Typography>
                    <Typography variant='body2' color='text.secondary' sx={{ mt: 0.5 }}>
                      (Đã bao gồm VAT)
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Review Modal */}
      {orderDetail && (
        <ReviewModal
          open={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          orderId={orderDetail.id}
          productIds={orderDetail.orderDetails.map((item: any) => item.variant.product.id).join(',')}
          productNames={orderDetail.orderDetails.map((item: any) => item.variant.product.name).join(', ')}
        />
      )}
    </>
  )
}

export default OrderDetailPage
