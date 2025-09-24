import React from 'react'
import { Box, Container, CssBaseline, Toolbar } from '@mui/material'
import ManageSystemSidebar from './ManageSystemSidebar'
import ManageSystemHeader from './ManageSystemHeader'

type TProps = {
  children: React.ReactNode
}

const ManageSystemLayout: React.FC<TProps> = ({ children }) => {
  const [open, setOpen] = React.useState(true)
  const toggle = () => setOpen(prev => !prev)

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <ManageSystemSidebar open={open} toggle={toggle} />
      <Box component='main' sx={{ flexGrow: 1, height: '100vh', overflow: 'auto' }}>
        <ManageSystemHeader />
        <Container maxWidth={false} sx={{ mt: 3, mb: 4 }}>
          {children}
        </Container>
      </Box>
    </Box>
  )
}

export default ManageSystemLayout
