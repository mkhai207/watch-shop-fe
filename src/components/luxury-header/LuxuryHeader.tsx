import React, { useState, useEffect } from 'react'
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useTheme,
  useMediaQuery,
  Avatar,
  Menu,
  MenuItem,
  Divider
} from '@mui/material'
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  ShoppingCart,
  Person,
  Search,
  Settings,
  LocalMall,
  Favorite,
  Logout,
  AdminPanelSettings
} from '@mui/icons-material'
import { useRouter } from 'next/router'
import { useAuth } from 'src/hooks/useAuth'
import CartProduct from 'src/views/layouts/components/cart-product'
import InputSearch from 'src/components/input-search'
import { ROUTE_CONFIG } from 'src/configs/route'
import { useFilter } from 'src/contexts/FilterContext'
import Image from 'next/image'

const LuxuryHeader: React.FC = () => {
  const theme = useTheme()
  const router = useRouter()
  const { user, logout } = useAuth()
  const { filters, updateSearch } = useFilter()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const [isLoaded, setIsLoaded] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

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

  const navigationItems = [
    { label: 'Sản phẩm', href: ROUTE_CONFIG.PRODUCT },
    { label: 'Thương hiệu', href: '/brands' },
    { label: 'Về chúng tôi', href: '/about' },
    { label: 'Liên hệ', href: '/contact' }
  ]

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const handleUserMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault()
    setUserMenuAnchor(event.currentTarget)
  }

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null)
  }

  const handleLogout = () => {
    handleUserMenuClose()
    logout()
  }

  return (
    <>
      <AppBar
        position='fixed'
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.3s ease'
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 4 } }}>
          {/* Logo */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              opacity: isLoaded ? 1 : 0,
              transform: isLoaded ? 'translateX(0)' : 'translateX(-50px)',
              transition: 'all 0.8s ease-out'
            }}
            onClick={handleNavigateHome}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                backgroundColor: 'primary.main',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 1
              }}
            >
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  border: '2px solid',
                  borderColor: 'primary.contrastText',
                  borderRadius: '50%'
                }}
              />
            </Box>
            <Typography
              variant='h5'
              sx={{
                fontWeight: 'bold',
                color: 'text.primary',
                fontSize: { xs: '1.2rem', md: '1.5rem' }
              }}
            >
              CHRONOS
            </Typography>
          </Box>

          {/* Desktop Navigation */}
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              gap: 4,
              opacity: isLoaded ? 1 : 0,
              transform: isLoaded ? 'translateY(0)' : 'translateY(-30px)',
              transition: 'all 0.8s ease-out 0.2s'
            }}
          >
            {navigationItems.map(item => (
              <Button
                key={item.label}
                onClick={() => router.push(item.href)}
                sx={{
                  color: 'text.primary',
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '1rem',
                  '&:hover': {
                    color: 'primary.light',
                    backgroundColor: 'transparent'
                  }
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>

          {/* Right side actions */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              opacity: isLoaded ? 1 : 0,
              transform: isLoaded ? 'translateX(0)' : 'translateX(50px)',
              transition: 'all 0.8s ease-out 0.4s'
            }}
          >
            {/* Search */}
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <InputSearch value={filters.search || ''} onChange={handleSearch} expandable={true} />
            </Box>

            {/* User Menu */}
            {user ? (
              <>
                <IconButton
                  onClick={handleUserMenuClick}
                  disableRipple
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
                    },
                    '&:focus': {
                      outline: 'none'
                    }
                  }}
                >
                  <Avatar sx={{ width: 24, height: 24 }}>
                    {user?.avatar ? (
                      <Image
                        src={user.avatar}
                        alt='User Avatar'
                        width={24}
                        height={24}
                        style={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <Person sx={{ fontSize: 18 }} />
                    )}
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={userMenuAnchor}
                  open={Boolean(userMenuAnchor)}
                  onClose={handleUserMenuClose}
                  disableScrollLock={true}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right'
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right'
                  }}
                  sx={{
                    '& .MuiPaper-root': {
                      mt: 1,
                      minWidth: 200,
                      borderRadius: 2,
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                      maxHeight: 'calc(100vh - 100px)',
                      overflow: 'auto'
                    }
                  }}
                >
                  <Box sx={{ px: 2, py: 1.5 }}>
                    <Typography variant='subtitle2' fontWeight='600'>
                      {user.fullName || user.email}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      {user.role?.name}
                    </Typography>
                  </Box>
                  <Divider />
                  {/* Admin Management Option */}
                  {user?.role?.code === 'ADMIN' && (
                    <>
                      <MenuItem
                        onClick={e => {
                          e.preventDefault()
                          router.push('/manage-system/dashboard')
                          handleUserMenuClose()
                        }}
                        sx={{ py: 1.5, backgroundColor: 'primary.light', color: 'primary.contrastText' }}
                      >
                        <AdminPanelSettings sx={{ mr: 2, fontSize: 20 }} />
                        Quản trị hệ thống
                      </MenuItem>
                      <Divider />
                    </>
                  )}
                  <MenuItem
                    onClick={e => {
                      e.preventDefault()
                      router.push('/my-profile')
                      handleUserMenuClose()
                    }}
                    sx={{ py: 1.5 }}
                  >
                    <Person sx={{ mr: 2, fontSize: 20 }} />
                    Tài khoản
                  </MenuItem>
                  <MenuItem
                    onClick={e => {
                      e.preventDefault()
                      router.push(ROUTE_CONFIG.ORDER_HISTORY)
                      handleUserMenuClose()
                    }}
                    sx={{ py: 1.5 }}
                  >
                    <LocalMall sx={{ mr: 2, fontSize: 20 }} />
                    Đơn hàng
                  </MenuItem>
                  <MenuItem
                    onClick={e => {
                      e.preventDefault()
                      router.push('/wishlist')
                      handleUserMenuClose()
                    }}
                    sx={{ py: 1.5 }}
                  >
                    <Favorite sx={{ mr: 2, fontSize: 20 }} />
                    Yêu thích
                  </MenuItem>
                  <MenuItem
                    onClick={e => {
                      e.preventDefault()
                      router.push('/settings')
                      handleUserMenuClose()
                    }}
                    sx={{ py: 1.5 }}
                  >
                    <Settings sx={{ mr: 2, fontSize: 20 }} />
                    Cài đặt
                  </MenuItem>
                  <Divider />
                  <MenuItem
                    onClick={e => {
                      e.preventDefault()
                      handleLogout()
                    }}
                    sx={{ py: 1.5 }}
                  >
                    <Logout sx={{ mr: 2, fontSize: 20 }} />
                    Đăng xuất
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Button
                variant='text'
                onClick={() => router.push(ROUTE_CONFIG.LOGIN)}
                sx={{
                  color: 'text.primary',
                  textTransform: 'none',
                  fontWeight: 500,
                  '&:hover': {
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText'
                  }
                }}
              >
                Đăng nhập
              </Button>
            )}

            {/* Cart */}
            <CartProduct />

            {/* Mobile Menu Button */}
            <IconButton
              onClick={toggleMenu}
              size='medium'
              sx={{
                display: { xs: 'block', md: 'none' },
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
              {isMenuOpen ? <CloseIcon sx={{ fontSize: 20 }} /> : <MenuIcon sx={{ fontSize: 20 }} />}
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Menu Drawer */}
      <Drawer
        anchor='right'
        open={isMenuOpen}
        onClose={toggleMenu}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: 280,
            backgroundColor: 'background.paper',
            borderLeft: '1px solid',
            borderColor: 'divider'
          }
        }}
      >
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant='h6' fontWeight='bold'>
              Menu
            </Typography>
            <IconButton onClick={toggleMenu}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Mobile Search */}
          <Box sx={{ mb: 3 }}>
            <InputSearch value={filters.search || ''} onChange={handleSearch} expandable={false} />
          </Box>

          {/* Navigation Items */}
          <List>
            {navigationItems.map(item => (
              <ListItem
                key={item.label}
                button
                onClick={() => {
                  router.push(item.href)
                  toggleMenu()
                }}
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                  '&:hover': {
                    backgroundColor: 'primary.light',
                    '& .MuiListItemText-primary': {
                      color: 'primary.contrastText'
                    }
                  }
                }}
              >
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: 500
                  }}
                />
              </ListItem>
            ))}
          </List>

          {/* User Actions */}
          <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
            {!user && (
              <Button
                fullWidth
                variant='contained'
                onClick={() => {
                  router.push(ROUTE_CONFIG.LOGIN)
                  toggleMenu()
                }}
                sx={{ mb: 2 }}
              >
                Đăng nhập
              </Button>
            )}
          </Box>
        </Box>
      </Drawer>
    </>
  )
}

export default LuxuryHeader
