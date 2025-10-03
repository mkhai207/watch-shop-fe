import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material'
import React from 'react'

type ConfirmDialogProps = {
  open: boolean
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onClose: () => void
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title = 'Xác nhận',
  description = 'Bạn có chắc chắn muốn thực hiện thao tác này?',
  confirmText = 'Có',
  cancelText = 'Không',
  onConfirm,
  onClose
}) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='xs' keepMounted disableScrollLock>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{description}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant='outlined'>
          {cancelText}
        </Button>
        <Button onClick={onConfirm} variant='contained' color='error'>
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ConfirmDialog
