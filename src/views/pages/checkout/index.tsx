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
  Portal,
  Stepper,
  Step,
  StepLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox
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
import { deleteCartItems, deleteCartItemsByIds } from 'src/services/cart'
import { createOrder } from 'src/services/checkout'
import { getDiscountByCode, v1GetDiscounts } from 'src/services/discount'
import { createUserInteraction } from 'src/services/userInteraction'
import { getAddressesByUserId, createAddressV1, listAddressesV1 } from 'src/services/address'
import {
  getProvinces,
  getDistrictsByProvince,
  getWardsByDistrict,
  Province,
  District,
  Ward
} from 'src/services/addressApi'
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
  const [selectedCartItemIds, setSelectedCartItemIds] = useState<string[]>([])
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
  const [discountDialogOpen, setDiscountDialogOpen] = useState(false)
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

  // Modern checkout additions
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard')
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [orderNote, setOrderNote] = useState('')

  // Address API states
  const [provinces, setProvinces] = useState<Province[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [wards, setWards] = useState<Ward[]>([])
  const [loadingProvinces, setLoadingProvinces] = useState(false)
  const [loadingDistricts, setLoadingDistricts] = useState(false)
  const [loadingWards, setLoadingWards] = useState(false)

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
    const selectedIds = localStorage.getItem('selectedCartItemIds')
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
    if (selectedIds) {
      try {
        const parsedIds = JSON.parse(selectedIds) as string[]
        if (Array.isArray(parsedIds) && parsedIds.length > 0) {
          setSelectedCartItemIds(parsedIds)
        }
      } catch {}
      // Do not remove here; allow checkout refresh to keep selection
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
        const res = await v1GetDiscounts({ page: 1, limit: 50 })
        const items = res?.discounts?.items || []
        setAvailableVouchers(items as any)
      } catch (error) {
        console.error('Error fetching vouchers:', error)
      } finally {
        setLoadingVouchers(false)
      }
    }

    fetchVouchers()
  }, [])

  // Auto read selected code from Cart and apply when data ready
  useEffect(() => {
    try {
      const code = localStorage.getItem('selectedDiscountCode')
      if (code) setDiscountCode(code)
    } catch {}
  }, [])

  useEffect(() => {
    const tryAutoApply = async () => {
      if (!discountCode || appliedDiscount) return
      // Try from loaded vouchers first
      let found: any = availableVouchers.find(v => String(v.code || '').toLowerCase() === discountCode.toLowerCase())
      if (!found) {
        try {
          const res = await v1GetDiscounts({ page: 1, limit: 100 })
          const list: any[] = res?.discounts?.items || []
          found = list.find(d => String(d.code || '').toLowerCase() === discountCode.toLowerCase())
        } catch {}
      }
      if (found) {
        // Validate min and dates
        const now = new Date()
        const start = new Date(
          found.effective_date.slice(0, 4) +
            '-' +
            found.effective_date.slice(4, 6) +
            '-' +
            found.effective_date.slice(6, 8)
        )
        const end = new Date(
          found.valid_until.slice(0, 4) + '-' + found.valid_until.slice(4, 6) + '-' + found.valid_until.slice(6, 8)
        )
        if (now >= start && now <= end && orderTotal >= Number(found.min_order_value || 0)) {
          const type = String(found.discount_type)
          const value = Number(found.discount_value || 0)
          let amount = 0
          if (type === '1') {
            amount = Math.floor((orderTotal * value) / 100)
            const cap = found.max_discount_amount != null ? Number(found.max_discount_amount) : null
            if (cap && cap > 0) amount = Math.min(amount, cap)
          } else {
            amount = value
          }
          setAppliedDiscount({
            code: found.code,
            discountAmount: amount,
            discountType: type === '1' ? 'percentage' : 'fixed'
          })
          setDiscountError('')
        }
      }
    }
    tryAutoApply()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableVouchers, discountCode])

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
      // Reset cascading dropdowns
      setDistricts([])
      setWards([])
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

    const list = selectedCartItemIds.length > 0 ? items.filter(it => selectedCartItemIds.includes(it.id)) : items
    return (
      list?.reduce((total, item) => {
        const price = item?.variant?.product?.price ?? item?.variant?.price ?? 0
        const qty = item?.quantity ?? 0
        return total + price * qty
      }, 0) || 0
    )
  }

  const orderTotal = getOrderTotal()
  // Align shipping fee with Cart page (currently 0)
  const shippingFee = shippingMethod === 'express' ? 30000 : 0

  // Cart meta for UX buttons
  const cartItemCount = isBuyNowMode
    ? buyNowItems.reduce((acc, it) => acc + (it?.quantity || 0), 0)
    : items.reduce((acc, it) => acc + (it?.quantity || 0), 0)

  // Tính toán discount (appliedDiscount.discountAmount is absolute after validation)
  const getDiscountAmount = () => {
    if (!appliedDiscount) return 0
    return Math.max(0, Math.min(orderTotal, appliedDiscount.discountAmount))
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

        // If not buy now, delete selected items before redirect
        if (!isBuyNowMode) {
          try {
            const ids = selectedCartItemIds.length > 0 ? selectedCartItemIds : items.map(i => i.id)
            if (ids.length > 0) {
              await deleteCartItemsByIds(ids.map(id => (typeof id === 'string' ? parseInt(id, 10) : id)))
            }
          } catch (e) {
            // ignore deletion error to not block payment redirect
          }
        }

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
      // Prefer v1 list to validate and compute like Cart
      const res = await v1GetDiscounts({ page: 1, limit: 100 })
      const list: any[] = res?.discounts?.items || []
      const found = list.find(d => String(d.code || '').toLowerCase() === discountCode.trim().toLowerCase())
      if (!found) {
        setDiscountError('Mã giảm giá không hợp lệ')
        return
      }

      // Validate date window
      const now = new Date()
      const start = new Date(
        found.effective_date.slice(0, 4) +
          '-' +
          found.effective_date.slice(4, 6) +
          '-' +
          found.effective_date.slice(6, 8)
      )
      const end = new Date(
        found.valid_until.slice(0, 4) + '-' + found.valid_until.slice(4, 6) + '-' + found.valid_until.slice(6, 8)
      )
      if (!(now >= start && now <= end)) {
        setDiscountError('Mã giảm giá chưa hiệu lực hoặc đã hết hạn')
        return
      }

      // Validate min order
      if (orderTotal < Number(found.min_order_value || 0)) {
        setDiscountError(`Đơn tối thiểu ${Number(found.min_order_value || 0).toLocaleString()}VNĐ`)
        return
      }

      // Compute amount
      const type = String(found.discount_type)
      const value = Number(found.discount_value || 0)
      let amount = 0
      if (type === '1') {
        amount = Math.floor((orderTotal * value) / 100)
        const cap = found.max_discount_amount != null ? Number(found.max_discount_amount) : null
        if (cap && cap > 0) amount = Math.min(amount, cap)
      } else {
        amount = value
      }

      setAppliedDiscount({
        code: found.code,
        discountAmount: amount,
        discountType: type === '1' ? 'percentage' : 'fixed'
      })
      try {
        localStorage.setItem('selectedDiscountCode', found.code)
      } catch {}
      setDiscountError('')
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
    const sourceItems = isBuyNowMode
      ? buyNowItems
      : selectedCartItemIds.length > 0
        ? items.filter(it => selectedCartItemIds.includes(it.id))
        : items

    const variants = isBuyNowMode
      ? sourceItems.map(item => ({ variant_id: parseInt(item.product_variant_id, 10), quantity: item.quantity }))
      : sourceItems.map(item => ({ variant_id: parseInt(item.variant.id, 10), quantity: item.quantity }))

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

  // Load provinces on component mount
  useEffect(() => {
    loadProvinces()
  }, [])

  // Load provinces
  const loadProvinces = async () => {
    setLoadingProvinces(true)
    try {
      const provincesData = await getProvinces()
      setProvinces(provincesData)
    } catch (error) {
      console.error('Error loading provinces:', error)
    } finally {
      setLoadingProvinces(false)
    }
  }

  // Load districts by province code
  const loadDistricts = async (provinceCode: string) => {
    setLoadingDistricts(true)
    setDistricts([])
    setWards([])
    try {
      const districtsData = await getDistrictsByProvince(provinceCode)
      setDistricts(districtsData)
    } catch (error) {
      console.error('Error loading districts:', error)
    } finally {
      setLoadingDistricts(false)
    }
  }

  // Load wards by district code
  const loadWards = async (districtCode: string) => {
    setLoadingWards(true)
    setWards([])
    try {
      const wardsData = await getWardsByDistrict(districtCode)
      setWards(wardsData)
    } catch (error) {
      console.error('Error loading wards:', error)
    } finally {
      setLoadingWards(false)
    }
  }

  // Handle province change
  const handleProvinceChange = (provinceName: string) => {
    const selectedProvince = provinces.find(p => p.name === provinceName)
    if (selectedProvince) {
      setAddrCity(provinceName)
      loadDistricts(selectedProvince.code)
      // Reset district and ward when province changes
      setAddrDistrict('')
      setAddrWard('')
    }
  }

  // Handle district change
  const handleDistrictChange = (districtName: string) => {
    const selectedDistrict = districts.find(d => d.name === districtName)
    if (selectedDistrict) {
      setAddrDistrict(districtName)
      loadWards(selectedDistrict.code)
      // Reset ward when district changes
      setAddrWard('')
    }
  }

  // Handle ward change
  const handleWardChange = (wardName: string) => {
    setAddrWard(wardName)
  }

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

        {/* Step indicator */}
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
          <Stepper activeStep={1} alternativeLabel sx={{ mt: 2 }}>
            <Step key='cart'>
              <StepLabel>Giỏ hàng</StepLabel>
            </Step>
            <Step key='checkout'>
              <StepLabel>Thanh toán</StepLabel>
            </Step>
            <Step key='payment'>
              <StepLabel>Thanh toán/Phiếu thu</StepLabel>
            </Step>
          </Stepper>
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

                    {/* Shipping method */}
                    <Box>
                      <Typography variant='subtitle1' sx={{ mb: 1 }}>
                        Phương thức vận chuyển
                      </Typography>
                      <FormControl component='fieldset'>
                        <RadioGroup
                          row
                          value={shippingMethod}
                          onChange={e => setShippingMethod(e.target.value as 'standard' | 'express')}
                        >
                          <FormControlLabel value='standard' control={<Radio />} label='Tiêu chuẩn (Miễn phí)' />
                          <FormControlLabel value='express' control={<Radio />} label='Nhanh (30.000đ)' />
                        </RadioGroup>
                      </FormControl>
                    </Box>

                    {/* Order note */}
                    <TextField
                      label='Ghi chú cho đơn hàng (tùy chọn)'
                      fullWidth
                      multiline
                      minRows={2}
                      value={orderNote}
                      onChange={e => setOrderNote(e.target.value)}
                    />

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

                    {/* Terms */}
                    <FormControlLabel
                      control={<Checkbox checked={agreeTerms} onChange={e => setAgreeTerms(e.target.checked)} />}
                      label={
                        <Typography variant='body2'>Tôi đồng ý với điều khoản sử dụng và chính sách bảo mật</Typography>
                      }
                      sx={{ mt: 1 }}
                    />

                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Button
                        variant='text'
                        color='primary'
                        onClick={() => router.push(ROUTE_CONFIG.CART)}
                        sx={{ textTransform: 'none' }}
                        startIcon={<ArrowBack />}
                      >
                        {isBuyNowMode ? 'Quay lại sản phẩm' : 'Trở lại giỏ hàng'}
                      </Button>
                      <Button type='submit' variant='contained' color='primary' disabled={!agreeTerms}>
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
                        <Typography variant='caption' color='text.secondary' sx={{ display: 'block' }}>
                          Mã biến thể: {item.product_variant_id}
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
                    const thumbnail =
                      product?.thumbnail || (item as any)?.variant?.watch?.thumbnail || '/luxury-watch-hero.jpg'
                    const name = product?.name || (item as any)?.variant?.watch?.name || 'Sản phẩm'
                    const price = product?.price ?? (item as any)?.variant?.price ?? 0
                    const basePrice = (item as any)?.variant?.watch?.base_price || 0
                    const code = (item as any)?.variant?.watch?.code
                    const model = (item as any)?.variant?.watch?.model
                    const caseMaterial = (item as any)?.variant?.watch?.case_material
                    const caseSize = (item as any)?.variant?.watch?.case_size
                    const strapSize = (item as any)?.variant?.watch?.strap_size
                    const waterRes = (item as any)?.variant?.watch?.water_resistance
                    const gender = (item as any)?.variant?.watch?.gender

                    if (!product && !(item as any)?.variant?.watch) {
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
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
                            {!!code && (
                              <Typography variant='caption' color='text.secondary'>
                                Mã: <b>{code}</b>
                              </Typography>
                            )}
                            {!!model && (
                              <Typography variant='caption' color='text.secondary'>
                                Model: <b>{model}</b>
                              </Typography>
                            )}
                            {!!caseMaterial && (
                              <Typography variant='caption' color='text.secondary'>
                                Vỏ: <b>{caseMaterial}</b>
                              </Typography>
                            )}
                            {!!caseSize && (
                              <Typography variant='caption' color='text.secondary'>
                                Size vỏ: <b>{caseSize}mm</b>
                              </Typography>
                            )}
                            {!!strapSize && (
                              <Typography variant='caption' color='text.secondary'>
                                Dây: <b>{strapSize}mm</b>
                              </Typography>
                            )}
                            {!!waterRes && (
                              <Typography variant='caption' color='text.secondary'>
                                Chống nước: <b>{waterRes}</b>
                              </Typography>
                            )}
                            {['0', '1', '2'].includes(String(gender)) && (
                              <Typography variant='caption' color='text.secondary'>
                                Giới tính: <b>{gender === '1' ? 'Nam' : gender === '2' ? 'Nữ' : 'Unisex'}</b>
                              </Typography>
                            )}
                          </Box>
                        </Box>
                        <Box>
                          <Typography variant='subtitle1' fontWeight={700} color='error.main'>
                            {(price * quantity).toLocaleString()}VNĐ
                          </Typography>
                          {basePrice && basePrice !== price && (
                            <Typography
                              variant='caption'
                              color='text.secondary'
                              sx={{ textDecoration: 'line-through' }}
                            >
                              {(basePrice * quantity).toLocaleString()}VNĐ
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    )
                  })
                ) : (
                  <Typography variant='body2'>Không có sản phẩm trong giỏ hàng</Typography>
                )}

                {/* Removed duplicate order-details breakdown; compact list above is sufficient */}

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
                            onKeyDown={e => {
                              if (e.key === 'Enter') handleApplyDiscount()
                            }}
                          />
                          <Button
                            variant='outlined'
                            onClick={() => setDiscountDialogOpen(true)}
                            sx={{ textTransform: 'none' }}
                          >
                            Chọn mã giảm giá
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
                    <Typography>Phí vận chuyển ({shippingMethod === 'express' ? 'Nhanh' : 'Tiêu chuẩn'})</Typography>
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
                    {discountAmount > 0 && (
                      <Typography variant='caption' color='success.main' display='block'>
                        Tiết kiệm: {discountAmount.toLocaleString()}VNĐ
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Card>
            </Grid>
          </Grid>
        </Card>
        {/* Discount selection dialog */}
        <Dialog open={discountDialogOpen} onClose={() => setDiscountDialogOpen(false)} maxWidth='sm' fullWidth>
          <DialogTitle>Mã giảm giá khả dụng</DialogTitle>
          <DialogContent dividers>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {availableVouchers.map((d: any) => {
                const now = new Date()
                const start = new Date(
                  d.effective_date?.slice?.(0, 4) +
                    '-' +
                    d.effective_date?.slice?.(4, 6) +
                    '-' +
                    d.effective_date?.slice?.(6, 8)
                )
                const end = new Date(
                  d.valid_until?.slice?.(0, 4) + '-' + d.valid_until?.slice?.(4, 6) + '-' + d.valid_until?.slice?.(6, 8)
                )
                const inDate = d.effective_date && d.valid_until ? now >= start && now <= end : true
                const eligible = orderTotal >= Number(d.min_order_value || 0)
                const type = String(d.discount_type)
                const value = Number(d.discount_value || 0)
                let amount = 0
                if (type === '1') {
                  amount = Math.floor((orderTotal * value) / 100)
                  const cap = d.max_discount_amount != null ? Number(d.max_discount_amount) : null
                  if (cap && cap > 0) amount = Math.min(amount, cap)
                } else {
                  amount = value
                }
                return (
                  <Paper key={d.id} variant='outlined' sx={{ p: 1.5, opacity: inDate && eligible ? 1 : 0.6 }}>
                    <Box display='flex' justifyContent='space-between' alignItems='center'>
                      <Box>
                        <Typography fontWeight={700}>{d.code}</Typography>
                        <Typography variant='caption' color='text.secondary' display='block'>
                          {d.name}
                        </Typography>
                        <Typography variant='caption' color='text.secondary' display='block'>
                          ĐH tối thiểu: {Number(d.min_order_value || 0).toLocaleString()}VNĐ
                        </Typography>
                      </Box>
                      <Box textAlign='right'>
                        <Typography variant='body2' color={inDate && eligible ? 'success.main' : 'text.secondary'}>
                          {inDate && eligible ? `Giảm: ${amount.toLocaleString()}VNĐ` : 'Chưa đủ điều kiện'}
                        </Typography>
                        <Button
                          size='small'
                          variant='contained'
                          sx={{ mt: 1, textTransform: 'none' }}
                          disabled={!(inDate && eligible)}
                          onClick={() => {
                            setDiscountCode(d.code)
                            setAppliedDiscount({
                              code: d.code,
                              discountAmount: amount,
                              discountType: String(d.discount_type) === '1' ? 'percentage' : 'fixed'
                            })
                            try {
                              localStorage.setItem('selectedDiscountCode', d.code)
                            } catch {}
                            setDiscountDialogOpen(false)
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
        {/* New Address Dialog */}
        <Dialog open={addressDialogOpen} onClose={() => setAddressDialogOpen(false)} fullWidth maxWidth='md'>
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

              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Tỉnh/Thành phố</InputLabel>
                    <Select
                      label='Tỉnh/Thành phố'
                      disabled={loadingProvinces}
                      value={addrCity || ''}
                      onChange={e => handleProvinceChange(e.target.value)}
                    >
                      {provinces.length > 0 ? (
                        provinces.map(province => (
                          <MenuItem key={province.code} value={province.name}>
                            {province.name_with_type}
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem disabled>Đang tải...</MenuItem>
                      )}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Quận/Huyện</InputLabel>
                    <Select
                      label='Quận/Huyện'
                      disabled={loadingDistricts || districts.length === 0}
                      value={addrDistrict || ''}
                      onChange={e => handleDistrictChange(e.target.value)}
                    >
                      {districts.map(district => (
                        <MenuItem key={district.code} value={district.name}>
                          {district.name_with_type}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Phường/Xã</InputLabel>
                    <Select
                      label='Phường/Xã'
                      disabled={loadingWards || wards.length === 0}
                      value={addrWard || ''}
                      onChange={e => handleWardChange(e.target.value)}
                    >
                      {wards.map(ward => (
                        <MenuItem key={ward.code} value={ward.name}>
                          {ward.name_with_type}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
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
