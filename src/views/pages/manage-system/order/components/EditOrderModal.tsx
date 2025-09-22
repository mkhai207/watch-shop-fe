import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Grid
} from '@mui/material'
import { Edit as EditIcon } from '@mui/icons-material'
import { Order, updateOrderStatus } from 'src/services/order'

interface EditOrderModalProps {
  open: boolean
  onClose: () => void
  editOrder: Order | null
  setEditOrder: (order: Order | null) => void
  onSave: () => void
  onSuccess?: () => void
}

const EditOrderModal: React.FC<EditOrderModalProps> = ({
  open,
  onClose,
  editOrder,
  setEditOrder,
  onSave,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false)

  if (!editOrder) return null

  const handleSave = async () => {
    try {
      setLoading(true)
      const response = await updateOrderStatus(String(editOrder.id), { status: editOrder.status })

      if (response.status === 'success') {
        onSave()
        onSuccess?.()
      } else {
        console.error('Failed to update order status:', response)
      }
    } catch (error) {
      console.error('Error updating order status:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='md'
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }
      }}
    >
      <DialogTitle
        sx={{
          backgroundColor: 'primary.main',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          fontSize: '1.2rem',
          fontWeight: 'bold'
        }}
      >
        <EditIcon />
        Sửa thông tin đơn hàng #{editOrder.id}
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              label='Tên khách hàng'
              value={editOrder.name}
              fullWidth
              disabled
              sx={{
                '& .MuiOutlinedInput-root': { borderRadius: 2 },
                '& .Mui-disabled': {
                  backgroundColor: '#f5f5f5',
                  color: 'text.secondary'
                }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label='Số điện thoại'
              value={editOrder.phone}
              fullWidth
              disabled
              sx={{
                '& .MuiOutlinedInput-root': { borderRadius: 2 },
                '& .Mui-disabled': {
                  backgroundColor: '#f5f5f5',
                  color: 'text.secondary'
                }
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label='Địa chỉ giao hàng'
              value={editOrder.shipping_address}
              fullWidth
              multiline
              rows={2}
              disabled
              sx={{
                '& .MuiOutlinedInput-root': { borderRadius: 2 },
                '& .Mui-disabled': {
                  backgroundColor: '#f5f5f5',
                  color: 'text.secondary'
                }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label='Tổng tiền'
              type='number'
              value={editOrder.total_money || ''}
              fullWidth
              disabled
              sx={{
                '& .MuiOutlinedInput-root': { borderRadius: 2 },
                '& .Mui-disabled': {
                  backgroundColor: '#f5f5f5',
                  color: 'text.secondary'
                }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label='Mã giảm giá'
              value={editOrder.discount_id || ''}
              fullWidth
              disabled
              sx={{
                '& .MuiOutlinedInput-root': { borderRadius: 2 },
                '& .Mui-disabled': {
                  backgroundColor: '#f5f5f5',
                  color: 'text.secondary'
                }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Phương thức thanh toán</InputLabel>
              <Select
                value={editOrder.payment_method}
                label='Phương thức thanh toán'
                disabled
                sx={{
                  '& .MuiOutlinedInput-root': { borderRadius: 2 },
                  '& .Mui-disabled': {
                    backgroundColor: '#f5f5f5',
                    color: 'text.secondary'
                  }
                }}
              >
                <MenuItem value='ONLINE'>Thanh toán online</MenuItem>
                <MenuItem value='CASH'>Thanh toán khi nhận hàng</MenuItem>
                <MenuItem value='BANK_TRANSFER'>Chuyển khoản ngân hàng</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Trạng thái *</InputLabel>
              <Select
                value={editOrder.status}
                onChange={(e: SelectChangeEvent) => setEditOrder({ ...editOrder, status: e.target.value })}
                label='Trạng thái *'
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              >
                <MenuItem value='PENDING'>Chờ xác nhận</MenuItem>
                <MenuItem value='UNPAID'>Chưa thanh toán</MenuItem>
                <MenuItem value='PAID'>Đã thanh toán</MenuItem>
                <MenuItem value='SHIPPING'>Đang giao</MenuItem>
                <MenuItem value='COMPLETED'>Đã hoàn thành</MenuItem>
                <MenuItem value='CANCELLED'>Đã hủy</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 3, gap: 2 }}>
        <Button onClick={onClose} variant='outlined' sx={{ borderRadius: 2, px: 3 }} disabled={loading}>
          Huỷ
        </Button>
        <Button
          onClick={handleSave}
          variant='contained'
          color='primary'
          disabled={loading}
          sx={{ borderRadius: 2, px: 3 }}
        >
          {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default EditOrderModal
