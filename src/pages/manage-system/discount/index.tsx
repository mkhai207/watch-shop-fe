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
import VisibilityIcon from '@mui/icons-material/Visibility'
import ManageSystemLayout from 'src/views/layouts/ManageSystemLayout'
import Spinner from 'src/components/spinner'
import toast from 'react-hot-toast'
import { formatCompactVN } from 'src/utils/date'
import AdvancedFilter, { FilterConfig, useAdvancedFilter } from 'src/components/advanced-filter'
import CustomPagination from 'src/components/custom-pagination'
import { PAGE_SIZE_OPTION } from 'src/configs/gridConfig'
import {
  v1CreateDiscount,
  v1DeleteDiscount,
  v1GetDiscountById,
  v1GetDiscounts,
  v1UpdateDiscount,
  type TV1CreateDiscountReq,
  type TV1Discount
} from 'src/services/discount'

const DiscountPage: NextPage = () => {
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

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTION[0])

  const filterConfig: FilterConfig = React.useMemo(() => {
    return {
      searchFields: [
        { key: 'name', label: 'Tên khuyến mãi', type: 'string' },
        { key: 'code', label: 'Mã khuyến mãi', type: 'string' }
      ],
      filterFields: [
        {
          key: 'discount_type',
          label: 'Loại khuyến mãi',
          type: 'select',
          operator: 'eq',
          options: [
            { value: '0', label: 'Cố định' },
            { value: '1', label: 'Phần trăm' }
          ]
        },
        {
          key: 'del_flag',
          label: 'Trạng thái',
          type: 'select',
          operator: 'eq',
          options: [
            { value: '0', label: 'Hoạt động' },
            { value: '1', label: 'Đã xóa' }
          ]
        }
      ],
      sortOptions: [
        { value: 'name_asc', label: 'Tên A-Z' },
        { value: 'name_desc', label: 'Tên Z-A' },
        { value: 'code_asc', label: 'Mã A-Z' },
        { value: 'code_desc', label: 'Mã Z-A' },
        { value: 'created_at_desc', label: 'Mới nhất' },
        { value: 'created_at_asc', label: 'Cũ nhất' }
      ],
      dateRangeFields: [
        { key: 'created_at', label: 'Ngày tạo' },
        { key: 'updated_at', label: 'Ngày cập nhật' },
        { key: 'effective_date', label: 'Ngày bắt đầu' },
        { key: 'valid_until', label: 'Ngày kết thúc' }
      ]
    }
  }, [])

  const {
    values: filterValues,
    setValues: setFilterValues,
    reset: resetFilter
  } = useAdvancedFilter({
    config: filterConfig,
    initialValues: {
      search: '',
      filters: {},
      sort: 'created_at_desc'
    }
  })

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await v1GetDiscounts()
      const allDiscounts = response?.discounts?.items || []
      setItems(allDiscounts)
    } catch (err: any) {
      toast.error(err?.message || 'Lỗi tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const filtered = useMemo(() => {
    let result = [...items]

    if (filterValues.search) {
      const searchLower = filterValues.search.toLowerCase().trim()
      result = result.filter(
        d => (d.name && d.name.toLowerCase().includes(searchLower)) || d.code.toLowerCase().includes(searchLower)
      )
    }

    Object.entries(filterValues.filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        if (key === 'discount_type') {
          result = result.filter(d => d.discount_type === value)
        } else if (key === 'del_flag') {
          result = result.filter(d => (d as any).del_flag === value)
        }
      }
    })

    if (filterValues.sort) {
      const [field, direction] = filterValues.sort.split('_')
      result.sort((a, b) => {
        let aValue: any
        let bValue: any

        switch (field) {
          case 'name':
            aValue = (a.name || '').toLowerCase()
            bValue = (b.name || '').toLowerCase()
            break
          case 'code':
            aValue = a.code.toLowerCase()
            bValue = b.code.toLowerCase()
            break
          case 'created':
            aValue = new Date(a.created_at || 0)
            bValue = new Date(b.created_at || 0)
            break
          default:
            aValue = (a.name || '').toLowerCase()
            bValue = (b.name || '').toLowerCase()
        }

        if (direction === 'desc') {
          return aValue < bValue ? 1 : -1
        }

        return aValue > bValue ? 1 : -1
      })
    }

    return result
  }, [items, filterValues])

  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize

    return filtered.slice(startIndex, endIndex)
  }, [filtered, page, pageSize])

  const totalPages = Math.ceil(filtered.length / pageSize)

  const handleChangePagination = (newPage: number, newPageSize: number) => {
    setPage(newPage)
    setPageSize(newPageSize)
  }

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

  const [openEdit, setOpenEdit] = useState<boolean>(false)
  const [selected, setSelected] = useState<any>(null)
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

  const handleOpenEdit = async (item: any) => {
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

  const handleDelete = async (item: any) => {
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

  const [openView, setOpenView] = useState<boolean>(false)
  const [viewing, setViewing] = useState<any>(null)
  const handleOpenView = async (item: any) => {
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

      {/* Advanced Filter */}
      <AdvancedFilter
        config={filterConfig}
        values={filterValues}
        onChange={setFilterValues}
        onReset={resetFilter}
        loading={loading}
      />

      <TableContainer
        component={Paper}
        elevation={0}
        sx={{ borderRadius: 2, border: theme => `1px solid ${theme.palette.divider}` }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell
                width={80}
                sx={{
                  position: 'sticky',
                  left: 0,
                  zIndex: 1,
                  backgroundColor: 'background.paper'
                }}
              >
                STT
              </TableCell>
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
            {paginatedData.map((item, index) => (
              <TableRow key={item.id} hover sx={{ opacity: (item as any).del_flag === '1' ? 0.6 : 1 }}>
                <TableCell
                  sx={{
                    position: 'sticky',
                    left: 0,
                    zIndex: 1,
                    backgroundColor: 'background.paper',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {(page - 1) * pageSize + index + 1}
                </TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{item.code}</TableCell>
                <TableCell sx={{ textDecoration: (item as any).del_flag === '1' ? 'line-through' : 'none' }}>
                  {item.name}
                </TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>{item.description || '-'}</TableCell>
                <TableCell align='right'>{item.discount_type === '1' ? 'Phần trăm' : 'Cố định'}</TableCell>
                <TableCell align='right'>
                  {item.discount_type === '1'
                    ? `${item.discount_value}%`
                    : Number(item.discount_value).toLocaleString('vi-VN')}
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
                  {(item as any).del_flag === '1' ? (
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
                    <IconButton
                      size='small'
                      disabled={(item as any).del_flag === '1'}
                      onClick={() => handleOpenEdit(item)}
                    >
                      <EditIcon fontSize='small' />
                    </IconButton>
                    <IconButton
                      size='small'
                      color='error'
                      disabled={(item as any).del_flag === '1'}
                      onClick={() => handleDelete(item)}
                    >
                      <DeleteIcon fontSize='small' />
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
            {paginatedData.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} align='center'>
                  {loading ? 'Đang tải...' : 'Không có dữ liệu'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <Box sx={{ mt: 2, mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <CustomPagination
            page={page}
            pageSize={pageSize}
            rowLength={filtered.length}
            totalPages={totalPages}
            pageSizeOptions={PAGE_SIZE_OPTION}
            onChangePagination={handleChangePagination}
          />
        </Box>
      </TableContainer>

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
                  <Typography sx={{ mt: 0.5 }}>{viewing.discount_type === '1' ? 'Phần trăm' : 'Cố định'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant='subtitle2' color='text.secondary'>
                    Giá trị
                  </Typography>
                  <Typography sx={{ mt: 0.5 }}>
                    {viewing.discount_type === '1'
                      ? `${viewing.discount_value}%`
                      : Number(viewing.discount_value).toLocaleString('vi-VN')}
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
