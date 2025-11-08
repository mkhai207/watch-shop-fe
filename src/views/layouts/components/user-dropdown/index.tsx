import React, { useState } from 'react'
import {
  Avatar,
  Box,
  Chip,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
  alpha,
  useTheme
} from '@mui/material'
import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'
import Image from 'next/image'
import { ROUTE_CONFIG } from 'src/configs/route'
import { useAuth } from 'src/hooks/useAuth'

const UserDropdown = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const theme = useTheme()
  const { user, logout } = useAuth()
  const router = useRouter()
  const { t } = useTranslation()

  const open = Boolean(anchorEl)

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleNavigate = (path: string) => {
    router.push(path)
    handleClose()
  }

  return (
    <>
      <Tooltip title='Tài khoản' arrow>
        <IconButton
          onClick={handleClick}
          size='small'
          sx={{
            ml: 2,
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'scale(1.05)',
              backgroundColor: alpha(theme.palette.primary.main, 0.08)
            }
          }}
        >
          <Avatar
            sx={{
              width: 36,
              height: 36,
              border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`
            }}
          >
            {user?.avatar ? (
              <Image src={user.avatar} alt='avatar' width={36} height={36} style={{ borderRadius: '50%' }} />
            ) : (
              <span style={{ fontSize: '20px' }}>👤</span>
            )}
          </Avatar>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            minWidth: '280px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            mt: 1
          }
        }}
      >
        {/* User Info Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            p: 3,
            pt: 4,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
          }}
        >
          <Avatar
            sx={{
              width: 48,
              height: 48,
              border: `3px solid ${alpha(theme.palette.primary.main, 0.2)}`
            }}
          >
            {user?.avatar ? (
              <Image src={user.avatar} alt='avatar' width={48} height={48} style={{ borderRadius: '50%' }} />
            ) : (
              <span style={{ fontSize: '24px' }}>👤</span>
            )}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant='subtitle1'
              fontWeight={600}
              sx={{
                color: theme.palette.text.primary,
                mb: 0.5,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {user ? `${user.first_name} ${user.last_name}`.trim() || user.username : 'Người dùng'}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                label={user?.role?.name || 'Khách hàng'}
                size='small'
                sx={{
                  height: 20,
                  fontSize: '0.75rem',
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                  fontWeight: 500
                }}
              />
              <Chip
                label='Online'
                size='small'
                sx={{
                  height: 20,
                  fontSize: '0.75rem',
                  backgroundColor: '#44b700',
                  color: 'white',
                  fontWeight: 500
                }}
              />
            </Box>
          </Box>
        </Box>

        {/* Admin Section */}
        {(user?.role?.code === 'ADMIN' || user?.role?.code === 'STAFF') && (
          <>
            <MenuItem
              onClick={() => handleNavigate(`/${ROUTE_CONFIG.MANAGE_PAGE}`)}
              sx={{
                padding: '12px 16px',
                borderRadius: '8px',
                margin: '4px 8px',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  transform: 'translateX(4px)'
                }
              }}
            >
              <Avatar
                sx={{
                  backgroundColor: alpha(theme.palette.warning.main, 0.1),
                  color: theme.palette.warning.main,
                  width: 36,
                  height: 36,
                  mr: 2
                }}
              >
                <span>👑</span>
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant='body2' fontWeight={500}>
                  Trang quản trị
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  Quản trị hệ thống
                </Typography>
              </Box>
            </MenuItem>
            <Divider sx={{ mx: 2, my: 1 }} />
          </>
        )}

        {/* Main Menu Items */}
        <MenuItem
          onClick={() => handleNavigate(`/${ROUTE_CONFIG.MY_PROFILE}`)}
          sx={{
            padding: '12px 16px',
            borderRadius: '8px',
            margin: '4px 8px',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.08),
              transform: 'translateX(4px)'
            }
          }}
        >
          <Avatar
            sx={{
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              width: 36,
              height: 36,
              mr: 2
            }}
          >
            <span>👤</span>
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant='body2' fontWeight={500}>
              Hồ sơ của tôi
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              Quản lý thông tin cá nhân
            </Typography>
          </Box>
        </MenuItem>

        <MenuItem
          onClick={() => handleNavigate(`/${ROUTE_CONFIG.ORDER_HISTORY}`)}
          sx={{
            padding: '12px 16px',
            borderRadius: '8px',
            margin: '4px 8px',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.08),
              transform: 'translateX(4px)'
            }
          }}
        >
          <Avatar
            sx={{
              backgroundColor: alpha(theme.palette.info.main, 0.1),
              color: theme.palette.info.main,
              width: 36,
              height: 36,
              mr: 2
            }}
          >
            <span>📦</span>
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant='body2' fontWeight={500}>
              Lịch sử đơn hàng
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              Xem lịch sử đơn hàng
            </Typography>
          </Box>
        </MenuItem>

        <MenuItem
          onClick={() => handleNavigate('/wishlist')}
          sx={{
            padding: '12px 16px',
            borderRadius: '8px',
            margin: '4px 8px',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.08),
              transform: 'translateX(4px)'
            }
          }}
        >
          <Avatar
            sx={{
              backgroundColor: alpha(theme.palette.error.main, 0.1),
              color: theme.palette.error.main,
              width: 36,
              height: 36,
              mr: 2
            }}
          >
            <span>❤️</span>
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant='body2' fontWeight={500}>
              Danh sách yêu thích
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              Sản phẩm đã lưu
            </Typography>
          </Box>
        </MenuItem>

        <MenuItem
          onClick={() => handleNavigate(`/${ROUTE_CONFIG.ADDRESSES}`)}
          sx={{
            padding: '12px 16px',
            borderRadius: '8px',
            margin: '4px 8px',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.08),
              transform: 'translateX(4px)'
            }
          }}
        >
          <Avatar
            sx={{
              backgroundColor: alpha(theme.palette.success.main, 0.1),
              color: theme.palette.success.main,
              width: 36,
              height: 36,
              mr: 2
            }}
          >
            <span>📍</span>
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant='body2' fontWeight={500}>
              Địa chỉ
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              Quản lý địa chỉ giao hàng
            </Typography>
          </Box>
        </MenuItem>

        <MenuItem
          onClick={() => handleNavigate('/settings')}
          sx={{
            padding: '12px 16px',
            borderRadius: '8px',
            margin: '4px 8px',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.08),
              transform: 'translateX(4px)'
            }
          }}
        >
          <Avatar
            sx={{
              backgroundColor: alpha(theme.palette.grey[500], 0.1),
              color: theme.palette.grey[600],
              width: 36,
              height: 36,
              mr: 2
            }}
          >
            <span>⚙️</span>
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant='body2' fontWeight={500}>
              Cài đặt
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              Tùy chỉnh tài khoản
            </Typography>
          </Box>
        </MenuItem>

        <MenuItem
          onClick={() => handleNavigate('/help')}
          sx={{
            padding: '12px 16px',
            borderRadius: '8px',
            margin: '4px 8px',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.08),
              transform: 'translateX(4px)'
            }
          }}
        >
          <Avatar
            sx={{
              backgroundColor: alpha(theme.palette.success.main, 0.1),
              color: theme.palette.success.main,
              width: 36,
              height: 36,
              mr: 2
            }}
          >
            <span>❓</span>
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant='body2' fontWeight={500}>
              Trợ giúp & Hỗ trợ
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              Liên hệ hỗ trợ
            </Typography>
          </Box>
        </MenuItem>

        <Divider sx={{ mx: 2, my: 1 }} />

        {/* Logout */}
        <MenuItem
          onClick={() => {
            handleClose()
            logout()
          }}
          sx={{
            padding: '12px 16px',
            borderRadius: '8px',
            margin: '4px 8px',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              backgroundColor: alpha(theme.palette.error.main, 0.08),
              transform: 'translateX(4px)'
            }
          }}
        >
          <Avatar
            sx={{
              backgroundColor: alpha(theme.palette.error.main, 0.1),
              color: theme.palette.error.main,
              width: 36,
              height: 36,
              mr: 2
            }}
          >
            <span>🚪</span>
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant='body2' fontWeight={500}>
              Đăng xuất
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              Đăng xuất khỏi tài khoản
            </Typography>
          </Box>
        </MenuItem>
      </Menu>
    </>
  )
}

export default UserDropdown
