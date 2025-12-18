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
  createStrapMaterial,
  deleteStrapMaterial,
  getStrapMaterialById,
  getStrapMaterials,
  updateStrapMaterial
} from 'src/services/strapMaterial'
import type {
  GetStrapMaterialResponse,
  GetStrapMaterialsResponse,
  TCreateStrapMaterial,
  TStrapMaterial,
  TUpdateStrapMaterial
} from 'src/types/strapMaterial'
import { formatCompactVN } from 'src/utils/date'
import ManageSystemLayout from 'src/views/layouts/ManageSystemLayout'

const StrapMaterialPage: NextPage = () => {
  const [items, setItems] = useState<TStrapMaterial[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [actionLoading, setActionLoading] = useState<boolean>(false)
  const [openCreate, setOpenCreate] = useState<boolean>(false)
  const [openEdit, setOpenEdit] = useState<boolean>(false)
  const [openView, setOpenView] = useState<boolean>(false)
  const [selected, setSelected] = useState<TStrapMaterial | null>(null)
  const [deleteDialog, setDeleteDialog] = useState(false)
  const [deletingItem, setDeletingItem] = useState<TStrapMaterial | null>(null)

  const [nameInput, setNameInput] = useState<string>('')
  const [codeInput, setCodeInput] = useState<string>('')
  const [extraMoneyInput, setExtraMoneyInput] = useState<string>('')
  const [descriptionInput, setDescriptionInput] = useState<string>('')

  const [nameError, setNameError] = useState<string>('')
  const [codeError, setCodeError] = useState<string>('')
  const [extraMoneyError, setExtraMoneyError] = useState<string>('')
  const [nameTouched, setNameTouched] = useState<boolean>(false)
  const [codeTouched, setCodeTouched] = useState<boolean>(false)
  const [extraMoneyTouched, setExtraMoneyTouched] = useState<boolean>(false)

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTION[0])
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const filterConfig: FilterConfig = React.useMemo(() => {
    return {
      searchFields: [
        { key: 'name', label: 'Tên vật liệu', type: 'string' },
        { key: 'code', label: 'Mã vật liệu', type: 'string' }
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
        { value: 'extra_money:asc', label: 'Phụ thu thấp đến cao' },
        { value: 'extra_money:desc', label: 'Phụ thu cao đến thấp' },
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
      const res = await getStrapMaterials(queryParams)
      const data = res as GetStrapMaterialsResponse

      const items = data?.strapMaterials?.items || data?.strapMaterials?.rows || []
      const total = data?.strapMaterials?.totalItems || data?.strapMaterials?.count || 0
      const pages = data?.strapMaterials?.totalPages || Math.ceil(total / pageSize)

      setItems(items)
      setTotalItems(total)
      setTotalPages(pages)
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
    setExtraMoneyInput('')
    setDescriptionInput('')
    setNameError('')
    setCodeError('')
    setExtraMoneyError('')
    setNameTouched(false)
    setCodeTouched(false)
    setExtraMoneyTouched(false)
  }

  const handleOpenCreate = () => {
    resetForm()
    setOpenCreate(true)
  }

  const handleNameBlur = () => {
    setNameTouched(true)
    if (!nameInput.trim()) {
      setNameError('Tên vật liệu không được để trống')
    } else {
      setNameError('')
    }
  }

  const handleCodeBlur = () => {
    setCodeTouched(true)
    if (!codeInput.trim()) {
      setCodeError('Mã vật liệu không được để trống')
    } else {
      setCodeError('')
    }
  }

  const handleExtraMoneyBlur = () => {
    setExtraMoneyTouched(true)
    if (!extraMoneyInput.trim()) {
      setExtraMoneyError('Phụ thu không được để trống')
    } else {
      const value = parseMoney(extraMoneyInput)
      if (value < 0) {
        setExtraMoneyError('Phụ thu không được âm')
      } else {
        setExtraMoneyError('')
      }
    }
  }

  const parseMoney = (value: string): number => {
    // Loại bỏ dấu chấm (thousand separator) trước khi parse
    const num = Number((value || '').replace(/\./g, '').replace(/[^0-9-]/g, ''))

    return isNaN(num) ? 0 : num
  }

  const formatMoney = (value: string): string => {
    const num = value.replace(/[^0-9]/g, '')
    if (!num) return ''

    return Number(num).toLocaleString('vi-VN')
  }

  const handleExtraMoneyChange = (value: string) => {
    const formatted = formatMoney(value)
    setExtraMoneyInput(formatted)
    if (extraMoneyTouched) {
      if (!formatted.trim()) {
        setExtraMoneyError('Phụ thu không được để trống')
      } else if (parseMoney(formatted) < 0) {
        setExtraMoneyError('Phụ thu không được âm')
      } else {
        setExtraMoneyError('')
      }
    }
  }

  const handleCreate = async () => {
    const payload: TCreateStrapMaterial = {
      name: nameInput.trim(),
      code: codeInput.trim(),
      description: descriptionInput.trim() || '',
      extra_money: parseMoney(extraMoneyInput)
    }
    if (!payload.name) return toast.error('Tên không được để trống')
    if (!payload.code) return toast.error('Mã không được để trống')
    try {
      setActionLoading(true)
      const res = await createStrapMaterial(payload)
      if ((res as any)?.strapMaterial) {
        toast.success('Tạo vật liệu dây đeo thành công')
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

  const handleOpenEdit = async (row: TStrapMaterial) => {
    try {
      setActionLoading(true)
      const res = (await getStrapMaterialById(row.id)) as GetStrapMaterialResponse
      const full = res?.strapMaterial || row
      setSelected(full)
      setNameInput(full.name)
      setCodeInput(full.code)
      setExtraMoneyInput((full.extra_money || 0).toLocaleString('vi-VN'))
      setDescriptionInput(full.description || '')
      setNameError('')
      setCodeError('')
      setExtraMoneyError('')
      setNameTouched(false)
      setCodeTouched(false)
      setExtraMoneyTouched(false)
      setOpenEdit(true)
    } catch (e) {
      toast.error('Không tải được chi tiết')
    } finally {
      setActionLoading(false)
    }
  }

  const handleEdit = async () => {
    if (!selected) return
    const payload: TUpdateStrapMaterial = {
      name: nameInput.trim(),
      code: codeInput.trim(),
      description: descriptionInput.trim() || '',
      extra_money: parseMoney(extraMoneyInput)
    }
    if (!payload.name) return toast.error('Tên không được để trống')
    if (!payload.code) return toast.error('Mã không được để trống')
    try {
      setActionLoading(true)
      const res = await updateStrapMaterial(selected.id, payload)
      if ((res as any)?.strapMaterial) {
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

  const handleDelete = (row: TStrapMaterial) => {
    setDeletingItem(row)
    setDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (!deletingItem) return

    try {
      setActionLoading(true)
      const res = await deleteStrapMaterial(deletingItem.id)
      if ((res as any)?.strapMaterial || (res as any)?.success) {
        toast.success('Xóa thành công')
        fetchData()
      } else {
        throw new Error('Xóa thất bại')
      }
    } catch (err: any) {
      toast.error(err?.message || 'Xóa thất bại')
    } finally {
      setActionLoading(false)
      setDeleteDialog(false)
      setDeletingItem(null)
    }
  }

  const handleOpenView = async (row: TStrapMaterial) => {
    try {
      setActionLoading(true)
      const res = (await getStrapMaterialById(row.id)) as GetStrapMaterialResponse
      setSelected(res?.strapMaterial || row)
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
          Quản lý vật liệu dây đeo
        </Typography>
        <Button variant='contained' startIcon={<AddIcon />} onClick={handleOpenCreate}>
          Thêm vật liệu
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
              <TableCell>Tên vật liệu</TableCell>
              <TableCell width={160} align='right'>
                Giá (VNĐ)
              </TableCell>
              <TableCell width={150} sx={{ whiteSpace: 'nowrap' }}>
                Ngày tạo
              </TableCell>
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
                <TableCell align='right'>{(row.extra_money || 0).toLocaleString('vi-VN')}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatCompactVN(row.created_at) || '-'}</TableCell>
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
                <TableCell colSpan={6} align='center'>
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
        <DialogTitle sx={{ color: 'error.main', fontWeight: 700 }}>Thêm vật liệu dây đeo</DialogTitle>
        <DialogContent>
          <Box component='form' onSubmit={e => e.preventDefault()} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label='Tên vật liệu'
              value={nameInput}
              onChange={e => {
                setNameInput(e.target.value)
                if (nameTouched && e.target.value.trim()) {
                  setNameError('')
                }
              }}
              onBlur={handleNameBlur}
              error={nameTouched && !!nameError}
              helperText={nameTouched ? nameError || ' ' : ' '}
            />
            <TextField
              sx={{ mt: 2 }}
              fullWidth
              label='Mã (không dấu, viết hoa)'
              value={codeInput}
              onChange={e => {
                setCodeInput(e.target.value)
                if (codeTouched && e.target.value.trim()) {
                  setCodeError('')
                }
              }}
              onBlur={handleCodeBlur}
              error={codeTouched && !!codeError}
              helperText={codeTouched ? codeError || ' ' : ' '}
            />
            <TextField
              sx={{ mt: 2 }}
              fullWidth
              label='Phụ thu (VNĐ)'
              value={extraMoneyInput}
              onChange={e => handleExtraMoneyChange(e.target.value)}
              onBlur={handleExtraMoneyBlur}
              error={extraMoneyTouched && !!extraMoneyError}
              helperText={extraMoneyTouched ? extraMoneyError || ' ' : ' '}
              placeholder='VD: 100.000'
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
        <DialogTitle sx={{ color: 'error.main', fontWeight: 700 }}>Cập nhật vật liệu dây đeo</DialogTitle>
        <DialogContent>
          <Box component='form' onSubmit={e => e.preventDefault()} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label='Tên vật liệu'
              value={nameInput}
              onChange={e => {
                setNameInput(e.target.value)
                if (nameTouched && e.target.value.trim()) {
                  setNameError('')
                }
              }}
              onBlur={handleNameBlur}
              error={nameTouched && !!nameError}
              helperText={nameTouched ? nameError || ' ' : ' '}
            />
            <TextField
              sx={{ mt: 2 }}
              fullWidth
              label='Mã (không dấu, viết hoa)'
              value={codeInput}
              onChange={e => {
                setCodeInput(e.target.value)
                if (codeTouched && e.target.value.trim()) {
                  setCodeError('')
                }
              }}
              onBlur={handleCodeBlur}
              error={codeTouched && !!codeError}
              helperText={codeTouched ? codeError || ' ' : ' '}
            />
            <TextField
              sx={{ mt: 2 }}
              fullWidth
              label='Phụ thu (VNĐ)'
              value={extraMoneyInput}
              onChange={e => handleExtraMoneyChange(e.target.value)}
              onBlur={handleExtraMoneyBlur}
              error={extraMoneyTouched && !!extraMoneyError}
              helperText={extraMoneyTouched ? extraMoneyError || ' ' : ' '}
              placeholder='VD: 100.000'
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
      <Dialog open={openView} onClose={() => setOpenView(false)} fullWidth maxWidth='sm'>
        <DialogTitle
          sx={{
            color: 'primary.main',
            fontWeight: 700,
            borderBottom: theme => `1px solid ${theme.palette.divider}`
          }}
        >
          Thông tin vật liệu dây đeo
        </DialogTitle>
        <DialogContent>
          {selected ? (
            <Stack spacing={2} sx={{ mt: 2 }}>
              {/* Tên và Mã */}
              <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography variant='caption' color='text.secondary'>
                  Tên vật liệu
                </Typography>
                <Typography variant='body2' sx={{ mt: 0.5, fontWeight: 500 }}>
                  {selected.name}
                </Typography>
                <Typography variant='caption' color='text.secondary' sx={{ mt: 1, display: 'block' }}>
                  Mã: {selected.code}
                </Typography>
              </Paper>

              {/* Mô tả */}
              <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography variant='caption' color='text.secondary'>
                  Mô tả
                </Typography>
                <Typography variant='body2' sx={{ mt: 0.5 }}>
                  {selected.description || '-'}
                </Typography>
              </Paper>

              {/* Phụ thu */}
              <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography variant='caption' color='text.secondary'>
                  Phụ thu
                </Typography>
                <Typography variant='body2' sx={{ mt: 0.5, fontWeight: 600, fontSize: '1.1rem' }}>
                  {(selected.extra_money || 0).toLocaleString('vi-VN')} đ
                </Typography>
              </Paper>

              {/* Thông tin hệ thống */}
              <Stack direction='row' spacing={2}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', flex: 1 }}>
                  <Typography variant='caption' color='text.secondary'>
                    Ngày tạo
                  </Typography>
                  <Typography variant='body2' sx={{ mt: 0.5 }}>
                    {formatCompactVN(selected.created_at) || '-'}
                  </Typography>
                </Paper>
                <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', flex: 1 }}>
                  <Typography variant='caption' color='text.secondary'>
                    Ngày cập nhật
                  </Typography>
                  <Typography variant='body2' sx={{ mt: 0.5 }}>
                    {formatCompactVN(selected.updated_at) || '-'}
                  </Typography>
                </Paper>
              </Stack>
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenView(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onClose={() => !actionLoading && setDeleteDialog(false)} maxWidth='xs'>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa vật liệu dây đeo <strong>"{deletingItem?.name}"</strong> không?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)} disabled={actionLoading}>
            Hủy
          </Button>
          <Button onClick={confirmDelete} color='error' variant='contained' disabled={actionLoading}>
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

;(StrapMaterialPage as any).getLayout = (page: React.ReactNode) => <ManageSystemLayout>{page}</ManageSystemLayout>

export default StrapMaterialPage
