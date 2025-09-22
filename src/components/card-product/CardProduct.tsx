import { Box, Button, Card, CardContent, CardMedia, styled, Typography, useTheme } from '@mui/material'
import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'
import IconifyIcon from 'src/components/Icon'
import { ROUTE_CONFIG } from 'src/configs/route'
import { TProduct } from 'src/types/product'
import AddToCartModal from './AddToCartModal'
import BuyNowModal from './BuyNowModal'
import { useState } from 'react'
import { createUserInteraction } from 'src/services/userInteraction'
import { useAuth } from 'src/hooks/useAuth'

const StyledCard = styled(Card)(({}) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: 10,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)'
  }
}))

interface TCardProduct {
  item: TProduct
}

const CardProduct = (props: TCardProduct) => {
  const item = props?.item
  const { t } = useTranslation()
  const theme = useTheme()
  const router = useRouter()
  const { user } = useAuth()
  const [addToCartModalOpen, setAddToCartModalOpen] = useState(false)
  const [buyNowModalOpen, setBuyNowModalOpen] = useState(false)

  const handleNavigateDetailProduct = (id: string) => {
    if (user && user.id) {
      handleCreateUserInteraction()
    }

    router.push(`${ROUTE_CONFIG.PRODUCT}/${id}`)
  }

  const handleCreateUserInteraction = async () => {
    const response = await createUserInteraction({
      product_id: item?.id || '',
      interaction_type: 1
    })

    if (response.status == 'success') {
      console.log('User interaction created successfully:', response.data)
    }
  }

  const handleAddToCart = () => {
    setAddToCartModalOpen(true)
  }

  const handleCloseAddToCartModal = () => {
    setAddToCartModalOpen(false)
  }

  const handleBuyNow = () => {
    setBuyNowModalOpen(true)
  }

  const handleCloseBuyNowModal = () => {
    setBuyNowModalOpen(false)
  }

  return (
    <StyledCard>
      <CardMedia
        component='img'
        height='200'
        image={item?.thumbnail || '/placeholder-product.jpg'}
        alt={item?.name || 'Product image'}
        sx={{
          borderRadius: '8px 8px 0 0',
          objectFit: 'cover',
          filter: 'brightness(95%)',
          '&:hover': {
            filter: 'brightness(90%)'
          }
        }}
      />

      <CardContent
        sx={{
          padding: '16px',
          backgroundColor: '#f9f9f9',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}
      >
        <Box>
          <Typography
            onClick={() => {
              handleNavigateDetailProduct(item?.id)
            }}
            variant='h6'
            sx={{
              color: theme.palette.primary.main,
              fontWeight: 'bold',
              fontSize: '1.1rem',
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              minHeight: '2.4em',
              cursor: 'pointer'
            }}
          >
            {item?.name || 'Tên sản phẩm'}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Typography
              variant='body2'
              sx={{
                fontWeight: 'bold',
                textDecoration: 'line-through',
                color: theme.palette.error.main,
                fontSize: '12px'
              }}
            >
              500.000 VND
            </Typography>
            <Typography
              variant='h6'
              sx={{
                color: theme.palette.primary.main,
                fontWeight: 'bold',
                fontSize: '16px'
              }}
            >
              {item?.price ? `${item.price.toLocaleString()} VND` : '0 VNĐ'}
            </Typography>
          </Box>
        </Box>

        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant='body2' color='text.secondary' sx={{ fontStyle: 'italic', fontSize: '12px' }}>
              Đã bán: <b>{item?.sold || 0}</b>
            </Typography>
            <Typography
              sx={{ display: 'flex', alignItems: 'center', color: theme.palette.warning.main, fontSize: '12px' }}
            >
              <b>{item?.rating || 5}</b>
              <IconifyIcon icon='emojione:star' fontSize={14} />
            </Typography>
          </Box>

          <Box
            sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column', gap: '4px', padding: '0 12px 10px' }}
          >
            <Button
              fullWidth
              variant='outlined'
              onClick={handleAddToCart}
              sx={{
                height: 36,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontWeight: 'bold',
                fontSize: '12px',
                '&:hover': {
                  backgroundColor: theme.palette.customColors.avatarBg,
                  transform: 'translateY(-1px)'
                },
                transition: 'all 0.3s ease-in-out'
              }}
            >
              <IconifyIcon icon='mdi:cart' fontSize={18} />
              {t('add-to-cart')}
            </Button>
            <Button
              fullWidth
              variant='contained'
              onClick={handleBuyNow}
              sx={{
                height: 36,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontWeight: 'bold',
                fontSize: '12px',
                backgroundColor: theme.palette.primary.dark,
                '&:hover': {
                  backgroundColor: theme.palette.primary.main,
                  transform: 'translateY(-1px)'
                },
                transition: 'all 0.3s ease-in-out'
              }}
            >
              <IconifyIcon icon='icon-park-outline:buy' fontSize={18} />
              {t('buy-now')}
            </Button>
          </Box>
        </Box>
      </CardContent>

      {/* Add to Cart Modal */}
      <AddToCartModal
        open={addToCartModalOpen}
        onClose={handleCloseAddToCartModal}
        productId={item?.id || ''}
        productName={item?.name || ''}
        productPrice={item?.price || 0}
        productThumbnail={item?.thumbnail || ''}
      />

      {/* Buy Now Modal */}
      <BuyNowModal
        open={buyNowModalOpen}
        onClose={handleCloseBuyNowModal}
        productId={item?.id || ''}
        productName={item?.name || ''}
        productPrice={item?.price || 0}
        productThumbnail={item?.thumbnail || ''}
      />
    </StyledCard>
  )
}

export default CardProduct
