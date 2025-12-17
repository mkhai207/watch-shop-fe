import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Paper,
  Stack,
  Typography
} from '@mui/material'
import { formatCompactVN } from 'src/utils/date'
import type { TDiscount } from 'src/types/discount'

interface DiscountDetailDialogProps {
  open: boolean
  discount: TDiscount | null
  onClose: () => void
}

const DiscountDetailDialog = ({ open, discount, onClose }: DiscountDetailDialogProps) => {
  if (!discount) return null

  const isPercentage = discount.discount_type === 'PERCENTAGE'

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='sm'>
      <DialogTitle
        sx={{
          color: 'primary.main',
          fontWeight: 700,
          borderBottom: theme => `1px solid ${theme.palette.divider}`
        }}
      >
        Chi tiết khuyến mãi
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 2 }}>
          {/* Mã và Tên */}
          <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50' }}>
            <Typography variant='caption' color='text.secondary'>
              Mã khuyến mãi
            </Typography>
            <Typography variant='body2' sx={{ mt: 0.5, fontWeight: 600 }}>
              {discount.code}
            </Typography>
          </Paper>

          <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50' }}>
            <Typography variant='caption' color='text.secondary'>
              Tên chương trình
            </Typography>
            <Typography variant='body2' sx={{ mt: 0.5 }}>
              {discount.name}
            </Typography>
          </Paper>

          {discount.description && (
            <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant='caption' color='text.secondary'>
                Mô tả
              </Typography>
              <Typography variant='body2' sx={{ mt: 0.5 }}>
                {discount.description}
              </Typography>
            </Paper>
          )}

          {/* Thông tin giảm giá */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', height: '100%' }}>
                <Typography variant='caption' color='text.secondary'>
                  Loại giảm giá
                </Typography>
                <Typography variant='body2' sx={{ mt: 0.5 }}>
                  {isPercentage ? 'Phần trăm' : 'Cố định'}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', height: '100%' }}>
                <Typography variant='caption' color='text.secondary'>
                  Giá trị giảm
                </Typography>
                <Typography variant='body2' sx={{ mt: 0.5, fontWeight: 600 }}>
                  {isPercentage
                    ? `${discount.discount_value}%`
                    : `${Number(discount.discount_value).toLocaleString('vi-VN')}đ`}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', height: '100%' }}>
                <Typography variant='caption' color='text.secondary'>
                  ĐH tối thiểu
                </Typography>
                <Typography variant='body2' sx={{ mt: 0.5 }}>
                  {discount.minimum_order_value?.toLocaleString('vi-VN') || '0'}đ
                </Typography>
              </Paper>
            </Grid>
            {discount.max_discount_amount != null && (
              <Grid item xs={12} sm={6}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', height: '100%' }}>
                  <Typography variant='caption' color='text.secondary'>
                    Giảm tối đa
                  </Typography>
                  <Typography variant='body2' sx={{ mt: 0.5 }}>
                    {discount.max_discount_amount.toLocaleString('vi-VN')}đ
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>

          {/* Thời gian hiệu lực */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', height: '100%' }}>
                <Typography variant='caption' color='text.secondary'>
                  Hiệu lực từ
                </Typography>
                <Typography variant='body2' sx={{ mt: 0.5 }}>
                  {formatCompactVN((discount as any).effective_date || discount.valid_from) || '-'}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', height: '100%' }}>
                <Typography variant='caption' color='text.secondary'>
                  Hiệu lực đến
                </Typography>
                <Typography variant='body2' sx={{ mt: 0.5 }}>
                  {formatCompactVN(discount.valid_until) || '-'}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Thông tin hệ thống */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', height: '100%' }}>
                <Typography variant='caption' color='text.secondary'>
                  Ngày tạo
                </Typography>
                <Typography variant='body2' sx={{ mt: 0.5 }}>
                  {formatCompactVN(discount.created_at) || '-'}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', height: '100%' }}>
                <Typography variant='caption' color='text.secondary'>
                  Ngày cập nhật
                </Typography>
                <Typography variant='body2' sx={{ mt: 0.5 }}>
                  {formatCompactVN(discount.updated_at) || '-'}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant='contained'>
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DiscountDetailDialog
