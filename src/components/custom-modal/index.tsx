import { ModalProps, styled, Modal, Box } from '@mui/material'
import React from 'react'

interface TCustomModal extends ModalProps {
  handleClose: () => void
}

const StyleModal = styled(Modal)<ModalProps>(() => ({
  '& .MuiBackdrop-root': {
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  }
}))

const CustomModal = (props: TCustomModal) => {
  const { children, open, handleClose } = props

  return (
    <StyleModal open={open} onClose={handleClose} aria-labelledby='modal-modal-title'>
      <Box
        sx={{
          height: '100%',
          width: '100vw',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Box sx={{ maxHeight: '100vh', overflow: 'auto' }}>
          <Box
            sx={{
              height: '100%',
              width: '100%',
              minHeight: '100vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Box sx={{ margin: '40px 0' }}>{children}</Box>
          </Box>
        </Box>
      </Box>
    </StyleModal>
  )
}

export default CustomModal
