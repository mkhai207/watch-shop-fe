import React, { useEffect, useMemo, useState } from 'react'
import type { NextPage } from 'next'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Chip from '@mui/material/Chip'
import { Card, CardContent } from '@mui/material'
import StarRoundedIcon from '@mui/icons-material/StarRounded'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
import VisibilityIcon from '@mui/icons-material/Visibility'
import ManageSystemLayout from 'src/views/layouts/ManageSystemLayout'
import { getColors, createColor, updateColor, deleteColor, getColorById } from 'src/services/color'
import type { TColor, TCreateColor, TUpdateColor, GetColorsResponse, GetColorResponse } from 'src/types/color'
import Spinner from 'src/components/spinner'
import toast from 'react-hot-toast'
import { formatCompactVN } from 'src/utils/date'

const ColorPage: NextPage = () => {
  const [colors, setColors] = useState<TColor[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [actionLoading, setActionLoading] = useState<boolean>(false)
  const [search, setSearch] = useState<string>('')
  const [openCreate, setOpenCreate] = useState<boolean>(false)
  const [openEdit, setOpenEdit] = useState<boolean>(false)
  const [selected, setSelected] = useState<TColor | null>(null)
  const [nameInput, setNameInput] = useState<string>('')
  const [hexInput, setHexInput] = useState<string>('')
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
  const handleHexChange = (value: string) => {
    setHexInput(value)
  }
  const handlePickColor = (hex: string) => {
    handleHexChange(hex.toUpperCase())
  }

  const totalColors = colors.length
  const totalProducts = 0
  const avgRating = undefined as number | undefined
  const newColors = undefined as number | undefined

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await getColors()
      const data = res as GetColorsResponse
      setColors(data?.colors?.rows || [])
    } catch (err: any) {
      toast.error(err?.message || 'Lỗi tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'deleted'>('all')
  const filtered = useMemo(() => {
    const bySearch = colors.filter(c => {
      if (!search) return true
      const lower = search.toLowerCase().trim()
      return (
        c.name.toLowerCase().includes(lower) ||
        c.id.toLowerCase().includes(lower) ||
        c.hex_code.toLowerCase().includes(lower)
      )
    })
    const byStatus = bySearch.filter(c => {
      if (statusFilter === 'all') return true
      const deleted = c.del_flag === '1'
      return statusFilter === 'deleted' ? deleted : !deleted
    })
    return byStatus
  }, [colors, search, statusFilter])

  const handleOpenCreate = () => {
    setNameInput('')
    setHexInput('')
    setOpenCreate(true)
  }

  const handleCreate = async () => {
    const payload: TCreateColor = { name: nameInput.trim(), hex_code: hexInput.trim() }
    if (!payload.name) return toast.error('Tên màu không được để trống')
    if (!payload.hex_code) return toast.error('Mã màu không được để trống')
    try {
      setActionLoading(true)
      const res = await createColor(payload)
      if ((res as any)?.color) {
        toast.success('Tạo màu thành công')
        setOpenCreate(false)
        fetchData()
      } else {
        throw new Error('Tạo thất bại')
      }
    } catch (err: any) {
      toast.error(err?.message || 'Tạo thất bại')
    } finally {
      setActionLoading(false)
    }
  }

  const handleOpenEdit = async (color: TColor) => {
    try {
      setActionLoading(true)
      const res = (await getColorById(color.id)) as GetColorResponse
      const full = res?.color || color
      setSelected(full)
      setNameInput(full.name)
      setHexInput(full.hex_code)
      setOpenEdit(true)
    } catch (e) {
      toast.error('Không tải được chi tiết màu')
    } finally {
      setActionLoading(false)
    }
  }

  const handleEdit = async () => {
    if (!selected) return
    const payload: TUpdateColor = { name: nameInput.trim(), hex_code: hexInput.trim() }
    if (!payload.name) return toast.error('Tên màu không được để trống')
    if (!payload.hex_code) return toast.error('Mã màu không được để trống')
    try {
      setActionLoading(true)
      const res = await updateColor(selected.id, payload)
      if ((res as any)?.color) {
        toast.success('Cập nhật màu thành công')
        setOpenEdit(false)
        setSelected(null)
        fetchData()
      } else {
        throw new Error('Cập nhật thất bại')
      }
    } catch (err: any) {
      toast.error(err?.message || 'Cập nhật thất bại')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async (color: TColor) => {
    if (!confirm(`Xóa màu "${color.name}"?`)) return
    try {
      setActionLoading(true)
      const res = await deleteColor(color.id)
      if ((res as any)?.color || (res as any)?.success) {
        toast.success('Xóa màu thành công')
        fetchData()
      } else {
        throw new Error('Xóa thất bại')
      }
    } catch (err: any) {
      toast.error(err?.message || 'Xóa thất bại')
    } finally {
      setActionLoading(false)
    }
  }

  const [openView, setOpenView] = useState<boolean>(false)
  const [viewing, setViewing] = useState<TColor | null>(null)
  const handleOpenView = async (color: TColor) => {
    try {
      setActionLoading(true)
      const res = (await getColorById(color.id)) as GetColorResponse
      setViewing(res?.color || color)
      setOpenView(true)
    } catch (e) {
      toast.error('Không tải được chi tiết')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <>
      {(loading || actionLoading) && <Spinner />}
      <Stack direction='row' alignItems='center' justifyContent='space-between' sx={{ mb: 3 }}>
        <Typography variant='h5' fontWeight={700}>
          Quản lý màu sắc
        </Typography>
        <Button variant='contained' startIcon={<AddIcon />} onClick={handleOpenCreate}>
          Thêm màu
        </Button>
      </Stack>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card elevation={0} sx={{ borderRadius: 2, border: theme => `1px solid ${theme.palette.divider}` }}>
            <CardContent>
              <Typography variant='body2' color='text.secondary'>
                Tổng màu
              </Typography>
              <Typography variant='h5' fontWeight={700} sx={{ my: 1 }}>
                {totalColors || 'N/A'}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                {totalColors ? `${totalColors} đang hoạt động` : 'N/A'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card elevation={0} sx={{ borderRadius: 2, border: theme => `1px solid ${theme.palette.divider}` }}>
            <CardContent>
              <Typography variant='body2' color='text.secondary'>
                Tổng sản phẩm
              </Typography>
              <Typography variant='h5' fontWeight={700} sx={{ my: 1 }}>
                {totalProducts || 'N/A'}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                Từ tất cả màu
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card elevation={0} sx={{ borderRadius: 2, border: theme => `1px solid ${theme.palette.divider}` }}>
            <CardContent>
              <Typography variant='body2' color='text.secondary'>
                Đánh giá trung bình
              </Typography>
              <Stack direction='row' alignItems='center' spacing={1} sx={{ my: 1 }}>
                <Typography variant='h5' fontWeight={700}>
                  {typeof avgRating === 'number' ? avgRating.toFixed(1) : 'N/A'}
                </Typography>
                {typeof avgRating === 'number' && <StarRoundedIcon sx={{ color: 'warning.main' }} />}
              </Stack>
              <Typography variant='caption' color='text.secondary'>
                Trên 5 sao
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card elevation={0} sx={{ borderRadius: 2, border: theme => `1px solid ${theme.palette.divider}` }}>
            <CardContent>
              <Typography variant='body2' color='text.secondary'>
                Màu mới
              </Typography>
              <Typography variant='h5' fontWeight={700} sx={{ my: 1 }}>
                {typeof newColors === 'number' ? newColors : 'N/A'}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                Trong tháng này
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: theme => `1px solid ${theme.palette.divider}`, mb: 3 }}>
        <Stack direction='row' spacing={2}>
          <TextField
            size='small'
            placeholder='Tìm theo tên, ID hoặc mã màu...'
            value={search}
            onChange={e => setSearch(e.target.value)}
            InputProps={{ startAdornment: (<SearchIcon fontSize='small' />) as any }}
            sx={{ maxWidth: 360 }}
          />
          <Select
            size='small'
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value='all'>Tất cả trạng thái</MenuItem>
            <MenuItem value='active'>Hoạt động</MenuItem>
            <MenuItem value='deleted'>Đã xóa</MenuItem>
          </Select>
          <Button variant='outlined' onClick={fetchData} disabled={loading}>
            Làm mới
          </Button>
        </Stack>
      </Paper>

      <TableContainer
        component={Paper}
        elevation={0}
        sx={{ borderRadius: 2, border: theme => `1px solid ${theme.palette.divider}` }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width={90}>ID</TableCell>
              <TableCell>Tên màu</TableCell>
              <TableCell width={140}>Mã màu</TableCell>
              <TableCell width={120}>Trạng thái</TableCell>
              <TableCell width={120} align='right'>
                Thao tác
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map(color => (
              <TableRow key={color.id} hover sx={{ opacity: color.del_flag === '1' ? 0.6 : 1 }}>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{color.id}</TableCell>
                <TableCell sx={{ textDecoration: color.del_flag === '1' ? 'line-through' : 'none' }}>
                  {color.name}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        border: '1px solid',
                        borderColor: 'divider',
                        backgroundColor: color.hex_code
                      }}
                    />
                    <Typography variant='body2' sx={{ fontFamily: 'monospace' }}>
                      {color.hex_code}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell width={120}>
                  {color.del_flag === '1' ? (
                    <Chip label='Đã xóa' color='error' size='small' variant='outlined' />
                  ) : (
                    <Chip label='Hoạt động' color='success' size='small' variant='outlined' />
                  )}
                </TableCell>
                <TableCell align='right'>
                  <Stack direction='row' spacing={1} justifyContent='flex-end'>
                    <IconButton size='small' onClick={() => handleOpenView(color)}>
                      <VisibilityIcon fontSize='small' />
                    </IconButton>
                    <IconButton size='small' disabled={color.del_flag === '1'} onClick={() => handleOpenEdit(color)}>
                      <EditIcon fontSize='small' />
                    </IconButton>
                    <IconButton
                      size='small'
                      color='error'
                      disabled={color.del_flag === '1'}
                      onClick={() => handleDelete(color)}
                    >
                      <DeleteIcon fontSize='small' />
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align='center'>
                  {loading ? 'Đang tải...' : 'Không có dữ liệu'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create Dialog */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} fullWidth maxWidth='xs'>
        <DialogTitle>Thêm màu</DialogTitle>
        <DialogContent>
          <Box component='form' onSubmit={e => e.preventDefault()} sx={{ mt: 1 }}>
            <TextField
              autoFocus
              fullWidth
              label='Tên màu'
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
            />
            <TextField
              sx={{ mt: 2 }}
              fullWidth
              label='Mã màu (vd: #000000)'
              value={hexInput}
              onChange={e => handleHexChange(e.target.value)}
              helperText={hexInput && !isValidHex(hexInput) ? 'Định dạng hợp lệ: #RRGGBB' : ' '}
              error={!!hexInput && !isValidHex(hexInput)}
            />
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
              <input
                type='color'
                value={isValidHex(hexInput) ? hexInput : '#000000'}
                onChange={e => handlePickColor(e.target.value)}
                style={{ width: 48, height: 32, border: 'none', background: 'transparent' }}
              />
              <Typography variant='body2' color='text.secondary'>
                Chọn nhanh từ bảng màu
              </Typography>
            </Box>
            <Box sx={{ mt: 1, display: 'grid', gridTemplateColumns: 'repeat(10, 24px)', gap: 1 }}>
              {PRESET_COLORS.map(color => {
                const selected = isValidHex(hexInput) && hexInput.toUpperCase() === color.toUpperCase()
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
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreate(false)}>Hủy</Button>
          <Button variant='contained' onClick={handleCreate}>
            Tạo
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)} fullWidth maxWidth='xs'>
        <DialogTitle>Cập nhật màu</DialogTitle>
        <DialogContent>
          <Box component='form' onSubmit={e => e.preventDefault()} sx={{ mt: 1 }}>
            <TextField
              autoFocus
              fullWidth
              label='Tên màu'
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
            />
            <TextField
              sx={{ mt: 2 }}
              fullWidth
              label='Mã màu (vd: #000000)'
              value={hexInput}
              onChange={e => handleHexChange(e.target.value)}
              helperText={hexInput && !isValidHex(hexInput) ? 'Định dạng hợp lệ: #RRGGBB' : ' '}
              error={!!hexInput && !isValidHex(hexInput)}
            />
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
              <input
                type='color'
                value={isValidHex(hexInput) ? hexInput : '#000000'}
                onChange={e => handlePickColor(e.target.value)}
                style={{ width: 48, height: 32, border: 'none', background: 'transparent' }}
              />
              <Typography variant='body2' color='text.secondary'>
                Chọn nhanh từ bảng màu
              </Typography>
            </Box>
            <Box sx={{ mt: 1, display: 'grid', gridTemplateColumns: 'repeat(10, 24px)', gap: 1 }}>
              {PRESET_COLORS.map(color => {
                const selected = isValidHex(hexInput) && hexInput.toUpperCase() === color.toUpperCase()
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
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEdit(false)}>Hủy</Button>
          <Button variant='contained' onClick={handleEdit}>
            Lưu
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={openView} onClose={() => setOpenView(false)} fullWidth maxWidth='xs'>
        <DialogTitle>Thông tin màu</DialogTitle>
        <DialogContent>
          {viewing ? (
            <Box sx={{ mt: 1 }}>
              <Stack direction='row' spacing={2} alignItems='center'>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    border: '1px solid',
                    borderColor: 'divider',
                    backgroundColor: viewing.hex_code
                  }}
                />
                <Box>
                  <Typography variant='h6'>{viewing.name}</Typography>
                  <Chip label={viewing.hex_code} size='small' variant='outlined' />
                </Box>
              </Stack>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant='subtitle2' color='text.secondary'>
                    Tạo lúc
                  </Typography>
                  <Typography sx={{ mt: 0.5 }}>{formatCompactVN(viewing.created_at) || '-'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant='subtitle2' color='text.secondary'>
                    Cập nhật lúc
                  </Typography>
                  <Typography sx={{ mt: 0.5 }}>{formatCompactVN(viewing.updated_at) || '-'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant='subtitle2' color='text.secondary'>
                    Tạo bởi
                  </Typography>
                  <Typography sx={{ mt: 0.5 }}>{viewing.created_by || '-'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant='subtitle2' color='text.secondary'>
                    Cập nhật bởi
                  </Typography>
                  <Typography sx={{ mt: 0.5 }}>{viewing.updated_by || '-'}</Typography>
                </Grid>
              </Grid>
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenView(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

;(ColorPage as any).getLayout = (page: React.ReactNode) => <ManageSystemLayout>{page}</ManageSystemLayout>

export default ColorPage
