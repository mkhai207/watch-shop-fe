import * as React from 'react'
import CssBaseline from '@mui/material/CssBaseline'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import Container from '@mui/material/Container'
import { NextPage } from 'next'
import VerticalLayout from './VerticalLayout'
import HorizontalLayout from './HorizontalLayout'

type TProps = {
  children: React.ReactNode
}

// TODO remove, this demo shouldn't need to reset the theme.
// const defaultTheme = createTheme()

const UserLayout: NextPage<TProps> = ({ children }) => {
  const [open, setOpen] = React.useState(true)
  const toggleDrawer = () => {
    setOpen(!open)
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <VerticalLayout toggleDrawer={toggleDrawer} open={open} />
      <HorizontalLayout toggleDrawer={toggleDrawer} open={open} />
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
          maxWidth={false}
          sx={{
            mt: 4,
            mb: 4,
            width: '100%',
            maxWidth: '100% !important',
            px: 3
          }}
        >
          {children}
        </Container>
      </Box>
    </Box>
  )
}

export default UserLayout
