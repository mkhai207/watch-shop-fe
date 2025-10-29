import * as React from 'react'
import CssBaseline from '@mui/material/CssBaseline'
import Box from '@mui/material/Box'

import Container from '@mui/material/Container'
import { NextPage } from 'next'
import { useTheme } from '@mui/material'
import LuxuryHeader from 'src/components/luxury-header/LuxuryHeader'
import LuxuryFooter from 'src/components/luxury-footer/LuxuryFooter'

type TProps = {
  children: React.ReactNode
}

const LayoutNotApp: NextPage<TProps> = ({ children }) => {
  const theme = useTheme()

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <CssBaseline />
      <LuxuryHeader />
      <Box
        component='main'
        sx={{
          backgroundColor: theme.palette.background.default,
          flexGrow: 1,
          pt: 8, // Account for fixed header
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Container
          maxWidth='lg'
          sx={{
            flexGrow: 1,
            py: 4
          }}
        >
          {children}
        </Container>
        <LuxuryFooter />
      </Box>
    </Box>
  )
}

export default LayoutNotApp
