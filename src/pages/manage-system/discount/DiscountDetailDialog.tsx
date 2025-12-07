import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
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
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Typography variant='h6' fontWeight={600}>
            Chi tiết khuyến mãi
          </Typography>
          <Typography variant='caption' color='text.secondary' sx={{ fontStyle: 'italic', mt: 0.5 }}>
            {formatCompactVN(discount.created_at)}
          </Typography>
        </Box>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 3 }}>
        <Grid container spacing={2.5}>
          <Grid item xs={12}>
            <Typography variant='subtitle2' color='text.secondary'>
              Mã khuyến mãi
            </Typography>
            <Typography variant='h6' fontWeight={600} sx={{ mt: 0.5 }}>
              {discount.code}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant='subtitle2' color='text.secondary'>
              Tên chương trình
            </Typography>
            <Typography variant='body1' sx={{ mt: 0.5 }}>
              {discount.name}
            </Typography>
          </Grid>

          {discount.description && (
            <Grid item xs={12}>
              <Typography variant='subtitle2' color='text.secondary'>
                Mô tả
              </Typography>
              <Typography variant='body2' color='text.secondary' sx={{ mt: 0.5 }}>
                {discount.description}
              </Typography>
            </Grid>
          )}

          <Grid item xs={12}>
            <Divider />
          </Grid>

          <Grid item xs={6}>
            <Typography variant='subtitle2' color='text.secondary'>
              Loại giảm giá
            </Typography>
            <Typography variant='body1' sx={{ mt: 0.5 }}>
              {isPercentage ? 'Phần trăm' : 'Cố định'}
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <Typography variant='subtitle2' color='text.secondary'>
              Giá trị giảm
            </Typography>
            <Typography variant='body1' fontWeight={600} sx={{ mt: 0.5 }}>
              {isPercentage
                ? `${discount.discount_value}%`
                : `${Number(discount.discount_value).toLocaleString('vi-VN')}đ`}
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <Typography variant='subtitle2' color='text.secondary'>
              ĐH tối thiểu
            </Typography>
            <Typography variant='body1' sx={{ mt: 0.5 }}>
              {discount.minimum_order_value?.toLocaleString('vi-VN') || '0'}đ
            </Typography>
          </Grid>

          {discount.max_discount_amount != null && (
            <Grid item xs={6}>
              <Typography variant='subtitle2' color='text.secondary'>
                Giảm tối đa
              </Typography>
              <Typography variant='body1' sx={{ mt: 0.5 }}>
                {discount.max_discount_amount.toLocaleString('vi-VN')}đ
              </Typography>
            </Grid>
          )}

          <Grid item xs={12}>
            <Divider />
          </Grid>

          <Grid item xs={6}>
            <Typography variant='subtitle2' color='text.secondary'>
              Hiệu lực từ
            </Typography>
            <Typography variant='body1' sx={{ mt: 0.5 }}>
              {formatCompactVN((discount as any).effective_date || discount.valid_from) || '-'}
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <Typography variant='subtitle2' color='text.secondary'>
              Hiệu lực đến
            </Typography>
            <Typography variant='body1' sx={{ mt: 0.5 }}>
              {formatCompactVN(discount.valid_until) || '-'}
            </Typography>
          </Grid>
        </Grid>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant='contained'>
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DiscountDetailDialog
