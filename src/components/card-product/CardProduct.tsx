import { Box, Button, Card, CardContent, CardMedia, styled, Typography, useTheme, Chip, Stack } from '@mui/material'
import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'
import IconifyIcon from 'src/components/Icon'
import { ROUTE_CONFIG } from 'src/configs/route'
import { TProduct } from 'src/types/product'
// removed old user interaction API; detail tracking handled in detail page
import { useAuth } from 'src/hooks/useAuth'
import { useFormatPrice } from 'src/utils/formatNumber'

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: 10,
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.mode === 'light' ? theme.palette.grey[300] : theme.palette.grey[700]}`,
  boxShadow: 'none',
  transition: 'border-color 0.2s ease',
  '&:hover': {
    borderColor: theme.palette.mode === 'light' ? theme.palette.grey[400] : theme.palette.grey[600]
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
  const formattedPrice = useFormatPrice(item?.price || 0)

  const handleNavigateDetailProduct = (id: string) => {
    router.push(`${ROUTE_CONFIG.PRODUCT}/${id}`)
  }

  // Removed Buy Now modal; direct navigation is used instead

  return (
    <StyledCard onClick={() => handleNavigateDetailProduct(item?.id)} sx={{ cursor: 'pointer' }}>
      <CardMedia
        component='img'
        height='200'
        image={item?.thumbnail || '/placeholder-product.jpg'}
        alt={item?.name || 'Product image'}
        sx={{
          borderRadius: '8px 8px 0 0',
          objectFit: 'cover',
          filter: 'none'
        }}
      />

      <CardContent
        sx={{
          padding: '16px',
          backgroundColor: 'transparent',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}
      >
        <Box>
          <Typography
            variant='h6'
            sx={{
              color: theme.palette.text.primary,
              fontWeight: 700,
              fontSize: '1.125rem',
              mb: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              minHeight: '2.4em',
              cursor: 'inherit'
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
              {formattedPrice} VND
            </Typography>
          </Box>

          {/* Extra watch details */}
          <Stack spacing={0.5} sx={{ mb: 1.5 }}>
            {!!(item as any)?.model && (
              <Typography variant='caption' color='text.secondary'>
                Model: <b>{(item as any).model}</b>
              </Typography>
            )}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {!!(item as any)?.case_material && (
                <Chip size='small' variant='outlined' label={`Vỏ: ${(item as any).case_material}`} />
              )}
              {!!(item as any)?.case_size && (
                <Chip size='small' variant='outlined' label={`Size: ${(item as any).case_size}mm`} />
              )}
              {!!(item as any)?.strap_size && (
                <Chip size='small' variant='outlined' label={`Dây: ${(item as any).strap_size}mm`} />
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {!!(item as any)?.water_resistance && (
                <Chip
                  size='small'
                  color='info'
                  variant='outlined'
                  label={`Chống nước: ${(item as any).water_resistance}`}
                />
              )}
              {((item as any)?.gender === '0' || (item as any)?.gender === '1') && (
                <Chip
                  size='small'
                  color='default'
                  variant='outlined'
                  label={`Giới tính: ${(item as any).gender === '1' ? 'Nữ' : 'Nam'}`}
                />
              )}
            </Box>
          </Stack>
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
              variant='contained'
              onClick={() => handleNavigateDetailProduct(item?.id)}
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
              <IconifyIcon icon='mdi:eye-outline' fontSize={18} />
              Xem chi tiết
            </Button>
          </Box>
        </Box>
      </CardContent>
    </StyledCard>
  )
}

export default CardProduct
