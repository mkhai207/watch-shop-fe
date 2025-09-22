import {
  ExitToApp as ExitToAppIcon,
  ListAlt as ListAltIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material'
import { Box, List, ListItem, ListItemIcon, ListItemText, Paper } from '@mui/material'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import * as React from 'react'
import { useState } from 'react'

const SIDEBAR_WIDTH = 280

const MENU_ITEMS = [
  {
    id: 'profile',
    label: 'Thông tin',
    icon: <PersonIcon />,
    path: '/my-profile'
  },
  {
    id: 'addresses',
    label: 'Địa chỉ',
    icon: <LocationIcon />,
    path: '/address'
  },
  {
    id: 'orders',
    label: 'Danh sách đơn hàng',
    icon: <ListAltIcon />,
    path: '/order/order-history'
  },
  {
    id: 'logout',
    label: 'Đăng xuất',
    icon: <ExitToAppIcon />,
    path: '/logout'
  }
]

type TProps = {
  children: React.ReactNode
}

const AccountLayout: NextPage<TProps> = ({ children }) => {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState(() => {
    // Xác định tab active dựa trên route hiện tại
    const currentPath = router.pathname
    const currentItem = MENU_ITEMS.find(item => item.path === currentPath)

    return currentItem?.id || 'profile'
  })

  const handleMenuClick = (itemId: string, path: string) => {
    if (itemId === 'logout') {
      // Handle logout logic here
      console.log('Logout clicked')

      return
    }

    setActiveTab(itemId)
    router.push(path)
  }

  // Update active tab when route changes
  React.useEffect(() => {
    const currentPath = router.pathname
    const currentItem = MENU_ITEMS.find(item => item.path === currentPath)
    if (currentItem) {
      setActiveTab(currentItem.id)
    }
  }, [router.pathname])

  return (
    <Box sx={{ display: 'flex', gap: 3, minHeight: '70vh' }}>
      {/* Sidebar */}
      <Box
        sx={{
          width: SIDEBAR_WIDTH,
          flexShrink: 0
        }}
      >
        <Paper
          elevation={0}
          sx={{
            bgcolor: 'white',
            borderRadius: 2,
            overflow: 'hidden',
            border: '1px solid #e0e0e0',
            height: '100%'
          }}
        >
          {/* User Info Section */}
          {/* <Box sx={{ p: 3, borderBottom: '1px solid #f0f0f0' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar
                sx={{
                  bgcolor: '#d32f2f',
                  width: 48,
                  height: 48,
                  mr: 2,
                  fontSize: '1.2rem',
                  fontWeight: 'bold'
                }}
              >
                ML
              </Avatar>
              <Box>
                <Typography variant='h6' fontWeight='bold' sx={{ fontSize: '1rem', mb: 0.5 }}>
                  Minh Khải Lê
                </Typography>
                <Typography variant='body2' color='text.secondary' sx={{ fontSize: '0.875rem' }}>
                  lkhai4617@gmail.com
                </Typography>
              </Box>
            </Box>
          </Box> */}

          {/* Menu Items */}
          <List sx={{ py: 1 }}>
            {MENU_ITEMS.map(item => (
              <ListItem
                key={item.id}
                onClick={() => handleMenuClick(item.id, item.path)}
                sx={{
                  px: 3,
                  py: 1.5,
                  cursor: 'pointer',
                  bgcolor: activeTab === item.id ? '#fff3e0' : 'transparent',
                  borderLeft: activeTab === item.id ? '3px solid #ff9800' : '3px solid transparent',
                  '&:hover': {
                    bgcolor: activeTab === item.id ? '#fff3e0' : '#f8f9fa'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                <ListItemIcon
                  sx={{
                    color: activeTab === item.id ? '#ff9800' : '#666666',
                    minWidth: 36
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontWeight: activeTab === item.id ? 600 : 400,
                      color: activeTab === item.id ? '#ff9800' : '#333333',
                      fontSize: '0.9rem'
                    }
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Box>

      {/* Main Content */}
      <Box
        component='main'
        sx={{
          flexGrow: 1
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 4,
            bgcolor: 'white',
            borderRadius: 2,
            border: '1px solid #e0e0e0',
            height: '100%'
          }}
        >
          {children}
        </Paper>
      </Box>
    </Box>
  )
}

export default AccountLayout
