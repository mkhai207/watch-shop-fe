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
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Chip
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
import VisibilityIcon from '@mui/icons-material/Visibility'
import ManageSystemLayout from 'src/views/layouts/ManageSystemLayout'
import Spinner from 'src/components/spinner'
import toast from 'react-hot-toast'
import { formatCompactVN } from 'src/utils/date'
import {
  v1CreateDiscount,
  v1DeleteDiscount,
  v1GetDiscountById,
  v1GetDiscounts,
  v1UpdateDiscount,
  type TV1CreateDiscountReq,
  type TV1Discount,
  type TV1ListResponse
} from 'src/services/discount'

const DiscountPage: NextPage = () => {
  // Convert between compact yyyyMMddHHmmss and input date YYYY-MM-DD (default HHmmss=000000)
  const compactToDateStr = (compact?: string): string => {
    if (!compact || compact.length < 8) return ''
    const s = String(compact)
    return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`
  }
  const dateStrToCompact = (dateStr?: string): string => {
    if (!dateStr) return ''
    const s = dateStr.replaceAll('-', '')
    if (s.length !== 8) return ''
    return `${s}000000`
  }
  const [items, setItems] = useState<TV1Discount[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [actionLoading, setActionLoading] = useState<boolean>(false)
  const [search, setSearch] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'deleted'>('all')

  const [page, setPage] = useState<number>(1)
  const [limit, setLimit] = useState<number>(10)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [totalItems, setTotalItems] = useState<number>(0)

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = (await v1GetDiscounts({ page, limit })) as TV1ListResponse
      const data = res?.discounts
      setItems(data?.items || [])
      setTotalPages(data?.totalPages || 1)
      setTotalItems(data?.totalItems || 0)
    } catch (err: any) {
      toast.error(err?.message || 'Lỗi tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit])

  const filtered = useMemo(() => {
    const bySearch = items.filter(d => {
      if (!search) return true
      const lower = search.toLowerCase().trim()
      return (
        d.code.toLowerCase().includes(lower) ||
        d.name.toLowerCase().includes(lower) ||
        d.id.toLowerCase().includes(lower)
      )
    })
    const byStatus = bySearch.filter(d => {
      if (statusFilter === 'all') return true
      const deleted = d.del_flag === '1'
      return statusFilter === 'deleted' ? deleted : !deleted
    })
    return byStatus
  }, [items, search, statusFilter])

  // Create state
  const [openCreate, setOpenCreate] = useState<boolean>(false)
  const [createForm, setCreateForm] = useState<TV1CreateDiscountReq>({
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
  const [createEffectiveDate, setCreateEffectiveDate] = useState<string>('')
  const [createValidUntil, setCreateValidUntil] = useState<string>('')

  const handleOpenCreate = () => {
    setCreateForm({
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
    setCreateEffectiveDate('')
    setCreateValidUntil('')
    setOpenCreate(true)
  }

  const handleCreate = async () => {
    if (!createForm.code.trim()) return toast.error('Mã khuyến mãi không được để trống')
    if (!createForm.name.trim()) return toast.error('Tên khuyến mãi không được để trống')
    if (!createForm.effective_date || !createForm.valid_until) return toast.error('Vui lòng nhập ngày hiệu lực')
    try {
      setActionLoading(true)
      const res = await v1CreateDiscount(createForm)
      if ((res as any)?.discount) {
        toast.success('Tạo khuyến mãi thành công')
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

  // Edit state
  const [openEdit, setOpenEdit] = useState<boolean>(false)
  const [selected, setSelected] = useState<TV1Discount | null>(null)
  const [editForm, setEditForm] = useState<Omit<TV1CreateDiscountReq, 'code'>>({
    name: '',
    description: '',
    min_order_value: 0,
    discount_type: '0',
    discount_value: 0,
    effective_date: '',
    valid_until: ''
  })
  const [editEffectiveDate, setEditEffectiveDate] = useState<string>('')
  const [editValidUntil, setEditValidUntil] = useState<string>('')

  const handleOpenEdit = async (item: TV1Discount) => {
    try {
      setActionLoading(true)
      const res = await v1GetDiscountById(item.id)
      const full = res?.discount || item
      setSelected(full)
      setEditForm({
        name: full.name,
        description: full.description || '',
        min_order_value: full.min_order_value,
        discount_type: full.discount_type,
        discount_value: full.discount_value,
        effective_date: full.effective_date,
        valid_until: full.valid_until
      })
      setEditEffectiveDate(compactToDateStr(full.effective_date))
      setEditValidUntil(compactToDateStr(full.valid_until))
      setOpenEdit(true)
    } catch (e) {
      toast.error('Không tải được chi tiết khuyến mãi')
    } finally {
      setActionLoading(false)
    }
  }

  const handleEdit = async () => {
    if (!selected) return
    if (!editForm.name.trim()) return toast.error('Tên khuyến mãi không được để trống')
    try {
      setActionLoading(true)
      const res = await v1UpdateDiscount(selected.id, editForm)
      if ((res as any)?.success) {
        toast.success('Cập nhật khuyến mãi thành công')
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

  const handleDelete = async (item: TV1Discount) => {
    if (!confirm(`Xóa khuyến mãi "${item.name}"?`)) return
    try {
      setActionLoading(true)
      const res = await v1DeleteDiscount(item.id)
      if ((res as any)?.success) {
        toast.success('Xóa khuyến mãi thành công')
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

  // View state
  const [openView, setOpenView] = useState<boolean>(false)
  const [viewing, setViewing] = useState<TV1Discount | null>(null)
  const handleOpenView = async (item: TV1Discount) => {
    try {
      setActionLoading(true)
      const res = await v1GetDiscountById(item.id)
      setViewing(res?.discount || item)
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
          Quản lý khuyến mãi
        </Typography>
        <Button variant='contained' startIcon={<AddIcon />} onClick={handleOpenCreate}>
          Thêm khuyến mãi
        </Button>
      </Stack>

      <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: theme => `1px solid ${theme.palette.divider}`, mb: 3 }}>
        <Stack direction='row' spacing={2}>
          <TextField
            size='small'
            placeholder='Tìm theo mã, tên hoặc ID...'
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
          <Select size='small' value={limit} onChange={e => setLimit(Number(e.target.value))} sx={{ minWidth: 120 }}>
            <MenuItem value={10}>10 / trang</MenuItem>
            <MenuItem value={20}>20 / trang</MenuItem>
            <MenuItem value={50}>50 / trang</MenuItem>
          </Select>
          <Button variant='outlined' onClick={fetchData} disabled={loading}>
            Làm mới
          </Button>
          <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
            <Typography variant='body2' color='text.secondary'>
              Tổng: {totalItems}
            </Typography>
          </Box>
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
              <TableCell width={160}>Mã</TableCell>
              <TableCell>Tên</TableCell>
              <TableCell>Mô tả</TableCell>
              <TableCell align='right' width={120}>
                Loại
              </TableCell>
              <TableCell align='right' width={140}>
                Giá trị
              </TableCell>
              <TableCell align='right' width={160}>
                ĐH tối thiểu
              </TableCell>
              <TableCell width={180}>Hiệu lực</TableCell>
              <TableCell width={120}>Trạng thái</TableCell>
              <TableCell align='right' width={120}>
                Thao tác
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map(item => (
              <TableRow key={item.id} hover sx={{ opacity: item.del_flag === '1' ? 0.6 : 1 }}>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{item.id}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{item.code}</TableCell>
                <TableCell sx={{ textDecoration: item.del_flag === '1' ? 'line-through' : 'none' }}>
                  {item.name}
                </TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>{item.description || '-'}</TableCell>
                <TableCell align='right'>{item.discount_type === '1' ? 'Tỷ lệ %' : 'Cố định'}</TableCell>
                <TableCell align='right'>
                  {item.discount_type === '1' ? `${item.discount_value}%` : item.discount_value.toLocaleString('vi-VN')}
                </TableCell>
                <TableCell align='right'>{item.min_order_value?.toLocaleString('vi-VN')}</TableCell>
                <TableCell>
                  <Stack>
                    <Typography variant='caption' color='text.secondary'>
                      Từ
                    </Typography>
                    <Typography>{formatCompactVN(item.effective_date)}</Typography>
                    <Typography variant='caption' color='text.secondary' sx={{ mt: 0.5 }}>
                      Đến
                    </Typography>
                    <Typography>{formatCompactVN(item.valid_until)}</Typography>
                  </Stack>
                </TableCell>
                <TableCell width={120}>
                  {item.del_flag === '1' ? (
                    <Chip label='Đã xóa' color='error' size='small' variant='outlined' />
                  ) : (
                    <Chip label='Hoạt động' color='success' size='small' variant='outlined' />
                  )}
                </TableCell>
                <TableCell align='right'>
                  <Stack direction='row' spacing={1} justifyContent='flex-end'>
                    <IconButton size='small' onClick={() => handleOpenView(item)}>
                      <VisibilityIcon fontSize='small' />
                    </IconButton>
                    <IconButton size='small' disabled={item.del_flag === '1'} onClick={() => handleOpenEdit(item)}>
                      <EditIcon fontSize='small' />
                    </IconButton>
                    <IconButton
                      size='small'
                      color='error'
                      disabled={item.del_flag === '1'}
                      onClick={() => handleDelete(item)}
                    >
                      <DeleteIcon fontSize='small' />
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} align='center'>
                  {loading ? 'Đang tải...' : 'Không có dữ liệu'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Stack direction='row' alignItems='center' justifyContent='space-between' sx={{ mt: 2 }}>
        <Button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
          Trang trước
        </Button>
        <Typography>
          Trang {page} / {totalPages}
        </Typography>
        <Button disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
          Trang sau
        </Button>
      </Stack>

      {/* Create Dialog */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} fullWidth maxWidth='sm'>
        <DialogTitle>Thêm khuyến mãi</DialogTitle>
        <DialogContent>
          <Box component='form' onSubmit={e => e.preventDefault()} sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  label='Mã'
                  fullWidth
                  value={createForm.code}
                  onChange={e => setCreateForm({ ...createForm, code: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={8}>
                <TextField
                  label='Tên'
                  fullWidth
                  value={createForm.name}
                  onChange={e => setCreateForm({ ...createForm, name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label='Mô tả'
                  fullWidth
                  multiline
                  minRows={2}
                  value={createForm.description}
                  onChange={e => setCreateForm({ ...createForm, description: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  type='number'
                  label='Giá trị giảm'
                  fullWidth
                  value={createForm.discount_value}
                  onChange={e => setCreateForm({ ...createForm, discount_value: Number(e.target.value) })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Select
                  fullWidth
                  value={createForm.discount_type}
                  onChange={e => setCreateForm({ ...createForm, discount_type: e.target.value as any })}
                >
                  <MenuItem value='0'>Cố định</MenuItem>
                  <MenuItem value='1'>Tỷ lệ %</MenuItem>
                </Select>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  type='number'
                  label='Đơn hàng tối thiểu'
                  fullWidth
                  value={createForm.min_order_value}
                  onChange={e => setCreateForm({ ...createForm, min_order_value: Number(e.target.value) })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  type='number'
                  label='Mức giảm tối đa'
                  fullWidth
                  value={createForm.max_discount_amount ?? ''}
                  onChange={e =>
                    setCreateForm({
                      ...createForm,
                      max_discount_amount: e.target.value === '' ? null : Number(e.target.value)
                    })
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  type='date'
                  label='Hiệu lực từ'
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={createEffectiveDate}
                  onChange={e => {
                    const v = e.target.value
                    setCreateEffectiveDate(v)
                    setCreateForm({ ...createForm, effective_date: dateStrToCompact(v) })
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  type='date'
                  label='Hiệu lực đến'
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={createValidUntil}
                  onChange={e => {
                    const v = e.target.value
                    setCreateValidUntil(v)
                    setCreateForm({ ...createForm, valid_until: dateStrToCompact(v) })
                  }}
                />
              </Grid>
            </Grid>
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
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)} fullWidth maxWidth='sm'>
        <DialogTitle>Cập nhật khuyến mãi</DialogTitle>
        <DialogContent>
          <Box component='form' onSubmit={e => e.preventDefault()} sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label='Tên'
                  fullWidth
                  value={editForm.name}
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label='Mô tả'
                  fullWidth
                  multiline
                  minRows={2}
                  value={editForm.description}
                  onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  type='number'
                  label='Giá trị giảm'
                  fullWidth
                  value={editForm.discount_value}
                  onChange={e => setEditForm({ ...editForm, discount_value: Number(e.target.value) })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Select
                  fullWidth
                  value={editForm.discount_type}
                  onChange={e => setEditForm({ ...editForm, discount_type: e.target.value as any })}
                >
                  <MenuItem value='0'>Cố định</MenuItem>
                  <MenuItem value='1'>Tỷ lệ %</MenuItem>
                </Select>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  type='number'
                  label='Đơn hàng tối thiểu'
                  fullWidth
                  value={editForm.min_order_value}
                  onChange={e => setEditForm({ ...editForm, min_order_value: Number(e.target.value) })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  type='date'
                  label='Hiệu lực từ'
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={editEffectiveDate}
                  onChange={e => {
                    const v = e.target.value
                    setEditEffectiveDate(v)
                    setEditForm({ ...editForm, effective_date: dateStrToCompact(v) })
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  type='date'
                  label='Hiệu lực đến'
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={editValidUntil}
                  onChange={e => {
                    const v = e.target.value
                    setEditValidUntil(v)
                    setEditForm({ ...editForm, valid_until: dateStrToCompact(v) })
                  }}
                />
              </Grid>
            </Grid>
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
        <DialogTitle>Thông tin khuyến mãi</DialogTitle>
        <DialogContent>
          {viewing ? (
            <Box sx={{ mt: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant='subtitle2' color='text.secondary'>
                    Mã
                  </Typography>
                  <Typography sx={{ mt: 0.5 }}>{viewing.code}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant='subtitle2' color='text.secondary'>
                    Tên
                  </Typography>
                  <Typography sx={{ mt: 0.5 }}>{viewing.name}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant='subtitle2' color='text.secondary'>
                    Mô tả
                  </Typography>
                  <Typography sx={{ mt: 0.5 }}>{viewing.description || '-'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant='subtitle2' color='text.secondary'>
                    Loại
                  </Typography>
                  <Typography sx={{ mt: 0.5 }}>{viewing.discount_type === '1' ? 'Tỷ lệ %' : 'Cố định'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant='subtitle2' color='text.secondary'>
                    Giá trị
                  </Typography>
                  <Typography sx={{ mt: 0.5 }}>
                    {viewing.discount_type === '1'
                      ? `${viewing.discount_value}%`
                      : viewing.discount_value.toLocaleString('vi-VN')}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant='subtitle2' color='text.secondary'>
                    ĐH tối thiểu
                  </Typography>
                  <Typography sx={{ mt: 0.5 }}>{viewing.min_order_value?.toLocaleString('vi-VN')}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant='subtitle2' color='text.secondary'>
                    Tối đa giảm
                  </Typography>
                  <Typography sx={{ mt: 0.5 }}>
                    {viewing.max_discount_amount == null ? '-' : viewing.max_discount_amount.toLocaleString('vi-VN')}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant='subtitle2' color='text.secondary'>
                    Hiệu lực từ
                  </Typography>
                  <Typography sx={{ mt: 0.5 }}>{formatCompactVN(viewing.effective_date)}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant='subtitle2' color='text.secondary'>
                    Hiệu lực đến
                  </Typography>
                  <Typography sx={{ mt: 0.5 }}>{formatCompactVN(viewing.valid_until)}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant='subtitle2' color='text.secondary'>
                    Tạo lúc
                  </Typography>
                  <Typography sx={{ mt: 0.5 }}>{formatCompactVN(viewing.created_at)}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant='subtitle2' color='text.secondary'>
                    Tạo bởi
                  </Typography>
                  <Typography sx={{ mt: 0.5 }}>{viewing.created_by}</Typography>
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

;(DiscountPage as any).getLayout = (page: React.ReactNode) => <ManageSystemLayout>{page}</ManageSystemLayout>

export default DiscountPage
