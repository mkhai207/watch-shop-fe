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
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
import VisibilityIcon from '@mui/icons-material/Visibility'
import ManageSystemLayout from 'src/views/layouts/ManageSystemLayout'
import {
  getMovementTypes,
  createMovementType,
  updateMovementType,
  deleteMovementType,
  getMovementTypeById
} from 'src/services/movementType'
import type {
  TMovementType,
  TCreateMovementType,
  TUpdateMovementType,
  GetMovementTypesResponse,
  GetMovementTypeResponse
} from 'src/types/movementType'
import Spinner from 'src/components/spinner'
import toast from 'react-hot-toast'
import { formatCompactVN } from 'src/utils/date'

const MovementTypePage: NextPage = () => {
  const [items, setItems] = useState<TMovementType[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [actionLoading, setActionLoading] = useState<boolean>(false)
  const [search, setSearch] = useState<string>('')
  const [openCreate, setOpenCreate] = useState<boolean>(false)
  const [openEdit, setOpenEdit] = useState<boolean>(false)
  const [openView, setOpenView] = useState<boolean>(false)
  const [selected, setSelected] = useState<TMovementType | null>(null)

  const [nameInput, setNameInput] = useState<string>('')
  const [codeInput, setCodeInput] = useState<string>('')
  const [descriptionInput, setDescriptionInput] = useState<string>('')

  const total = items.length

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await getMovementTypes()
      const data = res as GetMovementTypesResponse
      setItems(data?.movementTypes?.items || [])
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
    const bySearch = items.filter(it => {
      if (!search) return true
      const lower = search.toLowerCase().trim()
      return (
        it.name.toLowerCase().includes(lower) ||
        it.code.toLowerCase().includes(lower) ||
        it.id.toLowerCase().includes(lower)
      )
    })
    const byStatus = bySearch.filter(it => {
      if (statusFilter === 'all') return true
      const deleted = it.del_flag === '1'
      return statusFilter === 'deleted' ? deleted : !deleted
    })
    return byStatus
  }, [items, search, statusFilter])

  const resetForm = () => {
    setNameInput('')
    setCodeInput('')
    setDescriptionInput('')
  }

  const handleOpenCreate = () => {
    resetForm()
    setOpenCreate(true)
  }

  const handleCreate = async () => {
    const payload: TCreateMovementType = {
      name: nameInput.trim(),
      code: codeInput.trim(),
      description: descriptionInput.trim() || null
    }
    if (!payload.name) return toast.error('Tên không được để trống')
    if (!payload.code) return toast.error('Mã không được để trống')
    try {
      setActionLoading(true)
      const res = await createMovementType(payload)
      if ((res as any)?.movementType) {
        toast.success('Tạo loại máy thành công')
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

  const handleOpenEdit = async (row: TMovementType) => {
    try {
      setActionLoading(true)
      const res = (await getMovementTypeById(row.id)) as GetMovementTypeResponse
      const full = res?.movementType || row
      setSelected(full)
      setNameInput(full.name)
      setCodeInput(full.code)
      setDescriptionInput(full.description || '')
      setOpenEdit(true)
    } catch (e) {
      toast.error('Không tải được chi tiết')
    } finally {
      setActionLoading(false)
    }
  }

  const handleEdit = async () => {
    if (!selected) return
    const payload: TUpdateMovementType = {
      name: nameInput.trim(),
      code: codeInput.trim(),
      description: descriptionInput.trim() || null
    }
    if (!payload.name) return toast.error('Tên không được để trống')
    if (!payload.code) return toast.error('Mã không được để trống')
    try {
      setActionLoading(true)
      const res = await updateMovementType(selected.id, payload)
      if ((res as any)?.movementType) {
        toast.success('Cập nhật thành công')
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

  const handleDelete = async (row: TMovementType) => {
    if (!confirm(`Xóa loại máy "${row.name}"?`)) return
    try {
      setActionLoading(true)
      const res = await deleteMovementType(row.id)
      if ((res as any)?.movementType || (res as any)?.success) {
        toast.success('Xóa thành công')
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

  const handleOpenView = async (row: TMovementType) => {
    try {
      setActionLoading(true)
      const res = (await getMovementTypeById(row.id)) as GetMovementTypeResponse
      setSelected(res?.movementType || row)
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
          Quản lý loại máy
        </Typography>
        <Button variant='contained' startIcon={<AddIcon />} onClick={handleOpenCreate}>
          Thêm loại máy
        </Button>
      </Stack>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ borderRadius: 2, border: theme => `1px solid ${theme.palette.divider}` }}>
            <CardContent>
              <Typography variant='body2' color='text.secondary'>
                Tổng loại máy
              </Typography>
              <Typography variant='h5' fontWeight={700} sx={{ my: 1 }}>
                {total || 'N/A'}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                Đang quản lý
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: theme => `1px solid ${theme.palette.divider}`, mb: 3 }}>
        <Stack direction='row' spacing={2}>
          <TextField
            size='small'
            placeholder='Tìm theo tên, mã hoặc ID...'
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
              <TableCell width={140}>Mã</TableCell>
              <TableCell>Tên loại máy</TableCell>
              <TableCell width={120}>Trạng thái</TableCell>
              <TableCell width={140} align='right'>
                Thao tác
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map(row => (
              <TableRow key={row.id} hover sx={{ opacity: row.del_flag === '1' ? 0.6 : 1 }}>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.id}</TableCell>
                <TableCell sx={{ fontFamily: 'monospace' }}>{row.code}</TableCell>
                <TableCell sx={{ textDecoration: row.del_flag === '1' ? 'line-through' : 'none' }}>
                  {row.name}
                </TableCell>
                <TableCell width={120}>
                  {row.del_flag === '1' ? (
                    <Chip label='Đã xóa' color='error' size='small' variant='outlined' />
                  ) : (
                    <Chip label='Hoạt động' color='success' size='small' variant='outlined' />
                  )}
                </TableCell>
                <TableCell align='right'>
                  <Stack direction='row' spacing={1} justifyContent='flex-end'>
                    <IconButton size='small' onClick={() => handleOpenView(row)}>
                      <VisibilityIcon fontSize='small' />
                    </IconButton>
                    <IconButton size='small' disabled={row.del_flag === '1'} onClick={() => handleOpenEdit(row)}>
                      <EditIcon fontSize='small' />
                    </IconButton>
                    <IconButton
                      size='small'
                      color='error'
                      disabled={row.del_flag === '1'}
                      onClick={() => handleDelete(row)}
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
        <DialogTitle>Thêm loại máy</DialogTitle>
        <DialogContent>
          <Box component='form' onSubmit={e => e.preventDefault()} sx={{ mt: 1 }}>
            <TextField
              autoFocus
              fullWidth
              label='Tên loại máy'
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
            />
            <TextField
              sx={{ mt: 2 }}
              fullWidth
              label='Mã (không dấu, viết hoa)'
              value={codeInput}
              onChange={e => setCodeInput(e.target.value)}
            />
            <TextField
              sx={{ mt: 2 }}
              fullWidth
              multiline
              minRows={2}
              label='Mô tả'
              value={descriptionInput}
              onChange={e => setDescriptionInput(e.target.value)}
            />
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
        <DialogTitle>Cập nhật loại máy</DialogTitle>
        <DialogContent>
          <Box component='form' onSubmit={e => e.preventDefault()} sx={{ mt: 1 }}>
            <TextField
              autoFocus
              fullWidth
              label='Tên loại máy'
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
            />
            <TextField
              sx={{ mt: 2 }}
              fullWidth
              label='Mã (không dấu, viết hoa)'
              value={codeInput}
              onChange={e => setCodeInput(e.target.value)}
            />
            <TextField
              sx={{ mt: 2 }}
              fullWidth
              multiline
              minRows={2}
              label='Mô tả'
              value={descriptionInput}
              onChange={e => setDescriptionInput(e.target.value)}
            />
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
        <DialogTitle>Thông tin loại máy</DialogTitle>
        <DialogContent>
          {selected ? (
            <Box sx={{ mt: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant='subtitle2' color='text.secondary'>
                    Mã
                  </Typography>
                  <Typography sx={{ mt: 0.5, fontFamily: 'monospace' }}>{selected.code}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant='subtitle2' color='text.secondary'>
                    Tên
                  </Typography>
                  <Typography sx={{ mt: 0.5 }}>{selected.name}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant='subtitle2' color='text.secondary'>
                    Trạng thái
                  </Typography>
                  <Typography sx={{ mt: 0.5 }}>{selected.del_flag === '1' ? 'Đã xóa' : 'Hoạt động'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant='subtitle2' color='text.secondary'>
                    Tạo lúc
                  </Typography>
                  <Typography sx={{ mt: 0.5 }}>{formatCompactVN(selected.created_at) || '-'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant='subtitle2' color='text.secondary'>
                    Cập nhật lúc
                  </Typography>
                  <Typography sx={{ mt: 0.5 }}>{formatCompactVN(selected.updated_at) || '-'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant='subtitle2' color='text.secondary'>
                    Tạo bởi
                  </Typography>
                  <Typography sx={{ mt: 0.5 }}>{selected.created_by || '-'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant='subtitle2' color='text.secondary'>
                    Cập nhật bởi
                  </Typography>
                  <Typography sx={{ mt: 0.5 }}>{selected.updated_by || '-'}</Typography>
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

;(MovementTypePage as any).getLayout = (page: React.ReactNode) => <ManageSystemLayout>{page}</ManageSystemLayout>

export default MovementTypePage
