import React, { useMemo } from 'react'
import { styled } from '@mui/material/styles'
import MuiDrawer from '@mui/material/Drawer'
import Toolbar from '@mui/material/Toolbar'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { useRouter } from 'next/router'
import IconifyIcon from 'src/components/Icon'
import { VerticalItems, type MenuItem } from 'src/configs/layout'

const drawerExpanded = 256
const drawerCollapsed = 64

const Drawer = styled(MuiDrawer, { shouldForwardProp: prop => prop !== 'open' })(({ theme, open }) => ({
  '& .MuiDrawer-paper': {
    position: 'relative',
    whiteSpace: 'nowrap',
    width: open ? drawerExpanded : drawerCollapsed,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    }),
    boxSizing: 'border-box',
    borderRight: `1px solid ${theme.palette.divider}`
  }
}))

type TProps = {
  open: boolean
  toggle: () => void
}

const ManageSystemSidebar: React.FC<TProps> = ({ open, toggle }) => {
  const router = useRouter()

  const flatItems = useMemo(() => VerticalItems, [])

  const isActive = (item: MenuItem) => {
    if (!item.path) return false
    const currentPath = (router.asPath || router.pathname).split('?')[0]
    return currentPath === item.path || currentPath.startsWith(item.path + '/')
  }

  const handleClick = (item: MenuItem) => {
    if (item.path && !item.children) router.push(item.path)
  }

  return (
    <Drawer variant='permanent' open={open}>
      <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: open ? 1 : 0 }}>
          <IconifyIcon icon='mdi:watch-variant' />
          {open && <Box sx={{ fontWeight: 700 }}>WatchStore</Box>}
        </Box>
        <IconButton onClick={toggle} size='small'>
          <IconifyIcon icon={open ? 'mdi:chevron-left' : 'mdi:menu'} />
        </IconButton>
      </Toolbar>
      <Divider />
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          <List disablePadding>
            {flatItems.map(section => (
              <React.Fragment key={section.title}>
                {section.children?.map(child => (
                  <ListItemButton
                    key={child.title}
                    onClick={() => handleClick(child)}
                    selected={isActive(child)}
                    sx={theme => ({
                      py: 1.25,
                      px: open ? 2 : 1.25,
                      color: theme.palette.text.secondary,
                      '&:hover': { bgcolor: theme.palette.action.hover, color: theme.palette.text.primary },
                      '&.Mui-selected': {
                        bgcolor: theme.palette.action.hover,
                        color: theme.palette.text.primary,
                        '&:hover': { bgcolor: theme.palette.action.hover }
                      }
                    })}
                  >
                    <ListItemIcon sx={{ minWidth: 0, mr: open ? 1.5 : 0, justifyContent: 'center', color: 'inherit' }}>
                      <IconifyIcon icon={child.icon} />
                    </ListItemIcon>
                    {open && (
                      <ListItemText
                        primary={child.title}
                        primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}
                        sx={{ color: 'inherit' }}
                      />
                    )}
                  </ListItemButton>
                ))}
                <Divider sx={{ my: 0.5 }} />
              </React.Fragment>
            ))}
          </List>
        </Box>
        <Box sx={{ p: 2, borderTop: theme => `1px solid ${theme.palette.divider}` }}>
          <Button fullWidth variant='outlined' onClick={() => router.push('/')}>
            Về trang chủ
          </Button>
        </Box>
      </Box>
    </Drawer>
  )
}

export default ManageSystemSidebar
