import { yupResolver } from '@hookform/resolvers/yup'
import {
  Box,
  Button,
  Card,
  Container,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Select,
  TextField,
  Typography,
  Alert,
  Chip,
  FormControl,
  InputLabel,
  Paper,
  ClickAwayListener,
  Portal
} from '@mui/material'
import { NextPage } from 'next'
import { ArrowBack, ShoppingCartOutlined } from '@mui/icons-material'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import Spinner from 'src/components/spinner'
import { ROUTE_CONFIG } from 'src/configs/route'
import { useAuth } from 'src/hooks/useAuth'
import { deleteCartItems } from 'src/services/cart'
import { createOrder } from 'src/services/checkout'
import { getDiscountByCode, getDiscounts } from 'src/services/discount'
import { createUserInteraction } from 'src/services/userInteraction'
import { getAddressesByUserId, createAddressV1, listAddressesV1 } from 'src/services/address'
import { RootState } from 'src/stores'
import { TDiscount } from 'src/types/discount'
import { TCreateOrder, TCreateOrderForm } from 'src/types/order'
import { TAddress } from 'src/types/address'
import * as yup from 'yup'

type TProps = {}

interface BuyNowItem {
  product_id: string
  color_id: string
  size_id: string
  quantity: number
  product_name: string
  product_price: number
  product_thumbnail: string
  color_name: string
  size_name: string
  product_variant_id: string
}

