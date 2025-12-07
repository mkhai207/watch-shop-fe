import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  MenuItem,
  Select,
  TextField,
  Typography
} from '@mui/material'
import { useEffect, useState } from 'react'
import type { TV1CreateDiscountReq } from 'src/services/discount'

interface DiscountEditDialogProps {
  open: boolean
  discount: any | null
  onClose: () => void
  onSubmit: (data: Omit<TV1CreateDiscountReq, 'code'>) => Promise<void>
}

const DiscountEditDialog = ({ open, discount, onClose, onSubmit }: DiscountEditDialogProps) => {
  const [formData, setFormData] = useState<Omit<TV1CreateDiscountReq, 'code'>>({
    name: '',
    description: '',
    min_order_value: 0,
    discount_type: '0',
    discount_value: 0,
    effective_date: '',
    valid_until: ''
  })
  const [effectiveDate, setEffectiveDate] = useState<string>('')
  const [validUntil, setValidUntil] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const compactToDateStr = (compact?: string): string => {
    if (!compact || compact.length < 8) return ''
    const y = compact.substring(0, 4)
    const m = compact.substring(4, 6)
    const d = compact.substring(6, 8)

    return `${y}-${m}-${d}`
  }

  const dateStrToCompact = (dateStr: string): string => {
    if (!dateStr) return ''

    return dateStr.replace(/-/g, '') + '000000'
  }

  useEffect(() => {
    if (discount) {
      setFormData({
        name: discount.name || '',
        description: discount.description || '',
        min_order_value: discount.min_order_value || 0,
        discount_type: discount.discount_type || '0',
        discount_value: discount.discount_value || 0,
        effective_date: discount.effective_date || '',
        valid_until: discount.valid_until || ''
      })
      setEffectiveDate(compactToDateStr(discount.effective_date))
      setValidUntil(compactToDateStr(discount.valid_until))
    }
  }, [discount])

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await onSubmit(formData)
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='sm'>
      <DialogTitle>
        <Typography variant='h6' fontWeight={600}>
          Cập nhật khuyến mãi
        </Typography>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 3 }}>
        <Grid container spacing={2.5}>
          <Grid item xs={12}>
            <TextField
              label='Tên khuyến mãi'
              fullWidth
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label='Mô tả'
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Select
              fullWidth
              value={formData.discount_type}
              onChange={e => setFormData({ ...formData, discount_type: e.target.value as any })}
            >
              <MenuItem value='0'>Giảm cố định</MenuItem>
              <MenuItem value='1'>Giảm theo %</MenuItem>
            </Select>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              type='number'
              label={formData.discount_type === '1' ? 'Giá trị (%)' : 'Giá trị (VNĐ)'}
              fullWidth
              value={formData.discount_value}
              onChange={e => setFormData({ ...formData, discount_value: Number(e.target.value) })}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              type='number'
              label='Đơn hàng tối thiểu (VNĐ)'
              fullWidth
              value={formData.min_order_value}
              onChange={e => setFormData({ ...formData, min_order_value: Number(e.target.value) })}
            />
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              type='date'
              label='Hiệu lực từ'
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={effectiveDate}
              onChange={e => {
                const v = e.target.value
                setEffectiveDate(v)
                setFormData({ ...formData, effective_date: dateStrToCompact(v) })
              }}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              type='date'
              label='Hiệu lực đến'
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={validUntil}
              onChange={e => {
                const v = e.target.value
                setValidUntil(v)
                setFormData({ ...formData, valid_until: dateStrToCompact(v) })
              }}
              required
            />
          </Grid>
        </Grid>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Hủy
        </Button>
        <Button onClick={handleSubmit} variant='contained' disabled={loading}>
          {loading ? 'Đang lưu...' : 'Lưu'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DiscountEditDialog
