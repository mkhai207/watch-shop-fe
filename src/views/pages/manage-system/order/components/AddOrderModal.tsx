import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Grid,
  Box,
  Typography,
  Alert,
  IconButton,
  Divider,
  Card,
  Chip,
  CircularProgress
} from '@mui/material'
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ShoppingCart as ShoppingCartIcon,
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material'
import * as yup from 'yup'
import { getVariantsByProductId } from 'src/services/product'
import { getUserByEmail } from 'src/services/user'
import { createOrderSystem } from 'src/services/order'
import { TCreateOrderSystem } from 'src/types/order'

interface ProductVariant {
  id: string
  created_at: string
  created_by: string
  updated_at: string
  updated_by: string
  product_id: string
  size_id: string
  color_id: string
  quantity: number
  active: boolean
  color: {
    id: string
    name: string
    hex_code: string
  }
  size: {
    id: string
    name: string
  }
}

interface ProductInfo {
  id: string
  name: string
  variants: ProductVariant[]
}

interface OrderDetail {
  product_variant_id: number
  quantity: number
  product_name?: string
  variant_info?: string
}

interface NewOrder {
  name: string
  phone: string
  shipping_address: string
  paymentMethod: string
  discount_code?: string
  user: number
  orderDetails: OrderDetail[]
}

interface AddOrderModalProps {
  open: boolean
  onClose: () => void
  onSave: (order: NewOrder) => void
  loading?: boolean
}

// Yup validation schema
const orderSchema = yup.object({
  name: yup.string().trim().min(2, 'Tên khách hàng phải có ít nhất 2 ký tự').required('Tên khách hàng là bắt buộc'),
  phone: yup
    .string()
    .trim()
    .matches(/^[0-9]{10,11}$/, 'Số điện thoại phải có 10-11 chữ số')
    .required('Số điện thoại là bắt buộc'),
  shipping_address: yup
    .string()
    .trim()
    .min(10, 'Địa chỉ giao hàng phải có ít nhất 10 ký tự')
    .required('Địa chỉ giao hàng là bắt buộc'),
  paymentMethod: yup.string().required('Vui lòng chọn phương thức thanh toán'),
  discount_code: yup.string().optional(),
  user: yup.number().positive('Phải chọn người dùng').required('Phải chọn người dùng'),
  orderDetails: yup
    .array()
    .of(
      yup.object({
        product_variant_id: yup.number().positive('ID biến thể sản phẩm phải là số dương').required(),
        quantity: yup.number().positive('Số lượng phải là số dương').required()
      })
    )
    .min(1, 'Phải có ít nhất một sản phẩm trong đơn hàng')
})

