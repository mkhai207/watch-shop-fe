import {
  Box,
  Button,
  Card,
  CardMedia,
  Container,
  Grid,
  IconButton,
  Paper,
  TextField,
  Typography,
  useTheme
} from '@mui/material'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useDispatch, useSelector } from 'react-redux'
import Spinner from 'src/components/spinner'
import { ROUTE_CONFIG } from 'src/configs/route'
import { AppDispatch, RootState } from 'src/stores'
import { deleteCartItemAsync, getCartItemsAsync, updateCartItemAsync } from 'src/stores/apps/cart/action'

type TProps = {}

const CartPage: NextPage<TProps> = () => {
  const router = useRouter()
  const theme = useTheme()

  const [promoCode, setPromoCode] = useState('')
  const [localQuantities, setLocalQuantities] = useState<{ [key: string]: number }>({})

  const dispatch: AppDispatch = useDispatch()
  const { items, isLoading, isSuccess, isError, message } = useSelector((state: RootState) => state.cart)

  const handleQuantityChange = (itemId: string, change: number) => {
    const item = items.find(i => i.id === itemId)
    if (item) {
      const currentQuantity = localQuantities[itemId] || item.quantity || 1
      const newQuantity = Math.max(1, currentQuantity + change)
      setLocalQuantities(prev => ({ ...prev, [itemId]: newQuantity }))
      dispatch(updateCartItemAsync({ itemId, data: { quantity: newQuantity } }))
    }
  }

  const handleDeleteCartItem = (itemId: string) => {
    console.log('itemId', itemId)
    dispatch(deleteCartItemAsync(itemId))
  }

  const handleCalculateTotalCart = () => {
    return items.reduce((acc, item) => acc + item.variant.product.price * item.quantity, 0)
  }

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
      <Container maxWidth='lg' sx={{ py: 4, minHeight: '50vh' }}>
        <Grid container spacing={4}>
          {/* Left Column - Shopping Cart */}
          <Grid item xs={12} md={8}>
            <Typography variant='h5' fontWeight='bold' sx={{ mb: 3 }}>
              Giỏ hàng:
            </Typography>

            {/* Product Count */}
            <Box sx={{ mb: 2, textAlign: 'right' }}>
              <Typography
                variant='body2'
                sx={{
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  '&:hover': { color: 'primary.main' }
                }}
              >
                {items.length} Sản phẩm
              </Typography>
            </Box>

            {/* Product Item */}
            {items && items.length > 0 ? (
              items.map(item => (
                <>
                  <Card variant='outlined' sx={{ mb: 3 }}>
                    <Box sx={{ p: 3 }}>
                      <Grid container spacing={3} alignItems='center'>
                        {/* Product Image */}
                        <Grid item xs={12} sm={3}>
                          <CardMedia
                            component='img'
                            height={120}
                            image={item.variant.product.thumbnail}
                            alt={item.variant.product.name}
                            sx={{
                              objectFit: 'cover',
                              borderRadius: 1
                            }}
                          />
                        </Grid>

                        {/* Product Details */}
                        <Grid item xs={12} sm={6}>
                          <Typography variant='h6' fontWeight='bold' gutterBottom>
                            {item.variant.product.name}
                          </Typography>
                          <Typography variant='body2' color='text.secondary' gutterBottom>
                            {item.variant.color.name} / {item.variant.size.name}
                          </Typography>
                          <Typography variant='body2' color='text.secondary' gutterBottom>
                            {item.variant.product.id}
                          </Typography>
                          <Typography variant='h6' color='error' fontWeight='bold'>
                            {item.variant.product.price} VNĐ
                          </Typography>
                        </Grid>

                        {/* Quantity Controls */}
                        <Grid item xs={12} sm={3}>
                          <Box display='flex' flexDirection='column' alignItems='center' gap={2}>
                            {/* Quantity Selector */}
                            <Box display='flex' alignItems='center' border='1px solid #e0e0e0' borderRadius={1}>
                              <IconButton
                                size='small'
                                onClick={() => handleQuantityChange(item.id, -1)}
                                disabled={item.quantity <= 1}
                              >
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
                                  '& .MuiOutlinedInput-root': {
                                    '& fieldset': { border: 'none' }
                                  },
                                  '& input': { textAlign: 'center', padding: '8px 0' }
                                }}
                                inputProps={{ readOnly: true }}
                              />
                              <IconButton size='small' onClick={() => handleQuantityChange(item.id, 1)}>
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

                            {/* Remove Button */}
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

                            {/* Item Total */}
                            <Typography variant='h6' color='error' fontWeight='bold'>
                              {(item.variant.product.price * item.quantity).toLocaleString()} VNĐ
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>
                  </Card>
                </>
              ))
            ) : (
              <></>
            )}
          </Grid>

          {/* Right Column - Order Summary */}
          <Grid item xs={12} md={4}>
            <Paper variant='outlined' sx={{ p: 3 }}>
              <Typography variant='h5' fontWeight='bold' sx={{ mb: 3 }}>
                Thông tin đơn hàng
              </Typography>

              {/* Total Price */}
              <Box display='flex' justifyContent='space-between' alignItems='center' sx={{ mb: 3 }}>
                <Typography variant='h6' fontWeight='bold'>
                  Tổng tiền:
                </Typography>
                <Typography variant='h4' color='error' fontWeight='bold'>
                  {handleCalculateTotalCart().toLocaleString()} VNĐ
                </Typography>
              </Box>

              {/* Shipping Info */}
              <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                Phí vận chuyển sẽ được tính ở trang thanh toán.
              </Typography>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
                Freeship toàn quốc cho đơn hàng từ 500k.
              </Typography>

              {/* Promo Code */}
              {/* <TextField
                fullWidth
                placeholder='Nhập mã khuyến mãi (nếu có)'
                variant='outlined'
                value={promoCode}
                onChange={e => setPromoCode(e.target.value)}
                sx={{ mb: 3 }}
              /> */}

              {/* Checkout Button */}
              <Button
                fullWidth
                variant='contained'
                size='large'
                sx={{
                  py: 1.5,
                  backgroundColor: theme.palette.primary.dark,
                  color: 'white',
                  fontWeight: 'bold',
                  textTransform: 'none',
                  fontSize: '1rem',
                  mb: 2,
                  '&:hover': {
                    backgroundColor: 'grey.800'
                  }
                }}
                onClick={handleNavigateCheckout}
              >
                THANH TOÁN NGAY
              </Button>

              {/* Continue Shopping */}
              <Button
                fullWidth
                variant='text'
                startIcon={
                  <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                    <polyline points='15,18 9,12 15,6' />
                  </svg>
                }
                sx={{
                  color: 'text.secondary',
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: 'grey.50'
                  }
                }}
                onClick={handleNavigateHome}
              >
                Tiếp tục mua hàng
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </>
  )
}

export default CartPage
