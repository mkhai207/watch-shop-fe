// ** Mui Imports
import { Badge } from '@mui/material'
import { ShoppingCart } from '@mui/icons-material'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/router'
import { ROUTE_CONFIG } from 'src/configs/route'
import { RootState } from 'src/stores'
import { useSelector } from 'react-redux'

const CartProduct = () => {
  const { t } = useTranslation()
  const router = useRouter()

  const { items } = useSelector((state: RootState) => state.cart)

  const handleNavigateCart = () => {
    router.push(ROUTE_CONFIG.CART)
  }

  return (
    <React.Fragment>
      <Box sx={{ display: 'flex', alignItems: 'center', textAlign: 'center' }}>
        <Tooltip title={t('cart')}>
          <IconButton
            onClick={handleNavigateCart}
            size='medium'
            sx={{
              width: 40,
              height: 40,
              color: 'text.primary',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '50%',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
                borderColor: 'primary.main'
              }
            }}
          >
            <Badge
              color='error'
              badgeContent={items.length || 0}
              sx={{
                '& .MuiBadge-badge': {
                  backgroundColor: '#d32f2f',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '0.75rem',
                  minWidth: '18px',
                  height: '18px'
                }
              }}
            >
              <ShoppingCart sx={{ fontSize: 20 }} />
            </Badge>
          </IconButton>
        </Tooltip>
      </Box>
    </React.Fragment>
  )
}

export default CartProduct
