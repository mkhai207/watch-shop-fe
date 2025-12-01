import {
  Box,
  Button,
  Card,
  CardMedia,
  Checkbox,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  Paper,
  TextField,
  Typography,
  useTheme
} from '@mui/material'
import dayjs from 'dayjs'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useDispatch, useSelector } from 'react-redux'
import ConfirmDialog from 'src/components/confirm-dialog/ConfirmDialog'
import InfoDialog from 'src/components/info-dialog/InfoDialog'
import Spinner from 'src/components/spinner'
import { ROUTE_CONFIG } from 'src/configs/route'
import { deleteCartItemsByIds } from 'src/services/cart'
import { AppDispatch, RootState } from 'src/stores'
import { deleteCartItemAsync, getCartItemsAsync, updateCartItemAsync } from 'src/stores/apps/cart/action'

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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [discounts, setDiscounts] = useState<any[]>([])
  const [discountDialogOpen, setDiscountDialogOpen] = useState(false)
  const [appliedDiscount, setAppliedDiscount] = useState<any | null>(null)
  const [discountAmount, setDiscountAmount] = useState<number>(0)

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

  const handleClearCart = async () => {
    const ids = Array.from(selectedIds.size > 0 ? selectedIds : new Set(items.map(i => i.id)))
    if (ids.length === 0) return

    try {
      await deleteCartItemsByIds(ids.map(id => (typeof id === 'string' ? parseInt(id, 10) : id)))
      dispatch(getCartItemsAsync())
      toast.success('Đã xóa sản phẩm khỏi giỏ hàng')
    } catch (e) {
      toast.error('Xóa sản phẩm thất bại')
    }
  }

  const getItemPrice = (it: any) => (it?.variant?.product?.price ?? it?.variant?.price ?? 0) as number
  const handleCalculateSelectedTotal = () =>
    items?.reduce(
      (acc: number, it: any) => (selectedIds.has(it.id) ? acc + getItemPrice(it) * (it?.quantity || 0) : acc),
      0
    ) || 0
  const selectedSubtotal = useMemo(() => handleCalculateSelectedTotal(), [items, selectedIds])

  const formatPrice = (price: number) => `${price.toLocaleString('vi-VN')} đ`
  const shipping = 0
  const selectedTotalAfterDiscount = Math.max(0, selectedSubtotal - discountAmount) + shipping

  const handleNavigateCheckout = () => {
    try {
      const ids = Array.from(selectedIds)
      if (ids.length === 0) {
        toast.error('Vui lòng chọn ít nhất 1 sản phẩm để thanh toán')

        return
      }
      localStorage.setItem('selectedCartItemIds', JSON.stringify(ids))
    } catch {}
    router.push(ROUTE_CONFIG.CHECKOUT)
  }

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(items.map(i => i.id)))
    } else {
      setSelectedIds(new Set())
    }
  }

  const toggleSelectOne = (id: string, checked: boolean) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)

      return next
    })
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

  useEffect(() => {
    if (typeof window === 'undefined') return
    const shouldReset = localStorage.getItem('shouldResetCartDiscount')
    if (shouldReset) {
      localStorage.removeItem('shouldResetCartDiscount')
      localStorage.removeItem('selectedDiscountCode')
      setPromoCode('')
      setIsPromoApplied(false)
      setAppliedDiscount(null)
      setDiscountAmount(0)
    }
  }, [])

  // Fetch discounts (v1)
  useEffect(() => {
    ;(async () => {
      try {
        const { v1GetDiscounts } = await import('src/services/discount')
        const res = await v1GetDiscounts({ page: 1, limit: 50 })
        const list = res?.discounts?.items || []
        setDiscounts(list)
      } catch (e) {
        // ignore
      }
    })()
  }, [])

  // Recalculate discount when selection or subtotal changes
  useEffect(() => {
    if (!appliedDiscount) {
      setDiscountAmount(0)

      return
    }
    const amount = computeDiscountAmount(selectedSubtotal, appliedDiscount)
    setDiscountAmount(amount)
  }, [appliedDiscount, selectedSubtotal])

  const isDiscountInDate = (d: any) => {
    const now = dayjs()
    const start = dayjs(d.effective_date, ['YYYYMMDDHHmmss', 'YYYY-MM-DDTHH:mm:ssZ'])
    const end = dayjs(d.valid_until, ['YYYYMMDDHHmmss', 'YYYY-MM-DDTHH:mm:ssZ'])

    return now.isAfter(start) && now.isBefore(end)
  }

  const isDiscountEligibleForSubtotal = (d: any, amount: number) => {
    const minOrder = Number(d.min_order_value || 0)

    return amount >= minOrder
  }

  const computeDiscountAmount = (amount: number, d: any) => {
    if (!d) return 0
    if (!isDiscountInDate(d)) return 0
    if (!isDiscountEligibleForSubtotal(d, amount)) return 0

    const type = String(d.discount_type)
    const value = Number(d.discount_value || 0)
    let discount = 0
    if (type === '1') {
      // percentage
      discount = Math.floor((amount * value) / 100)
      const cap = d.max_discount_amount != null ? Number(d.max_discount_amount) : null
      if (cap && cap > 0) discount = Math.min(discount, cap)
    } else {
      // fixed amount
      discount = Number(value)
    }

    return Math.max(0, Math.min(amount, discount))
  }

  const handleApplyCode = () => {
    const code = (promoCode || '').trim().toLowerCase()
    if (!code) {
      setIsPromoApplied(false)
      setAppliedDiscount(null)
      setDiscountAmount(0)
      try {
        localStorage.removeItem('selectedDiscountCode')
      } catch {}

      return
    }
    const found = discounts.find(d => String(d.code || '').toLowerCase() === code)
    if (!found) {
      toast.error('Mã giảm giá không tồn tại')
      setIsPromoApplied(false)
      setAppliedDiscount(null)
      setDiscountAmount(0)
      try {
        localStorage.removeItem('selectedDiscountCode')
      } catch {}

      return
    }
    if (!isDiscountInDate(found)) {
      toast.error('Mã giảm giá chưa hiệu lực hoặc đã hết hạn')

      return
    }
    if (!isDiscountEligibleForSubtotal(found, selectedSubtotal)) {
      toast.error(`Đơn tối thiểu ${formatPrice(Number(found.min_order_value || 0))}`)

      return
    }
    setAppliedDiscount(found)
    setIsPromoApplied(true)
    const amount = computeDiscountAmount(selectedSubtotal, found)
    setDiscountAmount(amount)
    try {
      localStorage.setItem('selectedDiscountCode', found.code)
    } catch {}
    toast.success('Áp dụng mã giảm giá thành công')
  }

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
              {items?.length || 0} Sản phẩm
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
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleApplyCode()
                    }}
                  />
                  <Button variant='outlined' onClick={() => setDiscountDialogOpen(true)} sx={{ textTransform: 'none' }}>
                    Chọn mã giảm giá
                  </Button>
                </Box>
                {isPromoApplied && appliedDiscount && (
                  <Typography variant='caption' color='success.main' sx={{ mt: 0.5, display: 'block' }}>
                    Đã áp dụng mã <b>{appliedDiscount.code}</b> (-{formatPrice(discountAmount)})
                  </Typography>
                )}
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Breakdown (the amounts below reflect only selected items) */}
              <Box display='flex' justifyContent='space-between' sx={{ mb: 1 }}>
                <Typography>Tạm tính:</Typography>
                <Typography>{formatPrice(selectedSubtotal)}</Typography>
              </Box>
              {discountAmount > 0 && (
                <Box display='flex' justifyContent='space-between' sx={{ mb: 1 }}>
                  <Typography color='success.main'>Giảm giá</Typography>
                  <Typography color='success.main'>-{formatPrice(discountAmount)}</Typography>
                </Box>
              )}
              <Box display='flex' justifyContent='space-between' sx={{ mb: 1 }}>
                <Typography>Phí vận chuyển:</Typography>
                <Typography>{shipping === 0 ? 'Miễn phí' : formatPrice(shipping)}</Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box display='flex' justifyContent='space-between' alignItems='center' sx={{ mb: 2 }}>
                <Typography variant='subtitle1' fontWeight='bold'>
                  Tổng cộng:
                </Typography>
                <Box textAlign='right'>
                  <Typography variant='caption' color='text.secondary' display='block'>
                    Đã chọn
                  </Typography>
                  <Typography variant='h5' color='error' fontWeight='bold'>
                    {formatPrice(selectedTotalAfterDiscount)}
                  </Typography>
                  {discountAmount > 0 && (
                    <Typography variant='caption' color='success.main' display='block'>
                      Tiết kiệm: {formatPrice(discountAmount)}
                    </Typography>
                  )}
                </Box>
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
                disabled={selectedIds.size === 0}
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

          {/* Right Column - Shopping Cart list with selection */}
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
              <Box display='flex' alignItems='center' justifyContent='space-between' sx={{ mb: 1 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedIds.size > 0 && selectedIds.size === items?.length}
                      indeterminate={selectedIds.size > 0 && selectedIds.size < items?.length}
                      onChange={e => toggleSelectAll(e.target.checked)}
                    />
                  }
                  label={`Chọn tất cả (${items?.length || 0})`}
                />
                <Typography variant='body2' color='text.secondary'>
                  Đã chọn {selectedIds.size} / {items?.length || 0}
                </Typography>
              </Box>
              {items && items?.length > 0
                ? items.map(item => (
                    <>
                      <Card variant='outlined' sx={{ mb: 3 }}>
                        <Box sx={{ p: 3 }}>
                          <Grid container spacing={3} alignItems='center'>
                            {/* Select checkbox */}
                            <Grid
                              item
                              xs={12}
                              sm={1}
                              sx={{ display: 'flex', justifyContent: { xs: 'flex-start', sm: 'center' } }}
                            >
                              <Checkbox
                                checked={selectedIds.has(item.id)}
                                onChange={e => toggleSelectOne(item.id, e.target.checked)}
                              />
                            </Grid>
                            {/* Product Image */}
                            <Grid item xs={12} sm={2}>
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
                                {(item as any)?.variant?.color?.name || 'Màu không xác định'}
                                {((item as any)?.variant?.strapMaterial?.name &&
                                  ` / Dây: ${(item as any)?.variant?.strapMaterial?.name}`) ||
                                  ''}
                              </Typography>
                              <Typography variant='body2' color='text.secondary' gutterBottom>
                                Mã SP: {(item as any)?.variant?.product?.id || (item as any)?.variant?.watch?.id}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                                {!!(item as any)?.variant?.watch?.code && (
                                  <Typography variant='caption' color='text.secondary'>
                                    Mã: <b>{(item as any).variant.watch.code}</b>
                                  </Typography>
                                )}
                                {!!(item as any)?.variant?.watch?.model && (
                                  <Typography variant='caption' color='text.secondary'>
                                    Model: <b>{(item as any).variant.watch.model}</b>
                                  </Typography>
                                )}
                              </Box>
                              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                                {!!(item as any)?.variant?.watch?.case_material && (
                                  <Typography variant='caption' color='text.secondary'>
                                    Vỏ: <b>{(item as any).variant.watch.case_material}</b>
                                  </Typography>
                                )}
                                {!!(item as any)?.variant?.watch?.case_size && (
                                  <Typography variant='caption' color='text.secondary'>
                                    Size vỏ: <b>{(item as any).variant.watch.case_size}mm</b>
                                  </Typography>
                                )}
                                {!!(item as any)?.variant?.watch?.strap_size && (
                                  <Typography variant='caption' color='text.secondary'>
                                    Dây: <b>{(item as any).variant.watch.strap_size}mm</b>
                                  </Typography>
                                )}
                              </Box>
                              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                                {!!(item as any)?.variant?.watch?.water_resistance && (
                                  <Typography variant='caption' color='text.secondary'>
                                    Chống nước: <b>{(item as any).variant.watch.water_resistance}</b>
                                  </Typography>
                                )}
                                {['0', '1', '2'].includes(String((item as any)?.variant?.watch?.gender)) && (
                                  <Typography variant='caption' color='text.secondary'>
                                    Giới tính:{' '}
                                    <b>
                                      {(item as any).variant.watch.gender === '1'
                                        ? 'Nam'
                                        : (item as any).variant.watch.gender === '2'
                                          ? 'Nữ'
                                          : 'Unisex'}
                                    </b>
                                  </Typography>
                                )}
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                                {(() => {
                                  const current =
                                    (item as any)?.variant?.product?.price || (item as any)?.variant?.price || 0
                                  const base = (item as any)?.variant?.watch?.base_price || 0

                                  return (
                                    <>
                                      <Typography variant='h6' color='error' fontWeight='bold'>
                                        {current.toLocaleString('vi-VN')} VNĐ
                                      </Typography>
                                      {base && base !== current && (
                                        <Typography
                                          variant='caption'
                                          sx={{ textDecoration: 'line-through' }}
                                          color='error.main'
                                        >
                                          {base.toLocaleString('vi-VN')} VNĐ
                                        </Typography>
                                      )}
                                    </>
                                  )
                                })()}
                              </Box>
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

            {items && items?.length > 0 && (
              <Box display='flex' justifyContent='flex-end' alignItems='center' mt={1.5}>
                <Button variant='outlined' color='error' onClick={handleClearCart} sx={{ textTransform: 'none' }}>
                  Xóa tất cả
                </Button>
              </Box>
            )}
          </Grid>
        </Grid>
      </Container>

      {/* Discount selection dialog */}
      <Dialog open={discountDialogOpen} onClose={() => setDiscountDialogOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle>Mã giảm giá khả dụng</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {discounts
              .filter(d => isDiscountInDate(d))
              .map(d => {
                const eligible = isDiscountEligibleForSubtotal(d, selectedSubtotal)
                const amount = computeDiscountAmount(selectedSubtotal, d)

                return (
                  <Paper key={d.id} variant='outlined' sx={{ p: 1.5, opacity: eligible ? 1 : 0.6 }}>
                    <Box display='flex' justifyContent='space-between' alignItems='center'>
                      <Box>
                        <Typography fontWeight={700}>{d.code}</Typography>
                        <Typography variant='caption' color='text.secondary' display='block'>
                          {d.name}
                        </Typography>
                        <Typography variant='caption' color='text.secondary' display='block'>
                          ĐH tối thiểu: {formatPrice(Number(d.min_order_value || 0))}
                        </Typography>
                        <Typography variant='caption' color='text.secondary' display='block'>
                          Hiệu lực: {dayjs(d.effective_date, ['YYYYMMDDHHmmss']).format('DD/MM/YYYY')} -{' '}
                          {dayjs(d.valid_until, ['YYYYMMDDHHmmss']).format('DD/MM/YYYY')}
                        </Typography>
                      </Box>
                      <Box textAlign='right'>
                        <Typography variant='body2' color={eligible ? 'success.main' : 'text.secondary'}>
                          {eligible ? `Giảm: ${formatPrice(amount)}` : 'Chưa đủ điều kiện'}
                        </Typography>
                        <Button
                          size='small'
                          variant='contained'
                          sx={{ mt: 1, textTransform: 'none' }}
                          disabled={!eligible}
                          onClick={() => {
                            setPromoCode(d.code)
                            setAppliedDiscount(d)
                            setIsPromoApplied(true)
                            setDiscountAmount(amount)
                            setDiscountDialogOpen(false)
                            try {
                              localStorage.setItem('selectedDiscountCode', d.code)
                            } catch {}
                            toast.success('Đã áp dụng mã giảm giá')
                          }}
                        >
                          Áp dụng
                        </Button>
                      </Box>
                    </Box>
                  </Paper>
                )
              })}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDiscountDialogOpen(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default CartPage
