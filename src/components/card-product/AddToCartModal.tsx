import CloseIcon from '@mui/icons-material/Close'
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getDetailsProductPublic } from 'src/services/product'
import { AppDispatch, RootState } from 'src/stores'
import { resetCart } from 'src/stores/apps/cart'
import { addToCartAsync } from 'src/stores/apps/cart/action'
import { TProductDetail } from 'src/types/product'

interface AddToCartModalProps {
  open: boolean
  onClose: () => void
  productId: string
  productName: string
  productPrice: number
  productThumbnail: string
}

interface TVariant {
  colorId: string
  hex_code: string
  color_name: string
  inventory: Array<{
    size: string
    sizeId: string
    quantity: number
  }>
}

const AddToCartModal = ({
  open,
  onClose,
  productId,
  productName,
  productPrice,
  productThumbnail
}: AddToCartModalProps) => {
  const [productDetail, setProductDetail] = useState<TProductDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedColor, setSelectedColor] = useState<string>('')
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [quantity, setQuantity] = useState<number>(1)
  const [variants, setVariants] = useState<TVariant[]>([])
  const dispatch: AppDispatch = useDispatch()
  const { isLoading, isSuccess, isError, message } = useSelector((state: RootState) => state.cart)

  // Fetch product detail when modal opens
  useEffect(() => {
    if (open && productId) {
      fetchProductDetail()
    }
  }, [open, productId])

  const fetchProductDetail = async () => {
    setLoading(true)
    try {
      const response = await getDetailsProductPublic(productId)
      if (response.status === 'success') {
        setProductDetail(response.data)

        // Transform variants data
        const transformedVariants: TVariant[] = []
        if (response.data.variants) {
          const colorMap = new Map()

          response.data.variants.forEach((variant: any) => {
            const colorKey = variant.colorId
            if (!colorMap.has(colorKey)) {
              colorMap.set(colorKey, {
                colorId: variant.colorId,
                hex_code: variant.color.hex_code,
                color_name: variant.color.name,
                inventory: []
              })
            }

            colorMap.get(colorKey).inventory.push({
              size: variant.size.name,
              sizeId: variant.sizeId,
              quantity: variant.stock
            })
          })

          transformedVariants.push(...Array.from(colorMap.values()))
        }

        setVariants(transformedVariants)

        // Set first color as default if available
        if (transformedVariants.length > 0) {
          setSelectedColor(transformedVariants[0].colorId)
        }
      }
    } catch (error) {
      console.error('Error fetching product detail:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleColorChange = (color: string) => {
    setSelectedColor(color)
    setSelectedSize('') // Reset size when color changes
  }

  const handleSizeChange = (size: string) => {
    setSelectedSize(size)
  }

  const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value)
    if (value > 0) {
      setQuantity(value)
    }
  }

  const getAvailableSizes = () => {
    const selectedVariant = variants.find(v => v.colorId === selectedColor)

    return selectedVariant?.inventory.filter(item => item.quantity > 0) || []
  }

  //   const handleAddToCart = () => {
  //     if (!selectedColor || !selectedSize) {
  //       return
  //     }

  //     // TODO: Implement add to cart logic here
  //     console.log('Adding to cart:', {
  //       productId,
  //       color: selectedColor,
  //       size: selectedSize,
  //       quantity
  //     })

  //     onClose()
  //   }

  const handleAddToCart = () => {
    dispatch(
      addToCartAsync({
        product_id: productId || '',
        size_id: selectedSize,
        color_id: selectedColor || '',
        quantity: quantity
      })
    )
  }

  useEffect(() => {
    if (message) {
      console.log('message', message)
      onClose()
    }
    dispatch(resetCart())
  }, [isSuccess, isError, message])

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='sm'
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

      <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.5rem', pr: 6 }}>Chọn size và màu sắc</DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box>
            {/* Product Info */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <img
                src={productThumbnail}
                alt={productName}
                style={{
                  width: 80,
                  height: 80,
                  objectFit: 'cover',
                  borderRadius: 8
                }}
              />
              <Box>
                <Typography variant='h6' sx={{ fontWeight: 'bold', mb: 1 }}>
                  {productName}
                </Typography>
                <Typography variant='h6' color='primary' sx={{ fontWeight: 'bold' }}>
                  {productPrice.toLocaleString()} VND
                </Typography>
              </Box>
            </Box>

            {/* Color Selection */}
            <Box sx={{ mb: 3 }}>
              <Typography variant='subtitle1' sx={{ fontWeight: 'bold', mb: 2 }}>
                Chọn màu sắc:
              </Typography>
              <Grid container spacing={1}>
                {variants.map(variant => (
                  <Grid item key={variant.colorId}>
                    <Tooltip title={variant.color_name} arrow>
                      <Box
                        onClick={() => handleColorChange(variant.colorId)}
                        sx={{
                          width: 60,
                          height: 40,
                          backgroundColor: variant.hex_code,
                          borderRadius: 1,
                          border: selectedColor === variant.colorId ? '3px solid' : '2px solid',
                          borderColor: selectedColor === variant.colorId ? 'primary.main' : 'grey.300',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            transform: 'scale(1.05)',
                            borderColor: 'primary.main'
                          }
                        }}
                      ></Box>
                    </Tooltip>
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* Size Selection */}
            {selectedColor && (
              <Box sx={{ mb: 3 }}>
                <Typography variant='subtitle1' sx={{ fontWeight: 'bold', mb: 2 }}>
                  Chọn size:
                </Typography>
                <FormControl fullWidth>
                  <InputLabel>Size</InputLabel>
                  <Select value={selectedSize} onChange={e => handleSizeChange(e.target.value)} label='Size'>
                    {getAvailableSizes().map(item => (
                      <MenuItem key={item.sizeId} value={item.sizeId}>
                        {item.size} (Còn {item.quantity})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            )}

            {/* Quantity Selection */}
            <Box sx={{ mb: 3 }}>
              <Typography variant='subtitle1' sx={{ fontWeight: 'bold', mb: 2 }}>
                Số lượng:
              </Typography>
              <TextField
                type='number'
                value={quantity}
                onChange={handleQuantityChange}
                inputProps={{ min: 1, max: 99 }}
                sx={{ width: 120 }}
                size='small'
              />
            </Box>

            {/* Summary */}
            {selectedColor && selectedSize && (
              <Box sx={{ p: 2, bgcolor: 'primary.light', borderRadius: 1, color: 'white' }}>
                <Typography variant='subtitle2' sx={{ fontWeight: 'bold' }}>
                  Đã chọn: {variants.find(v => v.colorId === selectedColor)?.color_name} - Size{' '}
                  {
                    variants.find(v => v.colorId === selectedColor)?.inventory.find(i => i.sizeId === selectedSize)
                      ?.size
                  }{' '}
                  - Số lượng: {quantity}
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} variant='outlined'>
          Hủy
        </Button>
        <Button
          onClick={handleAddToCart}
          variant='contained'
          disabled={!selectedColor || !selectedSize || quantity < 1 || loading}
        >
          Thêm vào giỏ hàng
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AddToCartModal
