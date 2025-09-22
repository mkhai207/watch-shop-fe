import React from 'react'
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Typography } from '@mui/material'
import { TProduct } from 'src/types/product'

type TProps = {
  open: boolean
  onClose: () => void
  product: TProduct | null
  onConfirm: (productId: string) => void
  loading?: boolean
}

const DeleteConfirmationModal: React.FC<TProps> = ({ open, onClose, product, onConfirm, loading = false }) => {
  const handleConfirm = () => {
    if (product) {
      onConfirm(product.id)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.5rem', color: 'error.main' }}>
        Xác nhận xóa sản phẩm
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <Typography variant='body1' sx={{ mb: 2 }}>
          Bạn có chắc chắn muốn xóa sản phẩm "{product?.name}" không?
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          Hành động này không thể hoàn tác. Sản phẩm sẽ bị xóa vĩnh viễn.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} variant='outlined' disabled={loading}>
          Hủy
        </Button>
        <Button onClick={handleConfirm} variant='contained' color='error' disabled={loading}>
          {loading ? 'Đang xóa...' : 'Xóa sản phẩm'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DeleteConfirmationModal
