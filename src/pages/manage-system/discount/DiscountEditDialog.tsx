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
import toast from 'react-hot-toast'
import type { TV1CreateDiscountReq } from 'src/services/discount'

interface DiscountEditDialogProps {
  open: boolean
  discount: any | null
  onClose: () => void
  onSubmit: (data: TV1CreateDiscountReq) => Promise<void>
}

const DiscountEditDialog = ({ open, discount, onClose, onSubmit }: DiscountEditDialogProps) => {
  const isEditMode = !!discount

  // Get default dates
  const getDefaultDates = () => {
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    const sevenDaysLater = new Date(today)
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7)
    const sevenDaysStr = sevenDaysLater.toISOString().split('T')[0]

    return { todayStr, sevenDaysStr }
  }

  const { todayStr, sevenDaysStr } = getDefaultDates()

  const [formData, setFormData] = useState<TV1CreateDiscountReq>({
    code: '',
    name: '',
    description: '',
    min_order_value: 0,
    discount_type: '0',
    discount_value: 0,
    effective_date: '',
    valid_until: '',
    max_discount_amount: null
  })
  const [effectiveDate, setEffectiveDate] = useState<string>(todayStr)
  const [validUntil, setValidUntil] = useState<string>(sevenDaysStr)
  const [loading, setLoading] = useState(false)

  // Validation states
  const [codeError, setCodeError] = useState<string>('')
  const [codeTouched, setCodeTouched] = useState(false)
  const [nameError, setNameError] = useState<string>('')
  const [nameTouched, setNameTouched] = useState(false)
  const [discountValueError, setDiscountValueError] = useState<string>('')
  const [discountValueTouched, setDiscountValueTouched] = useState(false)
  const [effectiveDateError, setEffectiveDateError] = useState<string>('')
  const [effectiveDateTouched, setEffectiveDateTouched] = useState(false)
  const [validUntilError, setValidUntilError] = useState<string>('')
  const [validUntilTouched, setValidUntilTouched] = useState(false)

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

  // Format number helpers
  const formatNumber = (value: number | string): string => {
    if (value === '' || value === 0) return ''
    const num = typeof value === 'string' ? parseFloat(value) : value
    if (isNaN(num)) return ''

    return num.toLocaleString('vi-VN')
  }

  const parseNumber = (value: string): number => {
    if (!value) return 0
    const cleaned = value.replace(/\./g, '').replace(/,/g, '.')
    const parsed = parseFloat(cleaned)

    return isNaN(parsed) ? 0 : parsed
  }

  // Validation functions
  const validateCode = (value: string, showToast = false): boolean => {
    if (!value.trim()) {
      const msg = 'Mã khuyến mãi không được để trống'
      setCodeError(msg)
      if (showToast) toast.error(msg)

      return false
    }
    if (value.trim().length < 2) {
      const msg = 'Mã khuyến mãi phải có ít nhất 2 ký tự'
      setCodeError(msg)
      if (showToast) toast.error(msg)

      return false
    }
    setCodeError('')

    return true
  }

  const validateName = (value: string, showToast = false): boolean => {
    if (!value.trim()) {
      const msg = 'Tên khuyến mãi không được để trống'
      setNameError(msg)
      if (showToast) toast.error(msg)

      return false
    }
    if (value.trim().length < 2) {
      const msg = 'Tên khuyến mãi phải có ít nhất 2 ký tự'
      setNameError(msg)
      if (showToast) toast.error(msg)

      return false
    }
    if (value.trim().length > 100) {
      const msg = 'Tên khuyến mãi không được vượt quá 100 ký tự'
      setNameError(msg)
      if (showToast) toast.error(msg)

      return false
    }
    setNameError('')

    return true
  }

  const validateDiscountValue = (value: number, showToast = false): boolean => {
    if (value <= 0) {
      const msg = 'Giá trị khuyến mãi phải lớn hơn 0'
      setDiscountValueError(msg)
      if (showToast) toast.error(msg)

      return false
    }
    if (formData.discount_type === '1' && value > 100) {
      const msg = 'Giá trị giảm giá theo % không được vượt quá 100'
      setDiscountValueError(msg)
      if (showToast) toast.error(msg)

      return false
    }
    setDiscountValueError('')

    return true
  }

  const validateEffectiveDate = (value: string, showToast = false): boolean => {
    if (!value) {
      const msg = 'Ngày hiệu lực không được để trống'
      setEffectiveDateError(msg)
      if (showToast) toast.error(msg)

      return false
    }
    setEffectiveDateError('')

    return true
  }

  const validateValidUntil = (value: string, effectiveDateValue: string, showToast = false): boolean => {
    if (!value) {
      setValidUntilError('')

      return true // optional field
    }
    if (effectiveDateValue && value < effectiveDateValue) {
      const msg = 'Ngày kết thúc phải sau ngày bắt đầu'
      setValidUntilError(msg)
      if (showToast) toast.error(msg)

      return false
    }
    setValidUntilError('')

    return true
  }

  // Blur handlers
  const handleCodeBlur = () => {
    setCodeTouched(true)
    validateCode(formData.code)
  }

  const handleCodeFocus = () => {
    if (codeTouched) {
      setCodeError('')
    }
  }

  const handleNameBlur = () => {
    setNameTouched(true)
    validateName(formData.name)
  }

  const handleNameFocus = () => {
    if (nameTouched) {
      setNameError('')
    }
  }

  const handleDiscountValueBlur = () => {
    setDiscountValueTouched(true)
    validateDiscountValue(formData.discount_value)
  }

  const handleDiscountValueFocus = () => {
    if (discountValueTouched) {
      setDiscountValueError('')
    }
  }

  const handleEffectiveDateBlur = () => {
    setEffectiveDateTouched(true)
    validateEffectiveDate(effectiveDate)
  }

  const handleEffectiveDateFocus = () => {
    if (effectiveDateTouched) {
      setEffectiveDateError('')
    }
  }

  const handleValidUntilBlur = () => {
    setValidUntilTouched(true)
    validateValidUntil(validUntil, effectiveDate)
  }

  const handleValidUntilFocus = () => {
    if (validUntilTouched) {
      setValidUntilError('')
    }
  }

  useEffect(() => {
    if (discount) {
      // Edit mode
      setFormData({
        code: discount.code || '',
        name: discount.name || '',
        description: discount.description || '',
        min_order_value: discount.min_order_value || 0,
        discount_type: discount.discount_type || '0',
        discount_value: discount.discount_value || 0,
        effective_date: discount.effective_date || '',
        valid_until: discount.valid_until || '',
        max_discount_amount: discount.max_discount_amount ?? null
      })
      setEffectiveDate(compactToDateStr(discount.effective_date))
      setValidUntil(compactToDateStr(discount.valid_until))
    } else {
      // Create mode - set default values
      const { todayStr, sevenDaysStr } = getDefaultDates()
      setFormData({
        code: '',
        name: '',
        description: '',
        min_order_value: 0,
        discount_type: '0',
        discount_value: 0,
        effective_date: dateStrToCompact(todayStr),
        valid_until: dateStrToCompact(sevenDaysStr),
        max_discount_amount: null
      })
      setEffectiveDate(todayStr)
      setValidUntil(sevenDaysStr)
    }
    
    // Reset validation states when dialog opens
    setCodeError('')
    setCodeTouched(false)
    setNameError('')
    setNameTouched(false)
    setDiscountValueError('')
    setDiscountValueTouched(false)
    setEffectiveDateError('')
    setEffectiveDateTouched(false)
    setValidUntilError('')
    setValidUntilTouched(false)
  }, [discount, open])

  const handleSubmit = async () => {
    // Validate all required fields
    const isCodeValid = validateCode(formData.code, true)
    const isNameValid = validateName(formData.name, true)
    const isDiscountValueValid = validateDiscountValue(formData.discount_value, true)
    const isEffectiveDateValid = validateEffectiveDate(effectiveDate, true)
    const isValidUntilValid = validateValidUntil(validUntil, effectiveDate, true)

    if (!isCodeValid || !isNameValid || !isDiscountValueValid || !isEffectiveDateValid || !isValidUntilValid) {
      return
    }

    setLoading(true)
    try {
      // Prepare data and remove null/undefined fields
      let submitData = { ...formData }
      
      // Remove max_discount_amount if it's null or undefined
      if (submitData.max_discount_amount === null || submitData.max_discount_amount === undefined) {
        delete submitData.max_discount_amount
      }
      
      // When editing, remove 'code' field as backend doesn't allow updating it
      if (isEditMode) {
        const { code, ...dataWithoutCode } = submitData
        await onSubmit(dataWithoutCode as any)
      } else {
        await onSubmit(submitData)
      }
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='sm'>
      <DialogTitle>
        <Typography variant='h6' fontWeight={600} color='primary'>
          {isEditMode ? 'Cập nhật khuyến mãi' : 'Tạo khuyến mãi mới'}
        </Typography>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 3 }}>
        <Grid container spacing={2.5}>
          <Grid item xs={12}>
            <TextField
              label='Mã khuyến mãi'
              fullWidth
              value={formData.code}
              onChange={e => setFormData({ ...formData, code: e.target.value })}
              onBlur={handleCodeBlur}
              onFocus={handleCodeFocus}
              error={!!codeError}
              helperText={codeError}
              disabled={isEditMode}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label='Tên khuyến mãi'
              fullWidth
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              onBlur={handleNameBlur}
              onFocus={handleNameFocus}
              error={!!nameError}
              helperText={nameError}
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
              type={formData.discount_type === '1' ? 'number' : 'text'}
              label={formData.discount_type === '1' ? 'Giá trị (%)' : 'Giá trị (VNĐ)'}
              fullWidth
              value={
                formData.discount_type === '1'
                  ? formData.discount_value === 0
                    ? ''
                    : formData.discount_value
                  : formatNumber(formData.discount_value)
              }
              onChange={e => {
                if (formData.discount_type === '1') {
                  const value = e.target.value === '' ? 0 : Number(e.target.value)
                  setFormData({ ...formData, discount_value: value })
                } else {
                  const value = parseNumber(e.target.value)
                  setFormData({ ...formData, discount_value: value })
                }
              }}
              onBlur={handleDiscountValueBlur}
              onFocus={handleDiscountValueFocus}
              error={!!discountValueError}
              helperText={discountValueError}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              type='text'
              label='Đơn hàng tối thiểu (VNĐ)'
              fullWidth
              value={formatNumber(formData.min_order_value)}
              onChange={e => {
                const value = parseNumber(e.target.value)
                setFormData({ ...formData, min_order_value: value })
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              type='text'
              label='Mức giảm tối đa (VNĐ)'
              fullWidth
              value={formatNumber(formData.max_discount_amount ?? 0)}
              onChange={e => {
                const value = parseNumber(e.target.value)
                setFormData({ ...formData, max_discount_amount: value === 0 ? null : value })
              }}
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
              onBlur={handleEffectiveDateBlur}
              onFocus={handleEffectiveDateFocus}
              error={!!effectiveDateError}
              helperText={effectiveDateError}
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
              onBlur={handleValidUntilBlur}
              onFocus={handleValidUntilFocus}
              error={!!validUntilError}
              helperText={validUntilError}
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
          {loading ? (isEditMode ? 'Đang lưu...' : 'Đang tạo...') : (isEditMode ? 'Lưu' : 'Tạo mới')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DiscountEditDialog
