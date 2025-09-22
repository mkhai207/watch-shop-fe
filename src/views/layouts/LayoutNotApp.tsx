import * as React from 'react'
import CssBaseline from '@mui/material/CssBaseline'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import Container from '@mui/material/Container'
import { NextPage } from 'next'
import HorizontalLayout from './HorizontalLayout'
import { useTheme } from '@mui/material'
import FooterLayout from './FooterLayout'

type TProps = {
  children: React.ReactNode
}

const LayoutNotApp: NextPage<TProps> = ({ children }) => {
  const theme = useTheme()

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <HorizontalLayout toggleDrawer={() => {}} open={false} isHideMenu />
      <Box
        component='main'
        sx={{
          backgroundColor: theme =>
            theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[900],
          flexGrow: 1,
          height: '100vh',
          overflow: 'auto'
        }}
      >
        <Toolbar />
        <Container
          maxWidth='lg'
          sx={{
            m: 4,
            backgroundColor: theme.palette.background.paper,
            width: 'calc(100vw - 32px)',
            maxWidth: 'unset !important',
            overflow: 'auto',
            maxHeight: `calc(100vh - ${theme.mixins.toolbar.minHeight} - 32px)`
          }}
        >
          {children}
        </Container>
        <FooterLayout />
      </Box>
    </Box>
  )
}

export default LayoutNotApp
