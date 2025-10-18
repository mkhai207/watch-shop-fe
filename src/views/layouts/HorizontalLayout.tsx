import { Box, Button, Typography } from '@mui/material'
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar'
import IconButton from '@mui/material/IconButton'
import { styled } from '@mui/material/styles'
import Toolbar from '@mui/material/Toolbar'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import IconifyIcon from 'src/components/Icon'
import InputSearch from 'src/components/input-search'
import { ROUTE_CONFIG } from 'src/configs/route'
import { useAuth } from 'src/hooks/useAuth'
import UserDropdown from 'src/views/layouts/components/user-dropdown'
import CartProduct from './components/cart-product'
import NavItem from './components/horizontal-layout-item'
import LanguageDropDown from './components/language-dropdown'
import ModeToggle from './components/mode-toggle'
import { useFilter } from 'src/contexts/FilterContext'

const drawerWidth: number = 240

interface AppBarProps extends MuiAppBarProps {
  open?: boolean
}

type TProps = {
  open: boolean
  toggleDrawer: () => void
  isHideMenu?: boolean
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: prop => prop !== 'open'
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  backgroundColor:
    theme.palette.mode === 'light' ? theme.palette.customColors.lightPaperBg : theme.palette.customColors.darkPaperBg,
  color: theme.palette.primary.main,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  })
}))

const HorizontalLayout: NextPage<TProps> = ({ open, toggleDrawer, isHideMenu }) => {
  const { user } = useAuth()
  const router = useRouter()

  const { filters, updateSearch } = useFilter()

  const handleSearch = (value: string) => {
    updateSearch(value)
    const location = router.pathname
    if (location !== ROUTE_CONFIG.PRODUCT) {
      router.push(ROUTE_CONFIG.PRODUCT)
    }
  }

  const handleNavigateHome = () => {
    router.push('/')
  }

  return (
    <AppBar position='absolute' open={open}>
      <Toolbar
        sx={{
          pr: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {!isHideMenu && (
            <IconButton
              edge='start'
              color='inherit'
              aria-label='open drawer'
              onClick={toggleDrawer}
              sx={{
                padding: '20px',
                marginRight: '36px',
                ...(open && { display: 'none' })
              }}
            >
              <IconifyIcon icon='material-symbols:menu' />
            </IconButton>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={handleNavigateHome}>
            <Typography variant='h4' sx={{ fontSize: '24px', fontWeight: 'bold', color: 'inherit' }}>
              Fashion Shop
            </Typography>
          </Box>
        </Box>

        <Box>
          <NavItem />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <InputSearch value='' onChange={handleSearch} expandable={true} textColor='black' />
          <LanguageDropDown />
          <ModeToggle />
          <CartProduct />
          {user ? (
            <UserDropdown />
          ) : (
            <Button
              variant='contained'
              color='primary'
              sx={{ ml: 2 }}
              onClick={() => {
                router.push(ROUTE_CONFIG.LOGIN)
              }}
            >
              Sign In
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default HorizontalLayout