const AddOrderModal: React.FC<AddOrderModalProps> = ({ open, onClose, onSave, loading = false }) => {
  const [newOrder, setNewOrder] = useState<NewOrder>({
    name: '',
    phone: '',
    shipping_address: '',
    paymentMethod: '',
    user: 0,
    orderDetails: []
  })
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({})
  const [isValidating, setIsValidating] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  // Product selection states
  const [productId, setProductId] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<ProductInfo | null>(null)
  const [selectedColor, setSelectedColor] = useState('')
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [isLoadingProduct, setIsLoadingProduct] = useState(false)
  const [productError, setProductError] = useState('')

  // User selection states
  const [userEmail, setUserEmail] = useState('')
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [isLoadingUser, setIsLoadingUser] = useState(false)
  const [userError, setUserError] = useState('')

  // API function to fetch product variants
  const fetchProductInfo = async (id: string): Promise<ProductInfo> => {
    try {
      const response = await getVariantsByProductId({ productId: id })

      if (response.status === 'success' && response.data.length > 0) {
        const productName = `Sản phẩm ${id}`

        return {
          id: id,
          name: productName,
          variants: response.data
        }
      } else {
        throw new Error('Không tìm thấy biến thể sản phẩm')
      }
    } catch (error) {
      throw new Error('Không tìm thấy sản phẩm với ID này')
    }
  }

  const handleSearchUser = async () => {
    if (!userEmail.trim()) {
      setUserError('Vui lòng nhập email người dùng')

      return
    }

    setIsLoadingUser(true)
    setUserError('')
    setSelectedUser(null)

    try {
      const response = await getUserByEmail({ email: userEmail })
      if (response.status === 'success' && response.data.length > 0) {
        setSelectedUser(response.data[0])
      } else {
        setUserError('Không tìm thấy người dùng với email này')
      }
    } catch (error) {
      setUserError('Không tìm thấy người dùng với email này')
    } finally {
      setIsLoadingUser(false)
    }
  }

  const handleConfirmUser = () => {
    if (!selectedUser) {
      return
    }

    setNewOrder(prev => ({
      ...prev,
      user: Number(selectedUser.id),
      name: selectedUser.full_name || prev.name,
      phone: selectedUser.phone || prev.phone,
      shipping_address: prev.shipping_address // Giữ nguyên địa chỉ vì user có thể không có địa chỉ
    }))

    // Reset selection
    setUserEmail('')
    setSelectedUser(null)
  }

  const handleSearchProduct = async () => {
    if (!productId.trim()) {
      setProductError('Vui lòng nhập ID sản phẩm')

      return
    }

    setIsLoadingProduct(true)
    setProductError('')
    setSelectedProduct(null)
    setSelectedColor('')
    setSelectedSize('')
    setSelectedVariant(null)

    try {
      const product = await fetchProductInfo(productId)
      setSelectedProduct(product)
    } catch (error) {
      setProductError('Không tìm thấy sản phẩm với ID này')
    } finally {
      setIsLoadingProduct(false)
    }
  }

  const handleColorChange = (color: string) => {
    setSelectedColor(color)
    setSelectedSize('')
    setSelectedVariant(null)
  }

  const handleSizeChange = (size: string) => {
    setSelectedSize(size)
    if (selectedProduct) {
      const variant = selectedProduct.variants.find(v => v.color.name === selectedColor && v.size.name === size)
      setSelectedVariant(variant || null)
    }
  }

  const handleConfirmVariant = () => {
    if (!selectedVariant) {
      return
    }

    const newDetail: OrderDetail = {
      product_variant_id: Number(selectedVariant.id),
      quantity: quantity,
      product_name: selectedProduct?.name,
      variant_info: `${selectedColor} - ${selectedSize}`
    }

    setNewOrder(prev => ({
      ...prev,
      orderDetails: [...prev.orderDetails, newDetail]
    }))

    // Reset selection
    setProductId('')
    setSelectedProduct(null)
    setSelectedColor('')
    setSelectedSize('')
    setSelectedVariant(null)
    setQuantity(1)
  }

  const handleRemoveDetail = (index: number) => {
    setNewOrder(prev => ({
      ...prev,
      orderDetails: prev.orderDetails.filter((_, i) => i !== index)
    }))
  }

  const validateForm = async () => {
    setIsValidating(true)
    try {
      await orderSchema.validate(newOrder, { abortEarly: false })
      setFormErrors({})

      return true
    } catch (error: any) {
      const errors: { [key: string]: string } = {}
      error.inner.forEach((err: any) => {
        errors[err.path] = err.message
      })
      setFormErrors(errors)

      return false
    } finally {
      setIsValidating(false)
    }
  }

  const handleSave = async () => {
    const isValid = await validateForm()
    if (isValid) {
      setIsCreating(true)
      try {
        // Chuyển đổi dữ liệu để phù hợp với API
        const orderData: TCreateOrderSystem = {
          status: 'PENDING',
          paymentMethod: newOrder.paymentMethod,
          orderDetails: newOrder.orderDetails.map(detail => ({
            quantity: detail.quantity,
            product_variant_id: detail.product_variant_id.toString()
          })),
          shipping_address: newOrder.shipping_address,
          name: newOrder.name,
          phone: newOrder.phone,
          user: newOrder.user,
          discount_code: newOrder.discount_code || ''
        }

        const response = await createOrderSystem(orderData)

        if (response.status === 'success') {
          // Đóng modal và refresh danh sách orders
          handleClose()
          onSave(newOrder)
        }
      } catch (error) {
        console.error('Error creating order:', error)
      } finally {
        setIsCreating(false)
      }
    }
  }

  const handleClose = () => {
    setNewOrder({
      name: '',
      phone: '',
      shipping_address: '',
      paymentMethod: '',
      user: 0,
      orderDetails: []
    })
    setFormErrors({})
    setProductId('')
    setSelectedProduct(null)
    setSelectedColor('')
    setSelectedSize('')
    setSelectedVariant(null)
    setQuantity(1)
    setProductError('')
    setUserEmail('')
    setSelectedUser(null)
    setUserError('')
    onClose()
  }

  const getAvailableColors = () => {
    if (!selectedProduct) {
      return []
    }

    const colors = selectedProduct.variants.map(v => v.color.name)

    return Array.from(new Set(colors))
  }

  const getAvailableSizes = () => {
    if (!selectedProduct || !selectedColor) {
      return []
    }

    const sizes = selectedProduct.variants.filter(v => v.color.name === selectedColor).map(v => v.size.name)

    return Array.from(new Set(sizes))
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth='lg'
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle
        sx={{
          backgroundColor: 'success.main',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          fontSize: '1.2rem',
          fontWeight: 'bold'
        }}
      >
        <AddIcon />
        Thêm đơn hàng mới
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Customer Information */}
          <Grid item xs={12}>
            <Typography variant='h6' sx={{ mb: 2, color: 'primary.main', fontWeight: 'bold' }}>
              Thông tin khách hàng
            </Typography>
          </Grid>

          {/* User Search */}
          <Grid item xs={12}>
            <Card sx={{ p: 2, backgroundColor: '#f8f9fa' }}>
              <Typography variant='subtitle1' sx={{ mb: 2, fontWeight: 'bold' }}>
                Tìm kiếm người dùng
              </Typography>
              <Grid container spacing={2} alignItems='center'>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label='Email người dùng'
                    value={userEmail}
                    onChange={e => setUserEmail(e.target.value)}
                    fullWidth
                    size='small'
                    error={!!userError}
                    helperText={userError}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <Button
                    variant='contained'
                    startIcon={isLoadingUser ? <CircularProgress size={16} /> : <SearchIcon />}
                    onClick={handleSearchUser}
                    disabled={isLoadingUser}
                    fullWidth
                    sx={{ borderRadius: 2, textTransform: 'none' }}
                  >
                    {isLoadingUser ? 'Đang tìm...' : 'Tìm kiếm'}
                  </Button>
                </Grid>
                {selectedUser && (
                  <Grid item xs={12} sm={6}>
                    <Alert severity='success' sx={{ borderRadius: 2 }}>
                      <Typography variant='subtitle2'>
                        Đã tìm thấy: {selectedUser.full_name} ({selectedUser.email})
                        <br />
                        ID: {selectedUser.id}
                      </Typography>
                      <Button
                        variant='contained'
                        size='small'
                        onClick={handleConfirmUser}
                        sx={{ mt: 1, borderRadius: 2, textTransform: 'none' }}
                      >
                        Xác nhận
                      </Button>
                    </Alert>
                  </Grid>
                )}
              </Grid>
            </Card>
          </Grid>

          {/* User ID Display */}
          <Grid item xs={12} sm={6}>
            <TextField
              label='User ID *'
              value={newOrder.user > 0 ? newOrder.user.toString() : ''}
              fullWidth
              required
              error={!!formErrors.user}
              helperText={formErrors.user || 'ID người dùng sẽ được tự động điền khi xác nhận'}
              InputProps={{
                readOnly: true,
                sx: { backgroundColor: '#f5f5f5' }
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label='Tên khách hàng *'
              value={newOrder.name}
              onChange={e => setNewOrder({ ...newOrder, name: e.target.value })}
              fullWidth
              required
              error={!!formErrors.name}
              helperText={formErrors.name}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label='Số điện thoại *'
              value={newOrder.phone}
              onChange={e => setNewOrder({ ...newOrder, phone: e.target.value })}
              fullWidth
              required
              error={!!formErrors.phone}
              helperText={formErrors.phone}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label='Địa chỉ giao hàng *'
              value={newOrder.shipping_address}
              onChange={e => setNewOrder({ ...newOrder, shipping_address: e.target.value })}
              fullWidth
              multiline
              rows={2}
              required
              error={!!formErrors.shipping_address}
              helperText={formErrors.shipping_address}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label='Mã giảm giá (tùy chọn)'
              value={newOrder.discount_code || ''}
              onChange={e => setNewOrder({ ...newOrder, discount_code: e.target.value })}
              fullWidth
              helperText='Nhập mã giảm giá nếu có'
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={!!formErrors.paymentMethod}>
              <InputLabel>Phương thức thanh toán *</InputLabel>
              <Select
                value={newOrder.paymentMethod}
                onChange={(e: SelectChangeEvent) => setNewOrder({ ...newOrder, paymentMethod: e.target.value })}
                label='Phương thức thanh toán *'
                required
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              >
                <MenuItem value='CASH'>Tiền mặt</MenuItem>
                <MenuItem value='ONLINE'>Thanh toán online</MenuItem>
              </Select>
              {formErrors.paymentMethod && (
                <Typography variant='caption' color='error' sx={{ mt: 0.5, ml: 1.5 }}>
                  {formErrors.paymentMethod}
                </Typography>
              )}
            </FormControl>
          </Grid>

          {/* Product Selection Section */}
          <Grid item xs={12}>
            <Divider sx={{ my: 3 }} />
            <Typography variant='h6' sx={{ mb: 2, color: 'primary.main', fontWeight: 'bold' }}>
              Chọn sản phẩm
            </Typography>
          </Grid>

          {/* Product Search */}
          <Grid item xs={12}>
            <Card sx={{ p: 2, backgroundColor: '#f8f9fa' }}>
              <Grid container spacing={2} alignItems='center'>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label='ID sản phẩm'
                    value={productId}
                    onChange={e => setProductId(e.target.value)}
                    fullWidth
                    size='small'
                    error={!!productError}
                    helperText={productError}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <Button
                    variant='contained'
                    startIcon={isLoadingProduct ? <CircularProgress size={16} /> : <SearchIcon />}
                    onClick={handleSearchProduct}
                    disabled={isLoadingProduct}
                    fullWidth
                    sx={{ borderRadius: 2, textTransform: 'none' }}
                  >
                    {isLoadingProduct ? 'Đang tìm...' : 'Tìm kiếm'}
                  </Button>
                </Grid>
              </Grid>
            </Card>
          </Grid>

          {/* Product Selection Interface */}
          {selectedProduct && (
            <Grid item xs={12}>
              <Card sx={{ p: 3, border: '2px solid #e3f2fd' }}>
                <Typography variant='h6' sx={{ mb: 2, color: 'primary.main' }}>
                  {selectedProduct.name}
                </Typography>

                <Grid container spacing={3}>
                  {/* Color Selection */}
                  <Grid item xs={12} sm={4}>
                    <Typography variant='subtitle2' sx={{ mb: 1, fontWeight: 'bold' }}>
                      Chọn màu sắc:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {getAvailableColors().map(color => (
                        <Chip
                          key={color}
                          label={color}
                          onClick={() => handleColorChange(color)}
                          color={selectedColor === color ? 'primary' : 'default'}
                          variant={selectedColor === color ? 'filled' : 'outlined'}
                          sx={{ cursor: 'pointer' }}
                        />
                      ))}
                    </Box>
                  </Grid>

                  {/* Size Selection */}
                  <Grid item xs={12} sm={4}>
                    <Typography variant='subtitle2' sx={{ mb: 1, fontWeight: 'bold' }}>
                      Chọn kích thước:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {getAvailableSizes().map(size => (
                        <Chip
                          key={size}
                          label={size}
                          onClick={() => handleSizeChange(size)}
                          color={selectedSize === size ? 'primary' : 'default'}
                          variant={selectedSize === size ? 'filled' : 'outlined'}
                          disabled={!selectedColor}
                          sx={{ cursor: 'pointer' }}
                        />
                      ))}
                    </Box>
                  </Grid>

                  {/* Quantity and Confirm */}
                  <Grid item xs={12} sm={4}>
                    <Typography variant='subtitle2' sx={{ mb: 1, fontWeight: 'bold' }}>
                      Số lượng:
                    </Typography>
                    <TextField
                      type='number'
                      value={quantity}
                      onChange={e => setQuantity(Number(e.target.value))}
                      size='small'
                      sx={{ width: 100, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                    <Button
                      variant='contained'
                      startIcon={<CheckCircleIcon />}
                      onClick={handleConfirmVariant}
                      disabled={!selectedVariant}
                      sx={{ ml: 2, borderRadius: 2, textTransform: 'none' }}
                    >
                      Xác nhận
                    </Button>
                  </Grid>

                  {/* Selected Variant Info */}
                  {selectedVariant && (
                    <Grid item xs={12}>
                      <Alert severity='success' sx={{ borderRadius: 2 }}>
                        <Typography variant='subtitle2'>
                          Đã chọn: {selectedProduct.name} - {selectedColor} - {selectedSize}
                          <br />
                          ID biến thể: {selectedVariant.id}
                          <br />
                          Tồn kho: {selectedVariant.quantity} sản phẩm
                        </Typography>
                      </Alert>
                    </Grid>
                  )}
                </Grid>
              </Card>
            </Grid>
          )}

          {/* Selected Products List */}
          <Grid item xs={12}>
            <Typography variant='h6' sx={{ mb: 2, color: 'primary.main', fontWeight: 'bold' }}>
              Sản phẩm đã chọn ({newOrder.orderDetails.length})
            </Typography>

            {newOrder.orderDetails.length === 0 ? (
              <Card sx={{ p: 3, textAlign: 'center', backgroundColor: '#fafafa' }}>
                <ShoppingCartIcon sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
                <Typography variant='body1' color='text.secondary'>
                  Chưa có sản phẩm nào được chọn
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Hãy tìm kiếm và chọn sản phẩm ở trên
                </Typography>
              </Card>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {newOrder.orderDetails.map((detail, index) => (
                  <Card key={index} sx={{ p: 2, border: '1px solid #e0e0e0' }}>
                    <Grid container spacing={2} alignItems='center'>
                      <Grid item xs={12} sm={6}>
                        <Typography variant='subtitle1' sx={{ fontWeight: 'bold' }}>
                          {detail.product_name}
                        </Typography>
                        <Typography variant='body2' color='text.secondary'>
                          {detail.variant_info}
                        </Typography>
                        <Typography variant='body2' color='primary' sx={{ fontWeight: 'bold' }}>
                          ID: {detail.product_variant_id}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <Typography variant='body2'>
                          Số lượng: <strong>{detail.quantity}</strong>
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <IconButton
                          color='error'
                          onClick={() => handleRemoveDetail(index)}
                          sx={{
                            backgroundColor: 'error.light',
                            color: 'white',
                            '&:hover': { backgroundColor: 'error.main' }
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </Card>
                ))}
              </Box>
            )}
          </Grid>

          {/* Validation Error */}
          {formErrors.orderDetails && (
            <Grid item xs={12}>
              <Alert severity='error' sx={{ borderRadius: 2 }}>
                {formErrors.orderDetails}
              </Alert>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 3, gap: 2 }}>
        <Button onClick={handleClose} variant='outlined' sx={{ borderRadius: 2, px: 3 }}>
          Huỷ
        </Button>
        <Button
          onClick={handleSave}
          variant='contained'
          color='success'
          disabled={loading || isValidating || isCreating}
          sx={{ borderRadius: 2, px: 3 }}
        >
          {loading || isValidating || isCreating ? 'Đang tạo...' : 'Tạo đơn hàng'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AddOrderModal
