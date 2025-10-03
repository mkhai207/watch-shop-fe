import {
  Box,
  Button,
  Card,
  CardMedia,
  Container,
  Divider,
  Grid,
  IconButton,
  Paper,
  TextField,
  Typography,
  useTheme
} from '@mui/material'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useDispatch, useSelector } from 'react-redux'
import Spinner from 'src/components/spinner'
import ConfirmDialog from 'src/components/confirm-dialog/ConfirmDialog'
import InfoDialog from 'src/components/info-dialog/InfoDialog'
import { ROUTE_CONFIG } from 'src/configs/route'
import { AppDispatch, RootState } from 'src/stores'
import {
  deleteCartItemAsync,
  deleteCartItemsAsync,
  getCartItemsAsync,
  updateCartItemAsync
} from 'src/stores/apps/cart/action'

type TProps = {}

const CartPage: NextPage<TProps> = () => {
  const router = useRouter()
  const theme = useTheme()

  const [promoCode, setPromoCode] = useState('')
  const [isPromoApplied, setIsPromoApplied] = useState(false)
  const [localQuantities, setLocalQuantities] = useState<{ [key: string]: number }>({})
  const [confirmState, setConfirmState] = useState<{ open: boolean; itemId?: string; message?: string }>({
    open: false
  })
  const [infoState, setInfoState] = useState<{ open: boolean; title?: string; message?: string }>({ open: false })

  const dispatch: AppDispatch = useDispatch()
  const { items, isLoading, isSuccess, isError, message } = useSelector((state: RootState) => state.cart)

  const handleQuantityChange = (itemId: string, change: number) => {
    const item = items.find(i => i.id === itemId)
    if (!item) return

    const currentQuantity = localQuantities[itemId] || item.quantity || 1
    const desiredQuantity = currentQuantity + change
    const maxQuantity = Number((item as any)?.variant?.quantity) || Infinity

    // If decreasing below 1, confirm delete
    if (desiredQuantity < 1) {
      setConfirmState({
        open: true,
        itemId,
        message: 'Số lượng không thể nhỏ hơn 1. Bạn có muốn xóa sản phẩm này?'
      })
      return
    }

    // Cap at available stock
    if (desiredQuantity > maxQuantity) {
      const message = `Số lượng vượt quá hàng tồn (${maxQuantity}).`
      setInfoState({ open: true, title: 'Không thể cập nhật', message })
      setLocalQuantities(prev => ({ ...prev, [itemId]: maxQuantity }))
      dispatch(updateCartItemAsync({ itemId, data: { quantity: maxQuantity } }))
      return
    }

    setLocalQuantities(prev => ({ ...prev, [itemId]: desiredQuantity }))
    dispatch(updateCartItemAsync({ itemId, data: { quantity: desiredQuantity } }))
  }

  const handleDeleteCartItem = (itemId: string) => {
    setConfirmState({
      open: true,
      itemId,
      message: 'Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?'
    })
  }

  const handleClearCart = () => {
    dispatch(deleteCartItemsAsync())
  }

  const getItemPrice = (it: any) => (it?.variant?.product?.price ?? it?.variant?.price ?? 0) as number
  const handleCalculateTotalCart = () =>
    items?.reduce((acc: number, it: any) => acc + getItemPrice(it) * (it?.quantity || 0), 0) || 0
  const subtotal = useMemo(() => handleCalculateTotalCart(), [items])

  const formatPrice = (price: number) => `${price.toLocaleString('vi-VN')} đ`
  const shipping = 0
  const total = subtotal + shipping

  const handleNavigateHome = () => {
    router.push(ROUTE_CONFIG.HOME)
  }

  const handleNavigateCheckout = () => {
    router.push(ROUTE_CONFIG.CHECKOUT)
  }

  const fetchGetMyCart = () => {
    dispatch(getCartItemsAsync())
  }

  useEffect(() => {
    if (message) {
      console.log('message', message)
      if (isError) {
        toast.error(message)
      } else {
        toast.success(message)
      }
    }

    // dispatch(resetCart())
  }, [items, isSuccess, isLoading, isError, message])

  useEffect(() => {
    fetchGetMyCart()
  }, [])

  return (
    <>
      {isLoading && <Spinner />}
      <ConfirmDialog
        open={confirmState.open}
        description={confirmState.message}
        onClose={() => setConfirmState({ open: false })}
        onConfirm={() => {
          if (confirmState.itemId) dispatch(deleteCartItemAsync(confirmState.itemId))
          setConfirmState({ open: false })
        }}
      />
      <InfoDialog
        open={infoState.open}
        title={infoState.title}
        description={infoState.message}
        onClose={() => setInfoState({ open: false })}
      />
      <Container maxWidth='lg' sx={{ py: 4, mt: 4, minHeight: '50vh' }}>
        <Grid container spacing={4}>
          {/* Header outside boxes */}
          <Grid item xs={12}>
            <Typography
              component='div'
              sx={{
                fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', sans-serif !important`,
                fontWeight: 800,
                lineHeight: 1.15,
                letterSpacing: '-0.02em',
                mb: 1,
                fontSize: { xs: 28, sm: 36, md: 44 }
              }}
            >
              Giỏ hàng của bạn
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              {items.length} Sản phẩm
            </Typography>
          </Grid>

          {/* Left Column - Order Summary */}
          <Grid item xs={12} md={4} sx={{ order: { xs: 2, md: 2 } }}>
            <Paper variant='outlined' sx={{ p: 3, position: 'sticky', top: 0 }}>
              <Typography variant='h6' fontWeight='bold' sx={{ mb: 1.5 }}>
                Tóm tắt đơn hàng
              </Typography>

              {/* Promo code */}
              <Box>
                <Typography variant='body2' sx={{ mb: 1 }} fontWeight={500}>
                  Mã giảm giá
                </Typography>
                <Box display='flex' gap={1}>
                  <TextField
                    fullWidth
                    placeholder='Nhập mã giảm giá'
                    size='small'
                    value={promoCode}
                    onChange={e => setPromoCode(e.target.value)}
                  />
                  <IconButton color='primary' onClick={() => setIsPromoApplied(Boolean(promoCode))}>
                    <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                      <path d='M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L3 13.99V4h10l7.59 7.59a2 2 0 0 1 0 2.82z' />
                      <circle cx='7.5' cy='7.5' r='1.5' />
                    </svg>
                  </IconButton>
                </Box>
                {isPromoApplied && (
                  <Typography variant='caption' color='success.main' sx={{ mt: 0.5, display: 'block' }}>
                    Mã giảm giá đã được áp dụng!
                  </Typography>
                )}
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Breakdown */}
              <Box display='flex' justifyContent='space-between' sx={{ mb: 1 }}>
                <Typography>Tạm tính:</Typography>
                <Typography>{formatPrice(subtotal)}</Typography>
              </Box>
              <Box display='flex' justifyContent='space-between' sx={{ mb: 1 }}>
                <Typography>Phí vận chuyển:</Typography>
                <Typography>{shipping === 0 ? 'Miễn phí' : formatPrice(shipping)}</Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box display='flex' justifyContent='space-between' alignItems='center' sx={{ mb: 2 }}>
                <Typography variant='subtitle1' fontWeight='bold'>
                  Tổng cộng:
                </Typography>
                <Typography variant='h5' color='error' fontWeight='bold'>
                  {formatPrice(total)}
                </Typography>
              </Box>

              {/* Checkout Button */}
              <Button
                fullWidth
                variant='contained'
                size='large'
                sx={{
                  py: 1.5,
                  backgroundColor: theme.palette.text.primary,
                  color: theme.palette.background.paper,
                  fontWeight: 'bold',
                  textTransform: 'none',
                  fontSize: '1rem',
                  mb: 2,
                  '&:hover': { opacity: 0.9 }
                }}
                onClick={handleNavigateCheckout}
              >
                Tiến hành thanh toán
                <Box component='span' sx={{ ml: 1, display: 'inline-flex' }}>
                  <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                    <polyline points='9,18 15,12 9,6' />
                  </svg>
                </Box>
              </Button>

              <Box textAlign='center'>
                <Typography variant='caption' color='text.secondary' display='block'>
                  Thanh toán an toàn và bảo mật
                </Typography>
                <Typography variant='caption' color='text.secondary' display='block'>
                  Hỗ trợ 24/7 - Hotline: 1900 1234
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Right Column - Shopping Cart list in hidden-scroll box */}
          <Grid item xs={12} md={8} sx={{ order: { xs: 1, md: 1 } }}>
            <Paper
              variant='outlined'
              sx={{
                p: 2,
                maxHeight: { xs: 'unset', md: '70vh' },
                overflowY: { xs: 'visible', md: 'auto' },
                '::-webkit-scrollbar': { display: 'none' },
                msOverflowStyle: 'none',
                scrollbarWidth: 'none'
              }}
            >
              {items && items.length > 0
                ? items.map(item => (
                    <>
                      <Card variant='outlined' sx={{ mb: 3 }}>
                        <Box sx={{ p: 3 }}>
                          <Grid container spacing={3} alignItems='center'>
                            {/* Product Image */}
                            <Grid item xs={12} sm={3}>
                              <CardMedia
                                component='img'
                                height={120}
                                image={
                                  (item as any)?.variant?.product?.thumbnail ||
                                  (item as any)?.variant?.watch?.thumbnail ||
                                  '/placeholder.svg'
                                }
                                alt={
                                  (item as any)?.variant?.product?.name ||
                                  (item as any)?.variant?.watch?.name ||
                                  'product'
                                }
                                sx={{ objectFit: 'cover', borderRadius: 1 }}
                              />
                            </Grid>

                            {/* Product Details */}
                            <Grid item xs={12} sm={6}>
                              <Typography variant='h6' fontWeight='bold' gutterBottom>
                                {(item as any)?.variant?.product?.name || (item as any)?.variant?.watch?.name}
                              </Typography>
                              <Typography variant='body2' color='text.secondary' gutterBottom>
                                {(item as any)?.variant?.color?.name}
                                {((item as any)?.variant?.size?.name && ` / ${(item as any)?.variant?.size?.name}`) ||
                                  ''}
                              </Typography>
                              <Typography variant='body2' color='text.secondary' gutterBottom>
                                {(item as any)?.variant?.product?.id || (item as any)?.variant?.watch?.id}
                              </Typography>
                              <Typography variant='h6' color='error' fontWeight='bold'>
                                {(
                                  (item as any)?.variant?.product?.price ||
                                  (item as any)?.variant?.price ||
                                  0
                                ).toLocaleString('vi-VN')}{' '}
                                VNĐ
                              </Typography>
                            </Grid>

                            {/* Quantity Controls */}
                            <Grid item xs={12} sm={3}>
                              <Box display='flex' flexDirection='column' alignItems='center' gap={2}>
                                <Box display='flex' alignItems='center' border='1px solid #e0e0e0' borderRadius={1}>
                                  <IconButton size='small' onClick={() => handleQuantityChange(item.id, -1)}>
                                    <svg
                                      width='16'
                                      height='16'
                                      viewBox='0 0 24 24'
                                      fill='none'
                                      stroke='currentColor'
                                      strokeWidth='2'
                                    >
                                      <line x1='5' y1='12' x2='19' y2='12' />
                                    </svg>
                                  </IconButton>
                                  <TextField
                                    value={item.quantity}
                                    size='small'
                                    sx={{
                                      width: 50,
                                      '& .MuiOutlinedInput-root': { '& fieldset': { border: 'none' } },
                                      '& input': { textAlign: 'center', padding: '8px 0' }
                                    }}
                                    inputProps={{ readOnly: true }}
                                  />
                                  <IconButton
                                    size='small'
                                    onClick={() => handleQuantityChange(item.id, 1)}
                                    disabled={item.quantity >= ((item as any)?.variant?.quantity || Infinity)}
                                  >
                                    <svg
                                      width='16'
                                      height='16'
                                      viewBox='0 0 24 24'
                                      fill='none'
                                      stroke='currentColor'
                                      strokeWidth='2'
                                    >
                                      <line x1='12' y1='5' x2='12' y2='19' />
                                      <line x1='5' y1='12' x2='19' y2='12' />
                                    </svg>
                                  </IconButton>
                                </Box>

                                <Button
                                  variant='text'
                                  size='small'
                                  sx={{
                                    textDecoration: 'underline',
                                    color: 'text.secondary',
                                    textTransform: 'none',
                                    '&:hover': { color: 'error.main' }
                                  }}
                                  onClick={() => handleDeleteCartItem(item.id)}
                                >
                                  Xóa
                                </Button>

                                <Typography variant='h6' color='error' fontWeight='bold'>
                                  {(
                                    ((item as any)?.variant?.product?.price || (item as any)?.variant?.price || 0) *
                                    item.quantity
                                  ).toLocaleString('vi-VN')}{' '}
                                  VNĐ
                                </Typography>
                              </Box>
                            </Grid>
                          </Grid>
                        </Box>
                      </Card>
                    </>
                  ))
                : null}
            </Paper>

            {items && items.length > 0 && (
              <Box display='flex' justifyContent='flex-end' alignItems='center' mt={1.5}>
                <Button variant='outlined' color='error' onClick={handleClearCart} sx={{ textTransform: 'none' }}>
                  Xóa tất cả
                </Button>
              </Box>
            )}
          </Grid>
        </Grid>
      </Container>
    </>
  )
}

export default CartPage
