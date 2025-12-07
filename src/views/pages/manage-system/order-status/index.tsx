import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import VisibilityIcon from '@mui/icons-material/Visibility'
import {
  Box,
  Button,
  Chip,
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
  Typography,
  useTheme
} from '@mui/material'
import React, { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import AdvancedFilter, { FilterConfig, useAdvancedFilter } from 'src/components/advanced-filter'
import { buildBackendQuery } from 'src/components/advanced-filter/utils'
import CustomPagination from 'src/components/custom-pagination'
import Spinner from 'src/components/spinner'
import { PAGE_SIZE_OPTION } from 'src/configs/gridConfig'
import { deleteOrderStatus, getOrderStatusList, OrderStatus } from 'src/services/orderStatus'
import { useDebounce } from 'src/hooks/useDebounce'
import { formatCompactVN } from 'src/utils/date'
import OrderStatusForm from './OrderStatusForm'

const OrderStatusManagement = () => {
  const theme = useTheme()

  const [orderStatuses, setOrderStatuses] = useState<OrderStatus[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [actionLoading, setActionLoading] = useState<boolean>(false)
  const [openCreate, setOpenCreate] = useState<boolean>(false)
  const [openEdit, setOpenEdit] = useState<boolean>(false)
  const [openView, setOpenView] = useState<boolean>(false)
  const [selected, setSelected] = useState<OrderStatus | null>(null)
  const [viewing, setViewing] = useState<OrderStatus | null>(null)
  const [deleteDialog, setDeleteDialog] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTION[0])
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const filterConfig: FilterConfig = React.useMemo(() => {
    return {
      searchFields: [{ key: 'name', label: 'Tên trạng thái', type: 'string' }],
      filterFields: [],
      sortOptions: [
        { value: 'name:asc', label: 'Tên A-Z' },
        { value: 'name:desc', label: 'Tên Z-A' },
        { value: 'sort_order:asc', label: 'Thứ tự tăng dần' },
        { value: 'sort_order:desc', label: 'Thứ tự giảm dần' },
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
      sort: 'sort_order:asc'
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
    try {
      setLoading(true)
      const queryParams = { ...buildBackendQuery(debouncedFilterValues, filterConfig), page, limit: pageSize }
      const response = await getOrderStatusList(queryParams)

      if (response?.orderStatuses) {
        const data = response.orderStatuses.items || response.orderStatuses.rows || []
        const total = response.orderStatuses.totalItems || response.orderStatuses.count || 0
        const pages = response.orderStatuses.totalPages || Math.ceil(total / pageSize)

        setOrderStatuses(data)
        setTotalItems(total)
        setTotalPages(pages)
      }
    } catch (error: any) {
      toast.error(error?.message || 'Có lỗi xảy ra khi tải danh sách trạng thái đơn hàng')
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

  const handleOpenCreate = () => {
    setSelected(null)
    setOpenCreate(true)
  }

  const handleOpenEdit = (status: OrderStatus) => {
    setSelected(status)
    setOpenEdit(true)
  }

  const handleOpenView = (status: OrderStatus) => {
    setViewing(status)
    setOpenView(true)
  }

  const handleDelete = (status: OrderStatus) => {
    setDeletingId(status.id)
    setDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (!deletingId) return

    try {
      setActionLoading(true)
      await deleteOrderStatus(deletingId)
      toast.success('Xóa trạng thái đơn hàng thành công')
      await fetchData()
    } catch (error: any) {
      toast.error(error?.message || 'Có lỗi xảy ra khi xóa trạng thái đơn hàng')
    } finally {
      setActionLoading(false)
      setDeleteDialog(false)
      setDeletingId(null)
    }
  }

  const handleFormSubmit = async () => {
    setOpenCreate(false)
    setOpenEdit(false)
    setSelected(null)
    await fetchData()
  }

  const getStatusColor = (hexCode: string) => {
    return hexCode || theme.palette.primary.main
  }

  if (loading && orderStatuses.length === 0) {
    return <Spinner />
  }

  return (
    <>
      {(loading || actionLoading) && <Spinner />}

      {/* Header with title and primary action */}
      <Stack direction='row' alignItems='center' justifyContent='space-between' sx={{ mb: 3 }}>
        <Typography variant='h5' fontWeight={700}>
          Quản lý trạng thái đơn hàng
        </Typography>
        <Button variant='contained' startIcon={<AddIcon />} onClick={handleOpenCreate}>
          Thêm trạng thái đơn hàng
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
              <TableCell width={120}>Mã trạng thái</TableCell>
              <TableCell>Tên trạng thái</TableCell>
              <TableCell>Mô tả</TableCell>
              <TableCell width={120}>Màu sắc</TableCell>
              <TableCell width={100}>Thứ tự</TableCell>
              <TableCell width={120}>Ngày tạo</TableCell>
              <TableCell width={120} align='right'>
                Thao tác
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orderStatuses.map((status, index) => (
              <TableRow key={status.id} hover>
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
                <TableCell>
                  <Typography variant='body2' fontWeight={500}>
                    {status.code}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: getStatusColor(status.hex_code)
                      }}
                    />
                    <Typography variant='body2'>{status.name}</Typography>
                  </Box>
                </TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>{status.description || '-'}</TableCell>
                <TableCell>
                  <Chip
                    label={status.color}
                    size='small'
                    sx={{
                      backgroundColor:
                        theme.palette.mode === 'dark'
                          ? `${getStatusColor(status.hex_code)}20`
                          : `${getStatusColor(status.hex_code)}10`,
                      color: getStatusColor(status.hex_code),
                      fontWeight: 500
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant='body2'>{status.sort_order}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant='body2' color='text.secondary'>
                    {formatCompactVN(status.created_at) || '-'}
                  </Typography>
                </TableCell>
                <TableCell align='right'>
                  <Stack direction='row' spacing={1} justifyContent='flex-end'>
                    <IconButton size='small' onClick={() => handleOpenView(status)}>
                      <VisibilityIcon fontSize='small' />
                    </IconButton>
                    <IconButton size='small' onClick={() => handleOpenEdit(status)}>
                      <EditIcon fontSize='small' />
                    </IconButton>
                    <IconButton size='small' color='error' onClick={() => handleDelete(status)}>
                      <DeleteIcon fontSize='small' />
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
            {orderStatuses.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align='center'>
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
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth='md' fullWidth>
        <DialogTitle>Thêm trạng thái đơn hàng mới</DialogTitle>
        <DialogContent>
          <OrderStatusForm status={null} onSubmit={handleFormSubmit} onCancel={() => setOpenCreate(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)} maxWidth='md' fullWidth>
        <DialogTitle>Chỉnh sửa trạng thái đơn hàng</DialogTitle>
        <DialogContent>
          <OrderStatusForm status={selected} onSubmit={handleFormSubmit} onCancel={() => setOpenEdit(false)} />
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={openView} onClose={() => setOpenView(false)} fullWidth maxWidth='xs'>
        <DialogTitle>Thông tin trạng thái đơn hàng</DialogTitle>
        <DialogContent>
          {viewing ? (
            <Box sx={{ mt: 1 }}>
              <Stack direction='row' spacing={2} alignItems='center'>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    backgroundColor: getStatusColor(viewing.hex_code),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                />
                <Box>
                  <Typography variant='h6'>{viewing.name}</Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {viewing.code}
                  </Typography>
                </Box>
              </Stack>
              <Box sx={{ mt: 2 }}>
                <Typography variant='subtitle2' color='text.secondary'>
                  Mô tả
                </Typography>
                <Typography sx={{ mt: 0.5 }}>{viewing.description || '-'}</Typography>
              </Box>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant='subtitle2' color='text.secondary'>
                    Màu sắc
                  </Typography>
                  <Stack direction='row' spacing={1} alignItems='center' sx={{ mt: 0.5 }}>
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        backgroundColor: getStatusColor(viewing.hex_code)
                      }}
                    />
                    <Typography>{viewing.color}</Typography>
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant='subtitle2' color='text.secondary'>
                    Thứ tự
                  </Typography>
                  <Typography sx={{ mt: 0.5 }}>{viewing.sort_order}</Typography>
                </Grid>
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
              </Grid>
            </Box>
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
            Bạn có chắc chắn muốn xóa trạng thái <strong>"{orderStatuses.find(s => s.id === deletingId)?.name}"</strong>{' '}
            không?
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

export default OrderStatusManagement
