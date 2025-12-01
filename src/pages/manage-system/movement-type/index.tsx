import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import VisibilityIcon from '@mui/icons-material/Visibility'
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
import Chip from '@mui/material/Chip'
import type { NextPage } from 'next'
import React, { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import AdvancedFilter, { FilterConfig, useAdvancedFilter } from 'src/components/advanced-filter'
import { buildBackendQuery } from 'src/components/advanced-filter/utils'
import CustomPagination from 'src/components/custom-pagination'
import Spinner from 'src/components/spinner'
import { PAGE_SIZE_OPTION } from 'src/configs/gridConfig'
import { useDebounce } from 'src/hooks/useDebounce'
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
import { formatCompactVN } from 'src/utils/date'
import ManageSystemLayout from 'src/views/layouts/ManageSystemLayout'

const MovementTypePage: NextPage = () => {
  const [items, setItems] = useState<TMovementType[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [actionLoading, setActionLoading] = useState<boolean>(false)
  const [openCreate, setOpenCreate] = useState<boolean>(false)
  const [openEdit, setOpenEdit] = useState<boolean>(false)
  const [openView, setOpenView] = useState<boolean>(false)
  const [selected, setSelected] = useState<TMovementType | null>(null)

  const [nameInput, setNameInput] = useState<string>('')
  const [codeInput, setCodeInput] = useState<string>('')
  const [descriptionInput, setDescriptionInput] = useState<string>('')

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTION[0])
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const filterConfig: FilterConfig = React.useMemo(() => {
    return {
      searchFields: [
        { key: 'name', label: 'Tên loại máy', type: 'string' },
        { key: 'code', label: 'Mã loại máy', type: 'string' }
      ],
      filterFields: [
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
        { value: 'name:asc', label: 'Tên A-Z' },
        { value: 'name:desc', label: 'Tên Z-A' },
        { value: 'code:asc', label: 'Mã A-Z' },
        { value: 'code:desc', label: 'Mã Z-A' },
        { value: 'created_at:desc', label: 'Mới nhất' },
        { value: 'created_at:asc', label: 'Cũ nhất' }
      ],
      dateRangeFields: [
        { key: 'created_at', label: 'Ngày tạo' },
        { key: 'updated_at', label: 'Ngày cập nhật' }
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
      sort: 'created_at:desc'
    }
  })

  const debouncedSearchValue = useDebounce(filterValues.search || '', 300)

  const debouncedFilterValues = React.useMemo(
    () => ({
      search: debouncedSearchValue,
      filters: filterValues.filters,
      sort: filterValues.sort,
      dateRange: filterValues.dateRange
    }),
    [debouncedSearchValue, filterValues.filters, filterValues.sort, filterValues.dateRange]
  )

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const queryParams = { ...buildBackendQuery(debouncedFilterValues, filterConfig), page, limit: pageSize }
      const res = await getMovementTypes(queryParams)
      const data = res as GetMovementTypesResponse

      if (data?.movementTypes) {
        setItems(data.movementTypes.items || [])
        setTotalItems(data.movementTypes.totalItems || 0)
        setTotalPages(data.movementTypes.totalPages || 0)
      }
    } catch (err: any) {
      toast.error(err?.message || 'Lỗi tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }, [debouncedFilterValues, page, pageSize, filterConfig])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    setPage(1)
  }, [debouncedFilterValues])

  const handleChangePagination = (newPage: number, newPageSize: number) => {
    setPage(newPage)
    setPageSize(newPageSize)
  }

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
              <TableCell width={140}>Mã</TableCell>
              <TableCell>Tên loại máy</TableCell>
              <TableCell width={120}>Trạng thái</TableCell>
              <TableCell width={140} align='right'>
                Thao tác
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((row, index) => (
              <TableRow key={row.id} hover sx={{ opacity: row.del_flag === '1' ? 0.6 : 1 }}>
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
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align='center'>
                  {loading ? 'Đang tải...' : 'Không có dữ liệu'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <Box sx={{ mt: 3, mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <CustomPagination
            page={page}
            pageSize={pageSize}
            rowLength={totalItems}
            totalPages={totalPages}
            pageSizeOptions={PAGE_SIZE_OPTION}
            onChangePagination={handleChangePagination}
          />
        </Box>
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
              <Stack spacing={2}>
                <Box>
                  <Typography variant='h6'>{selected.name}</Typography>
                  <Typography variant='body2' color='text.secondary' sx={{ fontFamily: 'monospace' }}>
                    {selected.code}
                  </Typography>
                  <Chip
                    label={selected.del_flag === '1' ? 'Đã xóa' : 'Hoạt động'}
                    color={selected.del_flag === '1' ? 'error' : 'success'}
                    size='small'
                    variant='outlined'
                    sx={{ mt: 1 }}
                  />
                </Box>
                <Box>
                  <Typography variant='subtitle2' color='text.secondary'>
                    Mô tả
                  </Typography>
                  <Typography sx={{ mt: 0.5 }}>{selected.description || '-'}</Typography>
                </Box>
                <Grid container spacing={2}>
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
              </Stack>
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
