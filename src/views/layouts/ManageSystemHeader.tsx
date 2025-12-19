import React from 'react'
import { AppBar, Badge, Box, IconButton, InputAdornment, OutlinedInput, Toolbar, Typography } from '@mui/material'
import IconifyIcon from 'src/components/Icon'

type TProps = {
  title?: string
}

const ManageSystemHeader: React.FC<TProps> = ({ title = 'Trang quản trị hệ thống' }) => {
  return (
    <AppBar
      position='sticky'
      color='inherit'
      elevation={0}
      sx={{ borderBottom: theme => `1px solid ${theme.palette.divider}` }}
    >
      <Toolbar sx={{ gap: 2, minHeight: 64 }}>
        <Typography variant='h6' fontWeight={700} sx={{ mr: 'auto', color: 'primary.main', fontSize: 20 }}>
          {title}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <OutlinedInput
            placeholder='Tìm kiếm...'
            size='small'
            sx={{ width: 360, bgcolor: 'background.paper' }}
            startAdornment={
              <InputAdornment position='start'>
                <IconifyIcon icon='mdi:magnify' />
              </InputAdornment>
            }
          />

          <IconButton>
            <Badge color='error' overlap='circular' badgeContent={3}>
              <IconifyIcon icon='mdi:bell-outline' />
            </Badge>
          </IconButton>

          <IconButton>
            <IconifyIcon icon='mdi:cog-outline' />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default ManageSystemHeader
