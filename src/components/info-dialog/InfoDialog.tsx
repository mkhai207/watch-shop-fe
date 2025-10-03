import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material'
import React from 'react'

type InfoDialogProps = {
  open: boolean
  title?: string
  description?: string
  okText?: string
  onClose: () => void
}

const InfoDialog: React.FC<InfoDialogProps> = ({
  open,
  title = 'Thông báo',
  description = 'Đã xảy ra lỗi. Vui lòng thử lại.',
  okText = 'OK',
  onClose
}) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='xs' keepMounted disableScrollLock>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{description}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant='contained'>
          {okText}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default InfoDialog
