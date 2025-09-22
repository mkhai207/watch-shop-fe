import React, { useState, useRef, useEffect } from 'react'
import * as yup from 'yup'
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
  LinearProgress,
  Alert
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import CloseIcon from '@mui/icons-material/Close'

import { TBrand, TCategory } from 'src/types/product'
import { getCategories } from 'src/services/category'
import { getBrands } from 'src/services/brand'
import { useFileUpload } from 'src/hooks/useFileUpload'
import { createProduct } from 'src/services/product'
import Spinner from 'src/components/spinner'

type TProps = {
  open: boolean
  onClose: () => void
}

type TVariant = {
  hex_code: string
  inventory: {
    size: string
    quantity: number
  }[]
}

// Hàm kiểm tra màu HEX hợp lệ
const isValidHexColor = (color: string) => {
  if (!color || typeof color !== 'string') return false
  const trimmedColor = color.trim()
  const hexPattern = /^#([0-9a-f]{3}){1,2}$/i

  return hexPattern.test(trimmedColor)
}

// Hàm lấy màu an toàn cho MUI
const getSafeColor = (color: string) => {
  if (!color || typeof color !== 'string') {
    return '#000000'
  }
  const trimmedColor = color.trim()

  return isValidHexColor(trimmedColor) ? trimmedColor : '#000000'
}

// Yup validation schema
const productSchema = yup.object().shape({
  name: yup.string().required('Tên sản phẩm không được để trống'),
  price: yup
    .string()
    .required('Giá sản phẩm không được để trống')
    .test('is-positive', 'Giá sản phẩm phải lớn hơn 0', value => {
      const num = parseInt(value || '0')

      return num > 0
    }),
  gender: yup.string().required('Vui lòng chọn giới tính'),
  category_id: yup.string().required('Vui lòng chọn danh mục'),
  brand_id: yup.string().required('Vui lòng chọn thương hiệu'),
  thumbnail: yup.string().required('Vui lòng chọn ảnh đại diện'),
  description: yup.string().required('Mô tả sản phẩm không được để trống'),
  sold: yup.string().required('Số lượng đã bán không được để trống'),
  status: yup.boolean(),
  slider: yup.string(),
  variants: yup
    .array()
    .of(
      yup.object().shape({
        hex_code: yup.string().required('Mã màu không được để trống'),
        inventory: yup.array().of(
          yup.object().shape({
            size: yup.string().required('Size không được để trống'),
            quantity: yup.number().min(0, 'Số lượng phải >= 0')
          })
        )
      })
    )
    .test('has-valid-variant', 'Vui lòng thêm ít nhất một màu và size với số lượng > 0', function (value) {
      if (!value || value.length === 0) return false

      return value.some(variant => {
        if (!variant.hex_code || variant.hex_code.trim() === '') return false
        if (!variant.inventory || variant.inventory.length === 0) return false

        return variant.inventory.some(item => (item.quantity || 0) > 0)
      })
    })
})

