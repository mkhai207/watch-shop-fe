import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  IconButton,
  Tooltip,
  TextField
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { getDetailsProductPublic, getVariantId } from 'src/services/product'
import { useRouter } from 'next/router'
import { ROUTE_CONFIG } from 'src/configs/route'
import { useAuth } from 'src/hooks/useAuth'

interface BuyNowModalProps {
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

const BuyNowModal = ({ open, onClose, productId, productName, productPrice, productThumbnail }: BuyNowModalProps) => {
  const [loading, setLoading] = useState(false)
  const [selectedColor, setSelectedColor] = useState<string>('')
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [quantity, setQuantity] = useState<number>(1)
  const [variants, setVariants] = useState<TVariant[]>([])
  const router = useRouter()
  const { user } = useAuth()

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
    const maxQuantity = selectedColor && selectedSize ? getSelectedSizeQuantity() : 99

    if (value > 0 && value <= maxQuantity) {
      setQuantity(value)
    }
  }

  const getAvailableSizes = () => {
    const selectedVariant = variants.find(v => v.colorId === selectedColor)

    return selectedVariant?.inventory.filter(item => item.quantity > 0) || []
  }

  const getSelectedSizeQuantity = () => {
    if (!selectedColor || !selectedSize) return 0

    const selectedVariant = variants.find(v => v.colorId === selectedColor)
    const selectedSizeItem = selectedVariant?.inventory.find(item => item.sizeId === selectedSize)

    return selectedSizeItem?.quantity || 0
  }

  const handleBuyNow = async () => {
    // Require login before buy-now to avoid invalid checkout data when token is missing
    if (!user?.id) {
      router.push({
        pathname: '/login',
        query: { returnUrl: router.asPath }
      })

      return
    }

    if (!selectedColor || !selectedSize) {
      return
    }

    try {
      const variantResponse = await getVariantId(productId, selectedColor, selectedSize)

      if (variantResponse.status === 'success' && variantResponse.data) {
        const buyNowData = {
          product_id: productId,
          color_id: selectedColor,
          size_id: selectedSize,
          quantity: quantity,
          product_name: productName,
          product_price: productPrice,
          product_thumbnail: productThumbnail,
          color_name: variants.find(v => v.colorId === selectedColor)?.color_name,
          size_name: variants.find(v => v.colorId === selectedColor)?.inventory.find(i => i.sizeId === selectedSize)
            ?.size,
          product_variant_id: variantResponse.data.variantId
        }
        localStorage.setItem('buyNowItems', JSON.stringify([buyNowData]))

        router.push(ROUTE_CONFIG.CHECKOUT)

        onClose()
      } else {
        console.error('Error getting variant ID:', variantResponse)
      }
    } catch (error) {
      console.error('Error in handleBuyNow:', error)
    }
  }

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

      <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.5rem', pr: 6 }}>Mua ngay</DialogTitle>

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
              <Box sx={{ flex: 1 }}>
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
                inputProps={{ min: 1, max: selectedColor && selectedSize ? getSelectedSizeQuantity() : 99 }}
                sx={{ width: 120 }}
                size='small'
              />
              {selectedColor && selectedSize && (
                <Typography variant='caption' color='text.secondary' sx={{ mt: 1, display: 'block' }}>
                  Còn lại: {getSelectedSizeQuantity()} sản phẩm
                </Typography>
              )}
            </Box>

            {/* Price Summary */}
            <Box sx={{ mb: 3, p: 2, border: '1px solid', borderColor: 'grey.300', borderRadius: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant='body2' color='text.secondary'>
                  Giá đơn vị:
                </Typography>
                <Typography variant='body2' sx={{ fontWeight: 'bold' }}>
                  {productPrice.toLocaleString()} VND
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant='body2' color='text.secondary'>
                  Số lượng:
                </Typography>
                <Typography variant='body2' sx={{ fontWeight: 'bold' }}>
                  {quantity}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderTop: '1px solid',
                  borderColor: 'grey.300',
                  pt: 1
                }}
              >
                <Typography variant='subtitle1' sx={{ fontWeight: 'bold' }}>
                  Tổng tiền:
                </Typography>
                <Typography variant='h6' color='primary' sx={{ fontWeight: 'bold' }}>
                  {(productPrice * quantity).toLocaleString()} VND
                </Typography>
              </Box>
            </Box>

            {/* Summary */}
            {selectedColor && selectedSize && (
              <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 1, color: 'white' }}>
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
          onClick={handleBuyNow}
          variant='contained'
          disabled={!selectedColor || !selectedSize || quantity < 1 || loading}
        >
          Mua ngay
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default BuyNowModal
