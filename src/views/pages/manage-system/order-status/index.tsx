import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  alpha,
  useTheme
} from '@mui/material'
import { Add, Delete, Edit, Visibility } from '@mui/icons-material'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import Spinner from 'src/components/spinner'
import {
  getOrderStatusList,
  deleteOrderStatus,
  OrderStatus,
  CreateOrderStatusRequest,
  UpdateOrderStatusRequest
} from 'src/services/orderStatus'
import OrderStatusForm from './OrderStatusForm'

const OrderStatusManagement = () => {
  const { t } = useTranslation()
  const theme = useTheme()

  const [orderStatuses, setOrderStatuses] = useState<OrderStatus[]>([])
  const [loading, setLoading] = useState(false)
  const [openForm, setOpenForm] = useState(false)
  const [editingStatus, setEditingStatus] = useState<OrderStatus | null>(null)
  const [deleteDialog, setDeleteDialog] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchOrderStatuses = async () => {
    try {
      setLoading(true)
      const response = await getOrderStatusList()
      setOrderStatuses(response.orderStatuses.rows || [])
    } catch (error: any) {
      toast.error(error?.message || 'Có lỗi xảy ra khi tải danh sách trạng thái đơn hàng')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrderStatuses()
  }, [])

  const handleCreate = () => {
    setEditingStatus(null)
    setOpenForm(true)
  }

  const handleEdit = (status: OrderStatus) => {
    setEditingStatus(status)
    setOpenForm(true)
  }

  const handleDelete = (id: string) => {
    setDeletingId(id)
    setDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (!deletingId) return

    try {
      setLoading(true)
      await deleteOrderStatus(deletingId)
      toast.success('Xóa trạng thái đơn hàng thành công')
      await fetchOrderStatuses()
    } catch (error: any) {
      toast.error(error?.message || 'Có lỗi xảy ra khi xóa trạng thái đơn hàng')
    } finally {
      setLoading(false)
      setDeleteDialog(false)
      setDeletingId(null)
    }
  }

  const handleFormSubmit = async () => {
    setOpenForm(false)
    setEditingStatus(null)
    await fetchOrderStatuses()
  }

  const getStatusColor = (hexCode: string) => {
    return hexCode || theme.palette.primary.main
  }

  if (loading && orderStatuses.length === 0) {
    return <Spinner />
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant='h4' fontWeight={600}>
          Quản lý trạng thái đơn hàng
        </Typography>
        <Button
          variant='contained'
          startIcon={<Add />}
          onClick={handleCreate}
          sx={{
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 600
          }}
        >
          Thêm trạng thái mới
        </Button>
      </Box>

      <Card>
        <CardContent>
          <TableContainer component={Paper} sx={{ boxShadow: 0 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                  <TableCell sx={{ fontWeight: 600 }}>Mã trạng thái</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Tên trạng thái</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Mô tả</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Màu sắc</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Thứ tự</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Ngày tạo</TableCell>
                  <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orderStatuses.map(status => (
                  <TableRow key={status.id} hover>
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
                    <TableCell>
                      <Typography variant='body2' color='text.secondary'>
                        {status.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={status.color}
                        size='small'
                        sx={{
                          backgroundColor: alpha(getStatusColor(status.hex_code), 0.1),
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
                        {new Date(status.created_at).toLocaleDateString('vi-VN')}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <IconButton
                          size='small'
                          onClick={() => handleEdit(status)}
                          sx={{
                            color: theme.palette.primary.main,
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.primary.main, 0.1)
                            }
                          }}
                        >
                          <Edit fontSize='small' />
                        </IconButton>
                        <IconButton
                          size='small'
                          onClick={() => handleDelete(status.id)}
                          sx={{
                            color: theme.palette.error.main,
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.error.main, 0.1)
                            }
                          }}
                        >
                          <Delete fontSize='small' />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Create/Edit Form Dialog */}
      <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth='md' fullWidth>
        <DialogTitle>{editingStatus ? 'Chỉnh sửa trạng thái đơn hàng' : 'Thêm trạng thái đơn hàng mới'}</DialogTitle>
        <DialogContent>
          <OrderStatusForm status={editingStatus} onSubmit={handleFormSubmit} onCancel={() => setOpenForm(false)} />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa trạng thái đơn hàng này không? Hành động này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Hủy</Button>
          <Button onClick={confirmDelete} color='error' variant='contained' disabled={loading}>
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default OrderStatusManagement