const AddProductModal: React.FC<TProps> = ({ open, onClose }) => {
  const [product, setProduct] = useState({
    name: '',
    description: '',
    price: '',
    gender: '',
    sold: '',
    status: true,
    thumbnail: '',
    slider: '',
    category_id: '',
    brand_id: ''
  })

  // Sử dụng hook upload ảnh
  const { uploadFile, uploadMultipleFiles, isUploading, uploadProgress, error } = useFileUpload()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const sliderFileInputRef = useRef<HTMLInputElement>(null)

  const [variants, setVariants] = useState<TVariant[]>([
    {
      hex_code: '#000000',
      inventory: []
    }
  ])

  const [categories, setCategories] = useState<TCategory[]>([])
  const [brands, setBrands] = useState<TBrand[]>([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{
    name?: string
    price?: string
    gender?: string
    category_id?: string
    brand_id?: string
    thumbnail?: string
    description?: string
    sold?: string
    variants?: string
  }>({})

  const fetchGetCategories = async () => {
    const response = await getCategories()
    if (response.status === 'success') {
      setCategories(response.data)
    }
  }

  const fetchGetBrands = async () => {
    const response = await getBrands()
    if (response.status === 'success') {
      setBrands(response.data)
    }
  }

  const handleAddVariant = () => {
    setVariants([
      ...variants,
      {
        hex_code: '#000000',
        inventory: [
          { size: 'S', quantity: 0 },
          { size: 'M', quantity: 0 },
          { size: 'L', quantity: 0 }
        ]
      }
    ])
  }

  const validateForm = async () => {
    try {
      const formData = {
        ...product,
        variants
      }

      await productSchema.validate(formData, { abortEarly: false })
      setErrors({})

      return true
    } catch (validationError: any) {
      const newErrors: typeof errors = {}

      if (validationError.inner) {
        validationError.inner.forEach((error: any) => {
          newErrors[error.path as keyof typeof errors] = error.message
        })
      }

      setErrors(newErrors)

      return false
    }
  }

  const handleAddProduct = async () => {
    try {
      setLoading(true)

      // Validate form
      const isValid = await validateForm()
      if (!isValid) {
        setLoading(false)

        return
      }

      // Prepare product data
      const productData = {
        ...product,
        price: parseInt(product.price),
        sold: parseInt(product.sold) || 0,
        variants: variants
      }

      console.log('Product data to submit:', productData)

      const response = await createProduct(productData)
      if (response.status === 'success') {
        onClose()
        setLoading(false)

        // Reset form
        setProduct({
          name: '',
          description: '',
          price: '',
          gender: '',
          sold: '',
          status: true,
          thumbnail: '',
          slider: '',
          category_id: '',
          brand_id: ''
        })
        setVariants([
          {
            hex_code: '#000000',
            inventory: []
          }
        ])
        setErrors({})
      }
    } catch (error) {
      console.error('Error creating product:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    const updatedVariants = variants.map(variant => {
      const colors = variant.hex_code.split(',').map(color => {
        const trimmedColor = color.trim()

        return isValidHexColor(trimmedColor) ? trimmedColor : '#000000'
      })

      return {
        ...variant,
        hex_code: colors.join(',')
      }
    })

    if (JSON.stringify(updatedVariants) !== JSON.stringify(variants)) {
      setVariants(updatedVariants)
    }
  }, [variants])

  useEffect(() => {
    fetchGetCategories()
  }, [])

  useEffect(() => {
    fetchGetBrands()
  }, [])

  return (
    <>
      {loading && <Spinner />}
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth='lg'
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            position: 'relative'
          }
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 1,
            color: 'grey.500',
            '&:hover': {
              color: 'grey.700'
            }
          }}
        >
          <CloseIcon />
        </IconButton>
        <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.5rem', pr: 6 }}>Thêm sản phẩm mới</DialogTitle>
        <DialogContent sx={{ pt: 3, maxHeight: '80vh', overflow: 'auto' }}>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Typography variant='h6' sx={{ fontWeight: 'bold', color: '#1976D2', mb: 3 }}>
                Thông tin cơ bản
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label='Tên sản phẩm'
                    fullWidth
                    required
                    value={product.name}
                    onChange={e => {
                      setProduct({ ...product, name: e.target.value })
                      if (errors.name) {
                        setErrors({ ...errors, name: undefined })
                      }
                    }}
                    placeholder='Áo tay lỡ'
                    error={!!errors.name}
                    helperText={errors.name}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label='Giá (VNĐ)'
                    type='number'
                    fullWidth
                    required
                    InputProps={{ inputProps: { min: 0 } }}
                    value={product.price}
                    onChange={e => {
                      setProduct({ ...product, price: e.target.value })
                      if (errors.price) {
                        setErrors({ ...errors, price: undefined })
                      }
                    }}
                    error={!!errors.price}
                    helperText={errors.price}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label='Mô tả sản phẩm'
                    fullWidth
                    required
                    multiline
                    rows={4}
                    value={product.description}
                    onChange={e => {
                      setProduct({ ...product, description: e.target.value })
                      if (errors.description) {
                        setErrors({ ...errors, description: undefined })
                      }
                    }}
                    error={!!errors.description}
                    helperText={errors.description}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <FormControl fullWidth required error={!!errors.gender}>
                    <InputLabel>Giới tính</InputLabel>
                    <Select
                      label='Giới tính'
                      value={product.gender}
                      onChange={e => {
                        setProduct({ ...product, gender: e.target.value })
                        if (errors.gender) {
                          setErrors({ ...errors, gender: undefined })
                        }
                      }}
                    >
                      <MenuItem value='MALE'>Nam</MenuItem>
                      <MenuItem value='FEMALE'>Nữ</MenuItem>
                      <MenuItem value='UNISEX'>Unisex</MenuItem>
                    </Select>
                    {errors.gender && (
                      <Typography variant='caption' color='error' sx={{ mt: 0.5 }}>
                        {errors.gender}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={4}>
                  <FormControl fullWidth required error={!!errors.category_id}>
                    <InputLabel>Danh mục</InputLabel>
                    <Select
                      label='Danh mục'
                      value={product.category_id}
                      onChange={e => {
                        setProduct({ ...product, category_id: e.target.value })
                        if (errors.category_id) {
                          setErrors({ ...errors, category_id: undefined })
                        }
                      }}
                    >
                      {categories.map(c => (
                        <MenuItem key={c.id} value={c.id}>
                          {c.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.category_id && (
                      <Typography variant='caption' color='error' sx={{ mt: 0.5 }}>
                        {errors.category_id}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={4}>
                  <FormControl fullWidth required error={!!errors.brand_id}>
                    <InputLabel>Thương hiệu</InputLabel>
                    <Select
                      label='Thương hiệu'
                      value={product.brand_id}
                      onChange={e => {
                        setProduct({ ...product, brand_id: e.target.value })
                        if (errors.brand_id) {
                          setErrors({ ...errors, brand_id: undefined })
                        }
                      }}
                    >
                      {brands.map(b => (
                        <MenuItem key={b.id} value={b.id}>
                          {b.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.brand_id && (
                      <Typography variant='caption' color='error' sx={{ mt: 0.5 }}>
                        {errors.brand_id}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Typography variant='subtitle2' sx={{ fontWeight: 'bold' }}>
                      Ảnh đại diện
                    </Typography>
                    {errors.thumbnail && (
                      <Typography variant='caption' color='error'>
                        {errors.thumbnail}
                      </Typography>
                    )}

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Button
                        variant='outlined'
                        startIcon={<CloudUploadIcon />}
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                      >
                        Chọn ảnh
                      </Button>

                      {product.thumbnail && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box
                            component='img'
                            src={product.thumbnail}
                            sx={{
                              width: 60,
                              height: 60,
                              objectFit: 'cover',
                              borderRadius: 1,
                              border: '1px solid #ccc'
                            }}
                          />
                          <IconButton
                            size='small'
                            color='error'
                            onClick={() => setProduct({ ...product, thumbnail: '' })}
                          >
                            <CloseIcon />
                          </IconButton>
                        </Box>
                      )}
                    </Box>

                    {isUploading && (
                      <Box sx={{ width: '100%' }}>
                        <LinearProgress variant='determinate' value={uploadProgress} />
                        <Typography variant='caption' sx={{ mt: 1 }}>
                          Đang upload... {uploadProgress}%
                        </Typography>
                      </Box>
                    )}

                    {error && (
                      <Alert severity='error' sx={{ mt: 1 }}>
                        {error}
                      </Alert>
                    )}

                    <input
                      ref={fileInputRef}
                      type='file'
                      accept='image/*'
                      style={{ display: 'none' }}
                      onChange={async e => {
                        const file = e.target.files?.[0]
                        if (file) {
                          try {
                            const response = await uploadFile(file)
                            console.log('Upload success:', response)

                            const imageUrl = response.data?.url || URL.createObjectURL(file)
                            setProduct({ ...product, thumbnail: imageUrl })
                          } catch (error) {
                            console.error('Upload failed:', error)
                          }
                        }
                      }}
                    />
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Typography variant='subtitle2' sx={{ fontWeight: 'bold' }}>
                      Ảnh slider
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Button
                        variant='outlined'
                        startIcon={<CloudUploadIcon />}
                        onClick={() => sliderFileInputRef.current?.click()}
                        disabled={isUploading}
                      >
                        Chọn nhiều ảnh
                      </Button>
                    </Box>

                    {product.slider && (
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {product.slider.split(',').map((url, index) => (
                          <Box key={index} sx={{ position: 'relative' }}>
                            <Box
                              component='img'
                              src={url.trim()}
                              sx={{
                                width: 60,
                                height: 60,
                                objectFit: 'cover',
                                borderRadius: 1,
                                border: '1px solid #ccc'
                              }}
                            />
                            <IconButton
                              size='small'
                              color='error'
                              sx={{
                                position: 'absolute',
                                top: -8,
                                right: -8,
                                backgroundColor: 'error.main',
                                color: 'white',
                                '&:hover': {
                                  backgroundColor: 'error.dark'
                                }
                              }}
                              onClick={() => {
                                const urls = product.slider.split(',').filter((_, i) => i !== index)
                                setProduct({ ...product, slider: urls.join(',') })
                              }}
                            >
                              <CloseIcon fontSize='small' />
                            </IconButton>
                          </Box>
                        ))}
                      </Box>
                    )}

                    <input
                      ref={sliderFileInputRef}
                      type='file'
                      accept='image/*'
                      multiple
                      style={{ display: 'none' }}
                      onChange={async e => {
                        const files = Array.from(e.target.files || [])
                        if (files.length > 0) {
                          try {
                            const response = await uploadMultipleFiles(files)
                            console.log('Multiple upload success:', response)

                            const urls = response.data?.urls || []
                            const currentUrls = product.slider ? product.slider.split(',') : []
                            setProduct({
                              ...product,
                              slider: [...currentUrls, ...urls].join(',')
                            })
                          } catch (error) {
                            console.error('Upload failed:', error)
                          }
                        }
                      }}
                    />
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label='Số lượng đã bán'
                    type='number'
                    fullWidth
                    required
                    InputProps={{ inputProps: { min: 0 } }}
                    value={product.sold}
                    onChange={e => {
                      setProduct({ ...product, sold: e.target.value })
                      if (errors.sold) {
                        setErrors({ ...errors, sold: undefined })
                      }
                    }}
                    error={!!errors.sold}
                    helperText={errors.sold}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={product.status}
                        onChange={e => setProduct({ ...product, status: e.target.checked })}
                      />
                    }
                    label='Trạng thái hoạt động'
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant='h6' sx={{ fontWeight: 'bold', color: '#1976D2' }}>
                  Mã màu & Tồn kho
                </Typography>
                <Button startIcon={<AddIcon />} variant='contained' size='small' onClick={handleAddVariant}>
                  Thêm màu mới
                </Button>
              </Box>
              {errors.variants && (
                <Typography variant='caption' color='error' sx={{ display: 'block', mb: 2 }}>
                  {errors.variants}
                </Typography>
              )}

              {variants.map((variant, index) => (
                <Card key={index} sx={{ mb: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant='h6' sx={{ color: '#607D8B' }}>
                        Màu #{index + 1}
                      </Typography>
                      {variants.length > 1 && (
                        <IconButton
                          color='error'
                          size='small'
                          sx={{ border: '1px solid', borderColor: '#D32F2F' }}
                          onClick={() => {
                            const updated = variants.filter((_, i) => i !== index)
                            setVariants(updated)
                          }}
                        >
                          <CloseIcon />
                        </IconButton>
                      )}
                    </Box>

                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <TextField
                            label='Mã màu HEX để hiển thị'
                            fullWidth
                            required
                            disabled
                            placeholder='#000000'
                            value={variant.hex_code}
                            onChange={e => {
                              const updated = [...variants]
                              updated[index].hex_code = e.target.value
                              setVariants(updated)
                            }}
                          />

                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant='subtitle2' sx={{ fontWeight: 'bold' }}>
                              Màu hiển thị:
                            </Typography>
                            <Box
                              sx={{
                                width: 40,
                                height: 40,
                                backgroundColor: getSafeColor(variant.hex_code),
                                border: '2px solid #ccc',
                                borderRadius: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            />
                          </Box>

                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant='subtitle2' sx={{ fontWeight: 'bold' }}>
                              Nhập mã màu nhanh:
                            </Typography>
                            <TextField
                              size='small'
                              placeholder='#FFFFFF'
                              sx={{ width: 120 }}
                              onKeyPress={e => {
                                if (e.key === 'Enter') {
                                  const input = e.target as HTMLInputElement
                                  const newColor = input.value.trim()
                                  if (isValidHexColor(newColor)) {
                                    const updated = [...variants]
                                    updated[index].hex_code = newColor
                                    setVariants(updated)
                                    input.value = ''
                                  }
                                }
                              }}
                            />
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>

                    <Box sx={{ mt: 3 }}>
                      <Typography variant='subtitle2' sx={{ fontWeight: 'bold', mb: 2 }}>
                        Quản lý tồn kho theo size
                      </Typography>

                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {variant.inventory.map((item, itemIndex) => (
                          <Box key={itemIndex} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Chip
                              label={item.size}
                              size='small'
                              sx={{
                                backgroundColor: 'primary.main',
                                color: 'white',
                                minWidth: 60
                              }}
                            />
                            <TextField
                              size='small'
                              type='number'
                              label='Số lượng'
                              value={item.quantity}
                              onChange={e => {
                                const updated = [...variants]
                                updated[index].inventory[itemIndex].quantity = parseInt(e.target.value) || 0
                                setVariants(updated)
                              }}
                              InputProps={{ inputProps: { min: 0 } }}
                              sx={{ width: 120 }}
                            />
                            <IconButton
                              size='small'
                              color='error'
                              onClick={() => {
                                if (variant.inventory.length > 1) {
                                  const updated = [...variants]
                                  updated[index].inventory = variant.inventory.filter((_, i) => i !== itemIndex)
                                  setVariants(updated)
                                }
                              }}
                            >
                              <CloseIcon />
                            </IconButton>
                          </Box>
                        ))}

                        <Button
                          size='small'
                          variant='outlined'
                          startIcon={<AddIcon />}
                          onClick={() => {
                            const newSize = prompt('Nhập kích thước mới:')
                            if (newSize && newSize.trim()) {
                              const updated = [...variants]
                              const existingSizes = updated[index].inventory.map(item => item.size)
                              if (!existingSizes.includes(newSize.trim())) {
                                updated[index].inventory.push({
                                  size: newSize.trim(),
                                  quantity: 0
                                })
                                setVariants(updated)
                              }
                            }
                          }}
                        >
                          Thêm size
                        </Button>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={onClose} variant='outlined' disabled={loading}>
            Hủy
          </Button>
          <Button onClick={handleAddProduct} variant='contained' color='primary' disabled={loading}>
            {loading ? 'Đang lưu...' : 'Lưu sản phẩm'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default AddProductModal
