import React, { useCallback, useEffect, useMemo, useState } from 'react'
import type { NextPage } from 'next'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
  Typography,
  Chip
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import VisibilityIcon from '@mui/icons-material/Visibility'
import ManageSystemLayout from 'src/views/layouts/ManageSystemLayout'
import { getColors, createColor, updateColor, deleteColor, getColorById } from 'src/services/color'
import type { TColor, TCreateColor, TUpdateColor, GetColorsResponse, GetColorResponse } from 'src/types/color'
import Spinner from 'src/components/spinner'
import toast from 'react-hot-toast'
import { formatCompactVN } from 'src/utils/date'
import AdvancedFilter, { FilterConfig, useAdvancedFilter, buildBackendQuery } from 'src/components/advanced-filter'
import CustomPagination from 'src/components/custom-pagination'
import { PAGE_SIZE_OPTION } from 'src/configs/gridConfig'
import { useDebounce } from 'src/hooks/useDebounce'

const ColorPage: NextPage = () => {
  const [colors, setColors] = useState<TColor[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [actionLoading, setActionLoading] = useState<boolean>(false)
  const [totalCount, setTotalCount] = useState(0)

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTION[0])

  const filterConfig: FilterConfig = React.useMemo(() => {
    return {
      searchFields: [
        { key: 'name', label: 'Tên màu', type: 'string' },
        { key: 'hex_code', label: 'Mã màu', type: 'string' }
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
        { value: 'hex_code:asc', label: 'Mã màu A-Z' },
        { value: 'hex_code:desc', label: 'Mã màu Z-A' },
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

  const handleFilterChange = useCallback(
    (newValues: typeof filterValues) => {
      setFilterValues(newValues)
    },
    [setFilterValues]
  )

  const handleFilterReset = useCallback(() => {
    resetFilter()
  }, [resetFilter])

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

  const [openCreate, setOpenCreate] = useState<boolean>(false)
  const [openEdit, setOpenEdit] = useState<boolean>(false)
  const [openView, setOpenView] = useState<boolean>(false)
  const [selected, setSelected] = useState<TColor | null>(null)
  const [viewing, setViewing] = useState<TColor | null>(null)
  const [deleteDialog, setDeleteDialog] = useState(false)
  const [deletingItem, setDeletingItem] = useState<TColor | null>(null)
  const [nameInput, setNameInput] = useState<string>('')
  const [hexInput, setHexInput] = useState<string>('')
  const [nameError, setNameError] = useState<string>('')
  const [hexError, setHexError] = useState<string>('')
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
  const handleHexChange = (value: string) => {
    setHexInput(value)
    if (hexTouched) {
      if (value && !isValidHex(value)) {
        setHexError('Định dạng hợp lệ: #RRGGBB')
      } else {
        setHexError('')
      }
    }
  }
  const handlePickColor = (hex: string) => {
    handleHexChange(hex.toUpperCase())
  }

  const handleNameBlur = () => {
    setNameTouched(true)
    if (!nameInput.trim()) {
      setNameError('Tên màu không được để trống')
    } else {
      setNameError('')
    }
  }

  const handleHexBlur = () => {
    setHexTouched(true)
    if (!hexInput.trim()) {
      setHexError('Mã màu không được để trống')
    } else if (!isValidHex(hexInput)) {
      setHexError('Định dạng hợp lệ: #RRGGBB')
    } else {
      setHexError('')
    }
  }

  // Fetch colors with pagination and filtering
  const fetchData = useCallback(
    async (queryParams?: any) => {
      try {
        setLoading(true)

        // Prepare query parameters for backend API
        const backendParams: Record<string, any> = {
          page: page.toString(),
          limit: pageSize.toString()
        }

        // Add filter parameters
        if (queryParams) {
          Object.entries(queryParams).forEach(([key, value]) => {
            if (value !== undefined && value !== '' && value !== null) {
              backendParams[key] = String(value)
            }
          })
        }

        const res = await getColors(backendParams)
        const data = res as GetColorsResponse
        let colorsData = []
        let totalItems = 0

        if (data?.colors?.items) {
          colorsData = data.colors.items
          totalItems = data.colors.totalItems || 0
        } else if (Array.isArray(data?.colors)) {
          // If backend doesn't support pagination yet, simulate it
          const allColors = data.colors

          // Apply client-side filtering for now
          let filteredColors = [...allColors]

          if (queryParams?.name) {
            const searchLower = queryParams.name.toLowerCase().trim()
            filteredColors = filteredColors.filter(
              (c: TColor) =>
                c.name.toLowerCase().includes(searchLower) ||
                c.id.toLowerCase().includes(searchLower) ||
                c.hex_code.toLowerCase().includes(searchLower)
            )
          }

          if (queryParams?.hex_code) {
            const searchLower = queryParams.hex_code.toLowerCase().trim()
            filteredColors = filteredColors.filter((c: TColor) => c.hex_code.toLowerCase().includes(searchLower))
          }

          if (queryParams?.del_flag !== undefined) {
            filteredColors = filteredColors.filter((c: TColor) => c.del_flag === queryParams.del_flag)
          }

          if (queryParams?.sort) {
            const [field, direction] = queryParams.sort.split(':')
            filteredColors.sort((a: TColor, b: TColor) => {
              let aValue: any
              let bValue: any

              switch (field) {
                case 'name':
                  aValue = a.name.toLowerCase()
                  bValue = b.name.toLowerCase()
                  break
                case 'hex_code':
                  aValue = a.hex_code.toLowerCase()
                  bValue = b.hex_code.toLowerCase()
                  break
                case 'created_at':
                  aValue = new Date(a.created_at || 0)
                  bValue = new Date(b.created_at || 0)
                  break
                default:
                  aValue = a.name.toLowerCase()
                  bValue = b.name.toLowerCase()
              }

              if (direction === 'desc') {
                return aValue < bValue ? 1 : -1
              }

              return aValue > bValue ? 1 : -1
            })
          }

          // Apply client-side pagination
          totalItems = filteredColors.length
          const startIndex = (page - 1) * pageSize
          const endIndex = startIndex + pageSize
          colorsData = filteredColors.slice(startIndex, endIndex)
        } else {
          console.log('Unknown response format:', data)
        }

        setColors(colorsData)
        setTotalCount(totalItems)
      } catch (err: any) {
        toast.error(err?.message || 'Lỗi tải dữ liệu')
        setColors([])
        setTotalCount(0)
      } finally {
        setLoading(false)
      }
    },
    [page, pageSize]
  )

  useEffect(() => {
    const queryParams = buildBackendQuery(debouncedFilterValues, filterConfig)
    fetchData(queryParams)
  }, [debouncedFilterValues, page, pageSize, filterConfig, fetchData])

  // Reset to page 1 when filter changes
  React.useEffect(() => {
    setPage(1)
  }, [filterValues])

  const paginatedData = colors

  const handleOnchangePagination = (newPage: number, newPageSize: number) => {
    if (newPageSize !== pageSize) {
      setPage(1)
      setPageSize(newPageSize)
    } else {
      setPage(newPage)
    }
  }

  const handleOpenCreate = () => {
    setNameInput('')
    setHexInput('')
    setNameError('')
    setHexError('')
    setNameTouched(false)
    setHexTouched(false)
    setOpenCreate(true)
  }

  const handleCreate = async () => {
    const payload: TCreateColor = { name: nameInput.trim(), hex_code: hexInput.trim() }
    if (!payload.name) return toast.error('Tên màu không được để trống')
    if (!payload.hex_code) return toast.error('Mã màu không được để trống')
    if (!isValidHex(payload.hex_code)) return toast.error('Mã màu không hợp lệ')
    try {
      setActionLoading(true)
      const res = await createColor(payload)
      if ((res as any)?.color) {
        toast.success('Tạo màu thành công')
        setOpenCreate(false)

        // Refresh data with current filters
        const queryParams = buildBackendQuery(debouncedFilterValues, filterConfig)
        fetchData(queryParams)
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
      setNameError('')
      setHexError('')
      setNameTouched(false)
      setHexTouched(false)
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
    if (!isValidHex(payload.hex_code)) return toast.error('Mã màu không hợp lệ')
    try {
      setActionLoading(true)
      const res = await updateColor(selected.id, payload)
      if ((res as any)?.color) {
        toast.success('Cập nhật màu thành công')
        setOpenEdit(false)
        setSelected(null)

        // Refresh data with current filters
        const queryParams = buildBackendQuery(debouncedFilterValues, filterConfig)
        fetchData(queryParams)
      } else {
        throw new Error('Cập nhật thất bại')
      }
    } catch (err: any) {
      toast.error(err?.message || 'Cập nhật thất bại')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = (color: TColor) => {
    setDeletingItem(color)
    setDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (!deletingItem) return

    try {
      setActionLoading(true)
      const res = await deleteColor(deletingItem.id)
      if ((res as any)?.color || (res as any)?.success) {
        toast.success('Xóa màu thành công')

        // Refresh data with current filters
        const queryParams = buildBackendQuery(debouncedFilterValues, filterConfig)
        fetchData(queryParams)
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

      {/* Advanced Filter */}
      <AdvancedFilter
        config={filterConfig}
        values={filterValues}
        onChange={handleFilterChange}
        onReset={handleFilterReset}
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
              <TableCell>Tên màu</TableCell>
              <TableCell width={160}>Mã màu</TableCell>
              <TableCell width={150} sx={{ whiteSpace: 'nowrap' }}>
                Ngày tạo
              </TableCell>
              <TableCell width={120} align='right'>
                Thao tác
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((color, index) => (
              <TableRow key={color.id} hover sx={{ opacity: color.del_flag === '1' ? 0.6 : 1 }}>
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
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatCompactVN(color.created_at) || '-'}</TableCell>
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
            {paginatedData.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align='center'>
                  {loading ? 'Đang tải...' : 'Không có dữ liệu'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <Box sx={{ mt: 3, mb: 3, display: 'flex', justifyContent: 'center' }}>
          <CustomPagination
            onChangePagination={handleOnchangePagination}
            pageSizeOptions={PAGE_SIZE_OPTION}
            pageSize={pageSize}
            totalPages={Math.ceil(totalCount / pageSize)}
            page={page}
            rowLength={totalCount}
            isHideShowed={false}
          />
        </Box>
      </TableContainer>

      {/* Create Dialog */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} fullWidth maxWidth='xs'>
        <DialogTitle sx={{ color: 'error.main', fontWeight: 700 }}>Thêm màu</DialogTitle>
        <DialogContent>
          <Box component='form' onSubmit={e => e.preventDefault()} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label='Tên màu'
              value={nameInput}
              onChange={e => {
                setNameInput(e.target.value)
                if (e.target.value.trim()) setNameError('')
              }}
              onBlur={handleNameBlur}
              error={nameTouched && !!nameError}
              helperText={nameTouched ? nameError || ' ' : ' '}
            />
            <TextField
              sx={{ mt: 2 }}
              fullWidth
              label='Mã màu (vd: #000000)'
              value={hexInput}
              onChange={e => handleHexChange(e.target.value)}
              onBlur={handleHexBlur}
              error={hexTouched && !!hexError}
              helperText={hexTouched ? hexError || ' ' : ' '}
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
        <DialogTitle sx={{ color: 'error.main', fontWeight: 700 }}>Cập nhật màu</DialogTitle>
        <DialogContent>
          <Box component='form' onSubmit={e => e.preventDefault()} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label='Tên màu'
              value={nameInput}
              onChange={e => {
                setNameInput(e.target.value)
                if (e.target.value.trim()) setNameError('')
              }}
              onBlur={handleNameBlur}
              error={nameTouched && !!nameError}
              helperText={nameTouched ? nameError || ' ' : ' '}
            />
            <TextField
              sx={{ mt: 2 }}
              fullWidth
              label='Mã màu (vd: #000000)'
              value={hexInput}
              onChange={e => handleHexChange(e.target.value)}
              onBlur={handleHexBlur}
              error={hexTouched && !!hexError}
              helperText={hexTouched ? hexError || ' ' : ' '}
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
      <Dialog open={openView} onClose={() => setOpenView(false)} fullWidth maxWidth='sm'>
        <DialogTitle
          sx={{
            color: 'primary.main',
            fontWeight: 700,
            borderBottom: theme => `1px solid ${theme.palette.divider}`
          }}
        >
          Thông tin màu sắc
        </DialogTitle>
        <DialogContent>
          {viewing ? (
            <Stack spacing={2} sx={{ mt: 2 }}>
              {/* Màu sắc và Tên */}
              <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Stack direction='row' spacing={2} alignItems='center'>
                  <Box
                    sx={{
                      width: 72,
                      height: 72,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      backgroundColor: viewing.hex_code,
                      flexShrink: 0
                    }}
                  />
                  <Box>
                    <Typography variant='caption' color='text.secondary'>
                      Tên màu
                    </Typography>
                    <Typography variant='body2' sx={{ mt: 0.5, fontWeight: 500 }}>
                      {viewing.name}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>

              {/* Mã màu */}
              <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography variant='caption' color='text.secondary'>
                  Mã màu (Hex)
                </Typography>
                <Typography variant='body2' sx={{ mt: 0.5, fontFamily: 'monospace' }}>
                  {viewing.hex_code}
                </Typography>
              </Paper>

              {/* Thông tin hệ thống */}
              <Stack direction='row' spacing={2}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', flex: 1 }}>
                  <Typography variant='caption' color='text.secondary'>
                    Ngày tạo
                  </Typography>
                  <Typography variant='body2' sx={{ mt: 0.5 }}>
                    {formatCompactVN(viewing.created_at) || '-'}
                  </Typography>
                </Paper>
                <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', flex: 1 }}>
                  <Typography variant='caption' color='text.secondary'>
                    Ngày cập nhật
                  </Typography>
                  <Typography variant='body2' sx={{ mt: 0.5 }}>
                    {formatCompactVN(viewing.updated_at) || '-'}
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
            Bạn có chắc chắn muốn xóa màu <strong>"{deletingItem?.name}"</strong> không?
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

;(ColorPage as any).getLayout = (page: React.ReactNode) => <ManageSystemLayout>{page}</ManageSystemLayout>

export default ColorPage
