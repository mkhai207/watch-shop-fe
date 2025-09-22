// ** Mui Imports
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material'
import { Box, Button, Menu, MenuItem } from '@mui/material'
import { useRouter } from 'next/router'
import { useState } from 'react'

const NavItem = () => {
  const router = useRouter()
  const [anchorEl, setAnchorEl] = useState<Record<string, HTMLElement | null>>({})

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, menuName: string) => {
    setAnchorEl(prev => ({
      ...prev,
      [menuName]: event.currentTarget
    }))
  }

  const handleMenuClose = (menuName: string) => {
    setAnchorEl(prev => ({
      ...prev,
      [menuName]: null
    }))
  }

  const handleNavigate = (path: string) => {
    router.push(path)
  }

  const navItems = [
    {
      label: 'Trang chủ',
      path: '/',
      hasDropdown: false
    },
    {
      label: 'Sản phẩm',
      hasDropdown: true,
      menuName: 'sanpham',
      items: ['Phân loại 1', 'Phân loại 2', 'Phân loại 3']
    },
    {
      label: 'SALE UP TO 50%',
      hasDropdown: true,
      menuName: 'sale',
      items: ['Giảm 20%', 'Giảm 30%', 'Giảm 50%'],
      isHighlight: false
    },
    {
      label: 'Bộ Sưu Tập',
      hasDropdown: true,
      menuName: 'bosuutap',
      items: ['Bộ sưu tập mùa hè', 'Bộ sưu tập mùa đông', 'Bộ sưu tập đặc biệt']
    },
    {
      label: 'Hệ thống cửa hàng',
      path: '/',
      hasDropdown: false
    }
  ]

  return (
    <>
      <Box sx={{ display: 'flex', gap: 4 }}>
        {navItems.map(item => (
          <Box key={item.label} sx={{ position: 'relative' }}>
            {item.hasDropdown ? (
              <>
                <Button
                  onClick={e => handleMenuOpen(e, item.menuName!)}
                  endIcon={anchorEl[item.menuName!] ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                  sx={{
                    color: item.isHighlight ? '#ff4444' : '#333',
                    fontWeight: 'bold',
                    textTransform: 'none',
                    fontSize: '16px',
                    '&:hover': {
                      backgroundColor: 'transparent',
                      color: '#ff4444'
                    },
                    px: 2,
                    py: 1
                  }}
                >
                  {item.label}
                </Button>
                <Menu
                  anchorEl={anchorEl[item.menuName!]}
                  open={Boolean(anchorEl[item.menuName!])}
                  onClose={() => handleMenuClose(item.menuName!)}
                  MenuListProps={{
                    'aria-labelledby': 'basic-button'
                  }}
                  sx={{
                    '& .MuiPaper-root': {
                      mt: 1,
                      minWidth: 180,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                      border: '1px solid #e0e0e0'
                    }
                  }}
                >
                  {item.items?.map(subItem => (
                    <MenuItem
                      key={subItem}
                      onClick={() => handleMenuClose(item.menuName)}
                      sx={{
                        fontSize: '14px',
                        py: 1.5,
                        '&:hover': {
                          backgroundColor: '#f5f5f5'
                        }
                      }}
                    >
                      {subItem}
                    </MenuItem>
                  ))}
                </Menu>
              </>
            ) : (
              <Button
                sx={{
                  color: '#333',
                  textTransform: 'none',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  '&:hover': {
                    backgroundColor: 'transparent',
                    color: '#ff4444'
                  },
                  px: 2,
                  py: 1
                }}
                onClick={() => handleNavigate(item.path as string)}
              >
                {item.label}
              </Button>
            )}
          </Box>
        ))}
      </Box>
    </>
  )
}

export default NavItem
