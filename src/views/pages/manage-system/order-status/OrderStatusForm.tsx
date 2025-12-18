import { Box, Button, Grid, TextField, Typography, alpha, useTheme } from '@mui/material'
import { useState, useEffect, useMemo } from 'react'
import toast from 'react-hot-toast'
import {
  createOrderStatus,
  updateOrderStatus,
  OrderStatus,
  CreateOrderStatusRequest,
  UpdateOrderStatusRequest
} from 'src/services/orderStatus'

interface OrderStatusFormProps {
  status: OrderStatus | null
  onSubmit: () => void
  onCancel: () => void
}

const OrderStatusForm = ({ status, onSubmit, onCancel }: OrderStatusFormProps) => {
  const theme = useTheme()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    hex_code: '#2196F3',
    color: '',
    sort_order: 1
  })
  const [codeError, setCodeError] = useState<string>('')
  const [nameError, setNameError] = useState<string>('')
  const [hexError, setHexError] = useState<string>('')
  const [codeTouched, setCodeTouched] = useState<boolean>(false)
  const [nameTouched, setNameTouched] = useState<boolean>(false)
  const [hexTouched, setHexTouched] = useState<boolean>(false)

  const PRESET_COLORS = useMemo(
    () => [
      '#000000',
      '#FFFFFF',
      '#FF0000',
      '#00FF00',
      '#0000FF',
      '#FFFF00',
      '#FFA500',
      '#800080',
      '#00FFFF',
      '#FFC0CB',
      '#8B4513',
      '#808080',
      '#A52A2A',
      '#2F4F4F',
      '#FFD700',
      '#1E90FF',
      '#32CD32',
      '#FF69B4',
      '#4B0082',
      '#DC143C'
    ],
    []
  )

  const isValidHex = (value: string) => /^#([0-9A-Fa-f]{6})$/.test(value)

  useEffect(() => {
    if (status) {
      setFormData({
        code: status.code,
        name: status.name,
        description: status.description,
        hex_code: status.hex_code,
        color: status.color,
        sort_order: status.sort_order
      })
      setCodeError('')
      setNameError('')
      setHexError('')
      setCodeTouched(false)
      setNameTouched(false)
      setHexTouched(false)
    }
  }, [status])

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }))
  }

  const handleHexChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      hex_code: value
    }))
    if (hexTouched) {
      if (!value.trim()) {
        setHexError('Mã màu không được để trống')
      } else if (!isValidHex(value)) {
        setHexError('Định dạng hợp lệ: #RRGGBB')
      } else {
        setHexError('')
      }
    }
  }

  const handlePickColor = (hex: string) => {
    handleHexChange(hex.toUpperCase())
  }

  const handleCodeBlur = () => {
    setCodeTouched(true)
    if (!formData.code.trim()) {
      setCodeError('Mã trạng thái không được để trống')
    } else {
      setCodeError('')
    }
  }

  const handleNameBlur = () => {
    setNameTouched(true)
    if (!formData.name.trim()) {
      setNameError('Tên trạng thái không được để trống')
    } else {
      setNameError('')
    }
  }

  const handleHexBlur = () => {
    setHexTouched(true)
    if (!formData.hex_code.trim()) {
      setHexError('Mã màu không được để trống')
    } else if (!isValidHex(formData.hex_code)) {
      setHexError('Định dạng hợp lệ: #RRGGBB')
    } else {
      setHexError('')
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!formData.code.trim() || !formData.name.trim()) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc')
      return
    }

    try {
      setLoading(true)

      if (status) {
        // Update existing status
        const updateData: UpdateOrderStatusRequest = {
          code: formData.code,
          name: formData.name,
          description: formData.description,
          hex_code: formData.hex_code,
          color: formData.color,
          sort_order: formData.sort_order
        }
        await updateOrderStatus(status.id, updateData)
        toast.success('Cập nhật trạng thái đơn hàng thành công')
      } else {
        // Create new status
        const createData: CreateOrderStatusRequest = {
          code: formData.code,
          name: formData.name,
          description: formData.description,
          hex_code: formData.hex_code,
          color: formData.color,
          sort_order: formData.sort_order
        }
        await createOrderStatus(createData)
        toast.success('Tạo trạng thái đơn hàng thành công')
      }

      onSubmit()
    } catch (error: any) {
      // Handle specific error cases
      if (error?.response?.status === 409) {
        toast.error('Thứ tự sắp xếp này đã tồn tại. Vui lòng chọn thứ tự khác.')
      } else if (error?.message?.includes('already exists') || error?.message?.includes('already exits')) {
        toast.error('Thứ tự sắp xếp này đã tồn tại. Vui lòng chọn thứ tự khác.')
      } else {
        toast.error(error?.message || 'Có lỗi xảy ra khi lưu trạng thái đơn hàng')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box component='form' onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label='Thứ tự sắp xếp'
            type='number'
            value={formData.sort_order}
            onChange={handleChange('sort_order')}
            inputProps={{ min: 1 }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label='Mã trạng thái *'
            value={formData.code}
            onChange={e => {
              handleChange('code')(e)
              if (codeTouched && e.target.value.trim()) {
                setCodeError('')
              }
            }}
            onBlur={handleCodeBlur}
            placeholder='VD: PENDING, PAID, SHIPPING'
            error={codeTouched && !!codeError}
            helperText={codeTouched ? codeError || ' ' : ' '}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label='Tên trạng thái *'
            value={formData.name}
            onChange={e => {
              handleChange('name')(e)
              if (nameTouched && e.target.value.trim()) {
                setNameError('')
              }
            }}
            onBlur={handleNameBlur}
            placeholder='VD: Chờ xác nhận, Đã thanh toán'
            error={nameTouched && !!nameError}
            helperText={nameTouched ? nameError || ' ' : ' '}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label='Mô tả'
            value={formData.description}
            onChange={handleChange('description')}
            placeholder='Mô tả chi tiết về trạng thái'
            multiline
            rows={3}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label='Mã màu hex *'
            value={formData.hex_code}
            onChange={e => handleHexChange(e.target.value)}
            onBlur={handleHexBlur}
            placeholder='#2196F3'
            helperText={hexTouched ? hexError || ' ' : ' '}
            error={hexTouched && !!hexError}
            InputProps={{
              startAdornment: (
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: '4px',
                    backgroundColor: formData.hex_code,
                    border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                    mr: 1
                  }}
                />
              )
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label='Tên màu'
            value={formData.color}
            onChange={handleChange('color')}
            placeholder='VD: Blue, Green, Orange'
          />
        </Grid>

        {/* Color Picker Section */}
        <Grid item xs={12}>
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <input
              type='color'
              value={isValidHex(formData.hex_code) ? formData.hex_code : '#000000'}
              onChange={e => handlePickColor(e.target.value)}
              style={{ width: 48, height: 32, border: 'none', background: 'transparent' }}
            />
            <Typography variant='body2' color='text.secondary'>
              Chọn nhanh từ bảng màu
            </Typography>
          </Box>
          <Box sx={{ mt: 1, display: 'grid', gridTemplateColumns: 'repeat(10, 24px)', gap: 1 }}>
            {PRESET_COLORS.map(color => {
              const selected = isValidHex(formData.hex_code) && formData.hex_code.toUpperCase() === color.toUpperCase()
              return (
                <Box
                  key={color}
                  onClick={() => handlePickColor(color)}
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    border: '1px solid',
                    borderColor: selected ? 'primary.main' : 'divider',
                    boxShadow: selected ? '0 0 0 2px rgba(25,118,210,0.3)' : 'none',
                    cursor: 'pointer',
                    backgroundColor: color
                  }}
                  title={color}
                />
              )
            })}
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', gap: 2, mt: 4, justifyContent: 'flex-end' }}>
        <Button variant='outlined' onClick={onCancel} disabled={loading}>
          Hủy
        </Button>
        <Button type='submit' variant='contained' disabled={loading}>
          {loading ? 'Đang lưu...' : status ? 'Cập nhật' : 'Tạo mới'}
        </Button>
      </Box>
    </Box>
  )
}

export default OrderStatusForm