const CheckoutPage: NextPage<TProps> = () => {
  const { user } = useAuth()
  const { items } = useSelector((state: RootState) => state.cart)
  const { t } = useTranslation()
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [buyNowItems, setBuyNowItems] = useState<BuyNowItem[]>([])
  const [isBuyNowMode, setIsBuyNowMode] = useState(false)

  // Address states
  const [addresses, setAddresses] = useState<TAddress[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string>('')
  const [loadingAddresses, setLoadingAddresses] = useState(false)

  // Discount states
  const [discountCode, setDiscountCode] = useState('')
  const [appliedDiscount, setAppliedDiscount] = useState<{
    code: string
    discountAmount: number
    discountType: 'percentage' | 'fixed'
  } | null>(null)
  const [discountLoading, setDiscountLoading] = useState(false)
  const [discountError, setDiscountError] = useState('')

  // Voucher dropdown states
  const [availableVouchers, setAvailableVouchers] = useState<TDiscount[]>([])
  const [showVoucherDropdown, setShowVoucherDropdown] = useState(false)
  const [loadingVouchers, setLoadingVouchers] = useState(false)
  const [inputElement, setInputElement] = useState<HTMLElement | null>(null)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })

  // Address dialog states
  const [addressDialogOpen, setAddressDialogOpen] = useState(false)
  const [addrRecipient, setAddrRecipient] = useState('')
  const [addrPhone, setAddrPhone] = useState('')
  const [addrStreet, setAddrStreet] = useState('')
  const [addrWard, setAddrWard] = useState('')
  const [addrDistrict, setAddrDistrict] = useState('')
  const [addrCity, setAddrCity] = useState('')

  const schema = yup.object({
    paymentMethod: yup.string().required(t('payment-method-required')),
    shipping_address: yup.string().notRequired(),
    name: yup.string().required(t('full-name-required')),
    phone: yup
      .string()
      .required(t('phone-number-required'))
      .matches(/^0\d{9}$/, 'Số điện thoại phải bắt đầu bằng 0 và đủ 10 số')
  })

  const defaultValues: TCreateOrderForm = {
    paymentMethod: 'VNPAY',
    shipping_address: '',
    name: user?.fullName || '',
    phone: ''
  }

  const { handleSubmit, control, setValue } = useForm({
    defaultValues,
    mode: 'onBlur',
    resolver: yupResolver(schema)
  })

  useEffect(() => {
    const buyNowData = localStorage.getItem('buyNowItems')
    if (buyNowData) {
      try {
        const parsedData = JSON.parse(buyNowData) as BuyNowItem[]
        if (parsedData && parsedData.length > 0) {
          setBuyNowItems(parsedData)
          setIsBuyNowMode(true)
          localStorage.removeItem('buyNowItems')
        }
      } catch (error) {
        console.error('Error parsing buyNowItems:', error)
      }
    }
  }, [])

  // Load addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      if (user?.id) {
        setLoadingAddresses(true)
        try {
          // Try v1 list first
          const v1 = await listAddressesV1()
          const rows = v1?.addresses?.rows
          if (Array.isArray(rows)) {
            setAddresses(rows)

            // Auto select default address
            const defaultAddress = rows.find((addr: TAddress) => addr.is_default)
            if (defaultAddress) {
              setSelectedAddressId(defaultAddress.id)
              setValue('name', defaultAddress.recipient_name)
              setValue('phone', defaultAddress.phone_number)
              setValue(
                'shipping_address',
                `${defaultAddress.street}, ${defaultAddress.ward}, ${defaultAddress.district}, ${defaultAddress.city}`
              )
            }
          } else {
            const response = await getAddressesByUserId()
            if (response?.status === 'success' && response?.data) {
              setAddresses(response.data)

              const defaultAddress = response.data.find((addr: TAddress) => addr.is_default)
              if (defaultAddress) {
                setSelectedAddressId(defaultAddress.id)
                setValue('name', defaultAddress.recipient_name)
                setValue('phone', defaultAddress.phone_number)
                setValue(
                  'shipping_address',
                  `${defaultAddress.street}, ${defaultAddress.ward}, ${defaultAddress.district}, ${defaultAddress.city}`
                )
              }
            }
          }
        } catch (error) {
          console.error('Error fetching addresses:', error)
        } finally {
          setLoadingAddresses(false)
        }
      }
    }

    fetchAddresses()
  }, [user?.id, setValue])

  useEffect(() => {
    const fetchVouchers = async () => {
      setLoadingVouchers(true)
      try {
        const response = await getDiscounts()
        if (response?.status == 'success' && response?.data) {
          const validVouchers = response.data.filter((voucher: TDiscount) => {
            const now = new Date()
            const validUntil = new Date(voucher.valid_until)

            return now <= validUntil
          })
          setAvailableVouchers(validVouchers)
        }
      } catch (error) {
        console.error('Error fetching vouchers:', error)
      } finally {
        setLoadingVouchers(false)
      }
    }

    fetchVouchers()
  }, [])

  useEffect(() => {
    const updatePosition = () => {
      if (inputElement && showVoucherDropdown) {
        const rect = inputElement.getBoundingClientRect()
        setDropdownPosition({
          top: rect.bottom + window.scrollY + 4,
          left: rect.left + window.scrollX,
          width: rect.width
        })
      }
    }

    if (showVoucherDropdown) {
      window.addEventListener('scroll', updatePosition, true)
      window.addEventListener('resize', updatePosition)
    }

    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [inputElement, showVoucherDropdown])

  // Handle address selection
  const handleAddressSelect = (addressId: string) => {
    if (String(addressId) === 'NEW') {
      // Open dialog for new address
      setAddrRecipient(user?.fullName || '')
      setAddrPhone('')
      setAddrStreet('')
      setAddrWard('')
      setAddrDistrict('')
      setAddrCity('')
      setAddressDialogOpen(true)
      return
    } else if (addressId) {
      const selectedAddress = addresses.find(addr => addr.id === addressId)
      if (selectedAddress) {
        // Update form values
        setValue('name', selectedAddress.recipient_name)
        setValue('phone', selectedAddress.phone_number)
        setValue(
          'shipping_address',
          `${selectedAddress.street}, ${selectedAddress.ward}, ${selectedAddress.district}, ${selectedAddress.city}`
        )
      }
    } else {
      // reset
      setValue('name', user?.fullName || '')
      setValue('phone', '')
      setValue('shipping_address', '')
    }
    setSelectedAddressId(addressId)
  }

  // Tính toán order total dựa trên mode
  const getOrderTotal = () => {
    if (isBuyNowMode) {
      return buyNowItems?.reduce((total, item) => total + (item?.product_price || 0) * (item?.quantity || 0), 0) || 0
    }

    return (
      items?.reduce((total, item) => {
        const price = item?.variant?.product?.price ?? item?.variant?.price ?? 0
        const qty = item?.quantity ?? 0

        return total + price * qty
      }, 0) || 0
    )
  }

  const orderTotal = getOrderTotal()
  // Align shipping fee with Cart page (currently 0)
  const shippingFee = 0

  // Cart meta for UX buttons
  const cartItemCount = isBuyNowMode
    ? buyNowItems.reduce((acc, it) => acc + (it?.quantity || 0), 0)
    : items.reduce((acc, it) => acc + (it?.quantity || 0), 0)

  // Tính toán discount
  const getDiscountAmount = () => {
    if (!appliedDiscount) {
      return 0
    }

    if (appliedDiscount.discountType === 'percentage') {
      return (orderTotal * appliedDiscount.discountAmount) / 100
    } else {
      return appliedDiscount.discountAmount
    }
  }

  const discountAmount = getDiscountAmount()
  const finalTotal = orderTotal + shippingFee - discountAmount

  const handleCreateOrder = async (data: TCreateOrder) => {
    try {
      setLoading(true)
      const response = await createOrder(data)
      setOrderSuccess(true)

      // Support both shapes: { status, data } and { order: { vnpayUrl } }
      const vnpUrl = response?.data?.vnpayUrl || response?.order?.vnpayUrl
      if (response) {
        await handleCreateUserInteraction(data)

        setLoading(false)
        if (vnpUrl) {
          window.location.href = vnpUrl
        } else {
          router.push(ROUTE_CONFIG.ORDER_SUCCESS)
        }
      }
    } catch (error) {
      setLoading(false)
      console.log('error', error)
    }
  }

  const getProductIdFromVariant = (variantId: string) => {
    const cartItem = items.find(item => item.variant.id === variantId)

    return cartItem ? cartItem.variant.product.id : null
  }

  const handleCreateUserInteraction = async (data: TCreateOrder) => {
    try {
      if (isBuyNowMode) {
        // Trường hợp mua trực tiếp - lấy product_id từ buyNowItems
        for (const item of buyNowItems) {
          const response = await createUserInteraction({
            product_id: item.product_id,
            interaction_type: 5
          })

          if (response.status === 'success') {
            console.log('User interaction created successfully for product:', item.product_id)
          }
        }
      } else {
        // Trường hợp mua từ giỏ hàng - lấy product_id từ variant
        for (const orderDetail of data.orderDetails) {
          const productId = getProductIdFromVariant(orderDetail.product_variant_id)

          if (productId) {
            const response = await createUserInteraction({
              product_id: productId,
              interaction_type: 5
            })

            if (response.status === 'success') {
              console.log('User interaction created successfully for product:', productId)
            }
          }
        }
      }
    } catch (error) {
      console.error('Error creating user interaction:', error)
    }
  }

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      setDiscountError('Vui lòng nhập mã giảm giá')

      return
    }

    setDiscountLoading(true)
    setDiscountError('')

    try {
      const response = await getDiscountByCode(discountCode.trim())

      if (response?.status === 'success' && response?.data) {
        const discount: TDiscount = response.data

        const now = new Date()
        const validFrom = new Date(discount.valid_from)
        const validUntil = new Date(discount.valid_until)

        if (now < validFrom || now > validUntil) {
          setDiscountError('Mã giảm giá đã hết hạn hoặc chưa thể sử dụng')

          return
        }

        if (discount.minimum_order_value > orderTotal) {
          setDiscountError(`Đơn hàng phải có giá trị tối thiểu ${discount.minimum_order_value.toLocaleString()}VNĐ`)

          return
        }

        let discountAmount = 0
        if (discount.discount_type === 'PERCENTAGE') {
          discountAmount = (orderTotal * parseFloat(discount.discount_value)) / 100

          if (discount.max_discount_amount && discountAmount > discount.max_discount_amount) {
            discountAmount = discount.max_discount_amount
          }
        } else {
          discountAmount = parseFloat(discount.discount_value)
        }

        setAppliedDiscount({
          code: discount.code,
          discountAmount: discountAmount,
          discountType: discount.discount_type === 'PERCENTAGE' ? 'percentage' : 'fixed'
        })

        setDiscountCode('')
      } else {
        setDiscountError('Mã giảm giá không hợp lệ')
      }
    } catch (error) {
      console.error('Error applying discount:', error)
      setDiscountError('Có lỗi xảy ra khi áp dụng mã giảm giá')
    } finally {
      setDiscountLoading(false)
    }
  }

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null)
    setDiscountError('')
  }

  const handleVoucherSelect = (voucher: TDiscount) => {
    setDiscountCode(voucher.code)
    setShowVoucherDropdown(false)
    setDiscountError('')
  }

  const handleDiscountInputFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    const inputEl = event.currentTarget
    const rect = inputEl.getBoundingClientRect()

    setInputElement(inputEl)
    setDropdownPosition({
      top: rect.bottom + window.scrollY + 4,
      left: rect.left + window.scrollX,
      width: rect.width
    })
    setShowVoucherDropdown(true)
  }

  const handleDiscountInputBlur = () => {
    setTimeout(() => setShowVoucherDropdown(false), 200)
  }

  const handleClickAway = () => {
    setShowVoucherDropdown(false)
  }

  const onSubmit = (data: TCreateOrderForm) => {
    const isSelectingSaved = Boolean(selectedAddressId)
    const addressParts = (data.shipping_address || '').split(',').map(s => s.trim())
    const [street = '', ward = '', district = '', city = ''] = addressParts

    // Map FE form to BE payload
    const variants = isBuyNowMode
      ? buyNowItems.map(item => ({ variant_id: parseInt(item.product_variant_id, 10), quantity: item.quantity }))
      : items.map(item => ({ variant_id: parseInt(item.variant.id, 10), quantity: item.quantity }))

    const payload = {
      shipping_address: data.shipping_address,
      shipping_fee: shippingFee,
      discount_code: appliedDiscount?.code || null,
      note: undefined,
      guess_name: data.name,
      guess_email: user?.email || '',
      guess_phone: data.phone,
      // Map: COD='0', VNPAY='1', MOMO='2' (tạm thời, nếu backend khác vui lòng báo)
      payment_method: data.paymentMethod === 'VNPAY' ? '1' : data.paymentMethod === 'MOMO' ? '2' : '0',
      discount_amount: discountAmount,
      variants
    }

    const proceedCreate = async () => handleCreateOrder(payload as any)

    if (!isSelectingSaved && street && city) {
      // Ask to save address
      const confirmSave = window.confirm('Bạn có muốn lưu địa chỉ này cho lần sau không?')
      if (confirmSave) {
        createAddressV1({
          city,
          district,
          is_default: '0',
          street,
          ward,
          phone_number: data.phone,
          recipient_name: data.name
        }).finally(() => {
          proceedCreate()
        })
        return
      }
    }

    proceedCreate()
  }

  useEffect(() => {
    if (orderSuccess) {
      if (!isBuyNowMode) {
        deleteCartItems()
      }
    }
  }, [orderSuccess, isBuyNowMode])

  if (!isBuyNowMode && items.length === 0) {
    return (
      <Container maxWidth='lg' sx={{ p: 2, mb: 10 }}>
        {/* Top actions: Back to Cart + View Cart summary */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Button
            startIcon={<ArrowBack />}
            color='primary'
            onClick={() => router.push(ROUTE_CONFIG.CART)}
            sx={{ textTransform: 'none' }}
          >
            Trở lại giỏ hàng
          </Button>

          <Button
            variant='outlined'
            startIcon={<ShoppingCartOutlined />}
            onClick={() => router.push(ROUTE_CONFIG.CART)}
            sx={{ textTransform: 'none' }}
          >
            Xem giỏ hàng ({cartItemCount}) · {orderTotal.toLocaleString('vi-VN')} VNĐ
          </Button>
        </Box>
        <Alert severity='warning' sx={{ mb: 2 }}>
          Không có sản phẩm nào trong giỏ hàng. Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán.
        </Alert>
        <Button variant='contained' onClick={() => router.push('/')}>
          Quay về trang chủ
        </Button>
      </Container>
    )
  }

  if (isBuyNowMode && buyNowItems.length === 0) {
    return (
      <Container maxWidth='lg' sx={{ p: 2, mb: 10 }}>
        <Alert severity='warning' sx={{ mb: 2 }}>
          Không tìm thấy thông tin sản phẩm mua ngay. Vui lòng thử lại.
        </Alert>
        <Button variant='contained' onClick={() => router.push('/')}>
          Quay về trang chủ
        </Button>
      </Container>
    )
  }

  return (
    <>
      {loading && <Spinner />}
      <Container maxWidth='lg' sx={{ p: 2, mb: 10 }}>
        {isBuyNowMode && (
          <Alert severity='info' sx={{ mb: 3 }}>
            Bạn đang thanh toán sản phẩm mua ngay
          </Alert>
        )}

        <Box sx={{ pt: 4, px: 1, mb: 2 }}>
          <Typography
            component='div'
            sx={{
              fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', sans-serif !important`,
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              fontSize: { xs: 28, sm: 36, md: 44 }
            }}
          >
            Thông tin đơn hàng
          </Typography>
        </Box>

        <Card sx={{ p: 3, bgcolor: 'transparent', boxShadow: 'none' }} elevation={0}>
          <Grid container spacing={3}>
            {/* Left: Delivery Info */}
            <Grid item xs={12} lg={8}>
              <Card sx={{ p: 2, bgcolor: 'background.paper', boxShadow: 'none' }} elevation={0}>
                <Typography variant='h4' sx={{ mb: 2 }}>
                  {t('delivery-info')}
                </Typography>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <FormControl fullWidth>
                      <InputLabel>Chọn thông tin người nhận</InputLabel>
                      <Select
                        value={selectedAddressId}
                        label='Chọn thông tin người nhận'
                        onChange={e => handleAddressSelect(e.target.value)}
                        disabled={loadingAddresses}
                      >
                        <MenuItem value='' disabled>
                          <em>Chọn thông tin đã lưu...</em>
                        </MenuItem>
                        <MenuItem value='NEW'>
                          <em>Tạo thông tin mới</em>
                        </MenuItem>
                        {addresses.map(address => (
                          <MenuItem key={address.id} value={address.id}>
                            <Box>
                              <Typography variant='subtitle2'>
                                {address.recipient_name} - {address.phone_number}
                              </Typography>
                              <Typography variant='body2' color='text.secondary'>
                                {`${address.street}, ${address.ward}, ${address.district}, ${address.city}`}
                                {address.is_default && <Chip size='small' label='Mặc định' sx={{ ml: 1 }} />}
                              </Typography>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    {/* Summary removed to avoid duplication */}

                    <Controller
                      name='name'
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <TextField {...field} label='Họ và tên' fullWidth error={!!error} helperText={error?.message} />
                      )}
                    />

                    <Controller
                      name='phone'
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <TextField
                          {...field}
                          label='Số điện thoại'
                          type='tel'
                          fullWidth
                          error={!!error}
                          helperText={error?.message}
                        />
                      )}
                    />

                    {/* Removed manual address input; handled via address dialog */}

                    <Controller
                      name='paymentMethod'
                      control={control}
                      render={({ field }) => (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            variant={field.value === 'COD' ? 'contained' : 'outlined'}
                            onClick={() => field.onChange('COD')}
                          >
                            COD
                          </Button>
                          <Button
                            variant={field.value === 'VNPAY' ? 'contained' : 'outlined'}
                            onClick={() => field.onChange('VNPAY')}
                          >
                            VNPay
                          </Button>
                          <Button
                            variant={field.value === 'MOMO' ? 'contained' : 'outlined'}
                            onClick={() => field.onChange('MOMO')}
                          >
                            MoMo
                          </Button>
                        </Box>
                      )}
                    />

                    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Button
                        variant='text'
                        color='primary'
                        onClick={() => router.push(ROUTE_CONFIG.CART)}
                        sx={{ textTransform: 'none' }}
                        startIcon={<ArrowBack />}
                      >
                        {isBuyNowMode ? 'Quay lại sản phẩm' : 'Trở lại giỏ hàng'}
                      </Button>
                      <Button type='submit' variant='contained' color='primary'>
                        Đặt hàng
                      </Button>
                    </Box>
                  </Box>
                </form>
              </Card>
            </Grid>

            {/* Right: Order Summary */}
            <Grid item xs={12} lg={4}>
              <Card sx={{ p: 3, bgcolor: 'background.paper', boxShadow: 'none' }} elevation={0}>
                {isBuyNowMode ? (
                  buyNowItems.map((item, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Box sx={{ position: 'relative' }}>
                        <img
                          src={item.product_thumbnail}
                          alt={item.product_name}
                          style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8 }}
                        />
                        <Box
                          sx={{
                            position: 'absolute',
                            top: -8,
                            right: -8,
                            bgcolor: 'grey.500',
                            color: 'white',
                            borderRadius: '50%',
                            width: 20,
                            height: 20,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 12
                          }}
                        >
                          {item.quantity}
                        </Box>
                      </Box>
                      <Box sx={{ ml: 2, flex: 1 }}>
                        <Typography variant='subtitle2'>{item.product_name}</Typography>
                        <Typography variant='body2' color='text.secondary'>
                          {item.color_name} / {item.size_name}
                        </Typography>
                      </Box>
                      <Typography variant='subtitle1'>
                        {(item.product_price * item.quantity).toLocaleString()}VNĐ
                      </Typography>
                    </Box>
                  ))
                ) : items && items.length > 0 ? (
                  items.map(item => {
                    const product = item?.variant?.product
                    const colorName = item?.variant?.color?.name || '-'
                    const sizeName = item?.variant?.size?.name || '-'
                    const quantity = item?.quantity || 0
                    const thumbnail = product?.thumbnail || '/luxury-watch-hero.jpg'
                    const name = product?.name || 'Sản phẩm'
                    const price = product?.price ?? (item as any)?.variant?.price ?? 0

                    if (!product) {
                      // Skip rendering items missing product to avoid runtime errors
                      return null
                    }

                    return (
                      <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Box sx={{ position: 'relative' }}>
                          <img
                            src={thumbnail}
                            alt={name}
                            style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8 }}
                          />
                          <Box
                            sx={{
                              position: 'absolute',
                              top: -8,
                              right: -8,
                              bgcolor: 'grey.500',
                              color: 'white',
                              borderRadius: '50%',
                              width: 20,
                              height: 20,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 12
                            }}
                          >
                            {quantity}
                          </Box>
                        </Box>
                        <Box sx={{ ml: 2, flex: 1 }}>
                          <Typography variant='subtitle2'>{name}</Typography>
                          <Typography variant='body2' color='text.secondary'>
                            {colorName} / {sizeName}
                          </Typography>
                        </Box>
                        <Typography variant='subtitle1'>{(price * quantity).toLocaleString()}VNĐ</Typography>
                      </Box>
                    )
                  })
                ) : (
                  <Typography variant='body2'>Không có sản phẩm trong giỏ hàng</Typography>
                )}

                {/* Order Details Section */}
                <Divider sx={{ my: 2 }} />
                <Typography variant='subtitle1' sx={{ mb: 1 }}>
                  Chi tiết đơn hàng
                </Typography>

                <Box
                  sx={{
                    display: 'flex',
                    px: 1,
                    py: 1,
                    color: 'text.secondary',
                    bgcolor: 'background.default',
                    borderRadius: 1,
                    fontSize: 13,
                    fontWeight: 600
                  }}
                >
                  <Box sx={{ flex: 1 }}>Sản phẩm</Box>
                  <Box sx={{ width: { xs: 96, sm: 110 }, textAlign: 'right' }}>Đơn giá</Box>
                  <Box sx={{ width: 70, textAlign: 'center' }}>Số lượng</Box>
                  <Box sx={{ width: { xs: 110, sm: 130 }, textAlign: 'right' }}>Tạm tính</Box>
                </Box>
                <Divider />

                {isBuyNowMode
                  ? buyNowItems.map((item, index) => {
                      const unitPrice = item.product_price || 0
                      const quantity = item.quantity || 0
                      const lineTotal = unitPrice * quantity
                      return (
                        <Box
                          key={`detail-buynow-${index}`}
                          sx={{ display: 'flex', px: 1, py: 1.25, alignItems: 'center' }}
                        >
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant='body2' noWrap title={item.product_name} fontWeight={600}>
                              {item.product_name}
                            </Typography>
                            <Typography variant='caption' color='text.secondary' sx={{ display: 'block' }}>
                              Màu: {item.color_name || '-'} · Kích thước: {item.size_name || '-'} · Mã biến thể:{' '}
                              {item.product_variant_id}
                            </Typography>
                          </Box>
                          <Box sx={{ width: 110, textAlign: 'right' }}>
                            <Typography variant='body2'>{unitPrice.toLocaleString('vi-VN')} VNĐ</Typography>
                          </Box>
                          <Box sx={{ width: 70, textAlign: 'center' }}>
                            <Typography variant='body2'>× {quantity}</Typography>
                          </Box>
                          <Box sx={{ width: 130, textAlign: 'right' }}>
                            <Typography variant='body2' fontWeight={700}>
                              {lineTotal.toLocaleString('vi-VN')} VNĐ
                            </Typography>
                          </Box>
                        </Box>
                      )
                    })
                  : items.map(item => {
                      const product = item?.variant?.product
                      const name = product?.name || 'Sản phẩm'
                      const unitPrice = (product?.price ?? (item as any)?.variant?.price ?? 0) as number
                      const quantity = item?.quantity || 0
                      const lineTotal = unitPrice * quantity
                      const colorName = (item as any)?.variant?.color?.name || '-'
                      const sizeName = (item as any)?.variant?.size?.name || '-'
                      const productId = product?.id || (item as any)?.variant?.product?.id || '-'
                      return (
                        <Box
                          key={`detail-cart-${item.id}`}
                          sx={{ display: 'flex', px: 1, py: 1.25, alignItems: 'center' }}
                        >
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant='body2' noWrap title={name} fontWeight={600}>
                              {name}
                            </Typography>
                            <Typography variant='caption' color='text.secondary' sx={{ display: 'block' }}>
                              Màu: {colorName} · Kích thước: {sizeName} · Mã SP: {productId}
                            </Typography>
                          </Box>
                          <Box sx={{ width: 110, textAlign: 'right' }}>
                            <Typography variant='body2'>{unitPrice.toLocaleString('vi-VN')} VNĐ</Typography>
                          </Box>
                          <Box sx={{ width: 70, textAlign: 'center' }}>
                            <Typography variant='body2'>× {quantity}</Typography>
                          </Box>
                          <Box sx={{ width: 130, textAlign: 'right' }}>
                            <Typography variant='body2' fontWeight={700}>
                              {lineTotal.toLocaleString('vi-VN')} VNĐ
                            </Typography>
                          </Box>
                        </Box>
                      )
                    })}

                {/* Discount Code Section */}
                <Box sx={{ mb: 3 }}>
                  {appliedDiscount ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Chip
                        label={`Mã giảm giá: ${appliedDiscount.code}`}
                        color='success'
                        onDelete={handleRemoveDiscount}
                      />
                    </Box>
                  ) : (
                    <ClickAwayListener onClickAway={handleClickAway}>
                      <Box sx={{ position: 'relative' }}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <TextField
                            label='Mã giảm giá'
                            value={discountCode}
                            onChange={e => setDiscountCode(e.target.value)}
                            onFocus={handleDiscountInputFocus}
                            onBlur={handleDiscountInputBlur}
                            error={!!discountError}
                            helperText={discountError}
                            fullWidth
                            size='small'
                            disabled={discountLoading}
                            placeholder='Nhập mã hoặc chọn từ danh sách'
                          />
                          <Button
                            variant='contained'
                            onClick={handleApplyDiscount}
                            disabled={discountLoading || !discountCode.trim()}
                            sx={{ minWidth: 'auto', px: 2 }}
                          >
                            {discountLoading ? 'Đang áp dụng...' : 'Áp dụng'}
                          </Button>
                        </Box>

                        {/* Voucher Dropdown */}
                        <Portal>
                          {showVoucherDropdown && availableVouchers.length > 0 && (
                            <Paper
                              sx={{
                                position: 'fixed',
                                top: dropdownPosition.top,
                                left: dropdownPosition.left,
                                width: Math.max(dropdownPosition.width, 400),
                                zIndex: 1300,
                                maxHeight: 300,
                                overflow: 'auto',
                                border: '1px solid',
                                borderColor: 'divider',
                                boxShadow: 3
                              }}
                            >
                              {loadingVouchers ? (
                                <Box sx={{ p: 2, textAlign: 'center' }}>
                                  <Typography variant='body2'>Đang tải voucher...</Typography>
                                </Box>
                              ) : (
                                <>
                                  <Box sx={{ p: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                                    <Typography variant='subtitle2' color='primary'>
                                      Danh sách Voucher
                                    </Typography>
                                  </Box>
                                  {availableVouchers.map(voucher => (
                                    <Box
                                      key={voucher.id}
                                      onClick={() => handleVoucherSelect(voucher)}
                                      sx={{
                                        p: 2,
                                        cursor: 'pointer',
                                        borderBottom: '1px solid',
                                        borderColor: 'divider',
                                        '&:hover': {
                                          bgcolor: 'grey.100'
                                        },
                                        '&:last-child': {
                                          borderBottom: 'none'
                                        }
                                      }}
                                    >
                                      <Typography variant='subtitle2' color='primary'>
                                        {voucher.code}
                                      </Typography>
                                      <Typography variant='body2' color='text.secondary'>
                                        {voucher.name || 'Mã giảm giá'}
                                      </Typography>
                                      <Typography variant='caption' color='text.secondary'>
                                        {voucher.discount_type === 'PERCENTAGE'
                                          ? `Giảm ${voucher.discount_value}%`
                                          : `Giảm ${parseInt(voucher.discount_value).toLocaleString()}VNĐ`}
                                        {voucher.minimum_order_value > 0 &&
                                          ` - Đơn tối thiểu ${voucher.minimum_order_value.toLocaleString()}VNĐ`}
                                      </Typography>
                                    </Box>
                                  ))}
                                </>
                              )}
                            </Paper>
                          )}
                        </Portal>
                      </Box>
                    </ClickAwayListener>
                  )}
                </Box>

                {/* Price Summary */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Tạm tính</Typography>
                    <Typography>{orderTotal.toLocaleString()}VNĐ</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Phí vận chuyển</Typography>
                    <Typography>{shippingFee.toLocaleString()}VNĐ</Typography>
                  </Box>
                  {appliedDiscount && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography color='success.main'>Giảm giá</Typography>
                      <Typography color='success.main'>-{discountAmount.toLocaleString()}VNĐ</Typography>
                    </Box>
                  )}
                </Box>

                <Divider sx={{ mb: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant='h6'>Tổng cộng</Typography>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant='caption' color='text.secondary'>
                      VND{' '}
                    </Typography>
                    <Typography variant='h6'>{finalTotal.toLocaleString()}VNĐ</Typography>
                  </Box>
                </Box>
              </Card>
            </Grid>
          </Grid>
        </Card>
        {/* New Address Dialog */}
        <Dialog open={addressDialogOpen} onClose={() => setAddressDialogOpen(false)} fullWidth maxWidth='sm'>
          <DialogTitle>Tạo thông tin người nhận</DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label='Họ và tên người nhận'
                value={addrRecipient}
                onChange={e => setAddrRecipient(e.target.value)}
                fullWidth
              />
              <TextField
                label='Số điện thoại'
                value={addrPhone}
                onChange={e => setAddrPhone(e.target.value)}
                fullWidth
                placeholder='0xxxxxxxxx'
                error={!!addrPhone && !/^0\d{9}$/.test(addrPhone)}
                helperText={
                  !!addrPhone && !/^0\d{9}$/.test(addrPhone) ? 'Số điện thoại phải bắt đầu bằng 0 và đủ 10 số' : ''
                }
              />
              <TextField
                label='Số nhà, đường'
                value={addrStreet}
                onChange={e => setAddrStreet(e.target.value)}
                fullWidth
              />
              <TextField label='Phường/Xã' value={addrWard} onChange={e => setAddrWard(e.target.value)} fullWidth />
              <TextField
                label='Quận/Huyện'
                value={addrDistrict}
                onChange={e => setAddrDistrict(e.target.value)}
                fullWidth
              />
              <TextField
                label='Tỉnh/Thành phố'
                value={addrCity}
                onChange={e => setAddrCity(e.target.value)}
                fullWidth
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddressDialogOpen(false)}>Hủy</Button>
            <Button
              variant='contained'
              onClick={async () => {
                if (!addrRecipient || !/^0\d{9}$/.test(addrPhone) || !addrStreet || !addrCity) return
                try {
                  const res = await createAddressV1({
                    city: addrCity,
                    district: addrDistrict,
                    is_default: '0',
                    street: addrStreet,
                    ward: addrWard,
                    phone_number: addrPhone,
                    recipient_name: addrRecipient
                  })
                  // Compose display address and set form fields
                  setValue('name', addrRecipient)
                  setValue('phone', addrPhone)
                  setValue('shipping_address', `${addrStreet}, ${addrWard}, ${addrDistrict}, ${addrCity}`)
                  // Refresh address list after save (v1)
                  const refreshed = await listAddressesV1()
                  const rows = refreshed?.addresses?.rows || []
                  setAddresses(rows)
                  const saved = rows.find(
                    (a: any) =>
                      `${a.street}, ${a.ward}, ${a.district}, ${a.city}` ===
                      `${addrStreet}, ${addrWard}, ${addrDistrict}, ${addrCity}`
                  )
                  if (saved?.id) setSelectedAddressId(saved.id)
                  setAddressDialogOpen(false)
                } catch (e) {
                  setAddressDialogOpen(false)
                }
              }}
            >
              Lưu địa chỉ
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  )
}

export default CheckoutPage
