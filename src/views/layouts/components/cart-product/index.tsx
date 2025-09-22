// ** Mui Imports
import { Badge } from '@mui/material'
import { Icon } from '@iconify/react'
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
          <IconButton onClick={handleNavigateCart} size='small' sx={{ ml: 2 }} color='inherit'>
            <Badge color='primary' badgeContent={items.length || 0}>
              <Icon icon='material-symbols:shopping-cart' />
            </Badge>
          </IconButton>
        </Tooltip>
      </Box>
    </React.Fragment>
  )
}

export default CartProduct
