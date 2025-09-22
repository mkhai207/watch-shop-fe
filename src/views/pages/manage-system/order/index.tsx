import React, { useState, useEffect } from 'react'
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  IconButton,
  Chip,
  Grid,
  InputAdornment
} from '@mui/material'
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  ShoppingCart as ShoppingCartIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material'
import CustomPagination from 'src/components/custom-pagination'
import { PAGE_SIZE_OPTION } from 'src/configs/gridConfig'
import qs from 'qs'
import { getListOrders, Order } from 'src/services/order'
import EditOrderModal from './components/EditOrderModal'
import AddOrderModal from './components/AddOrderModal'

const cellStyle = {
  maxWidth: 150,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  textAlign: 'center' as const,
  padding: '12px 8px'
}

const ellipsisStyle: React.CSSProperties = {
  maxWidth: 120,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  display: 'inline-block',
  verticalAlign: 'middle'
}

const StatusCell = ({ status }: { status: string }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'UNPAID':
        return '#f44336'
      case 'PAID':
        return '#4caf50'
      case 'PENDING':
        return '#ff9800'
      case 'SHIPPING':
        return '#2196f3'
      case 'CANCELLED':
        return '#f44336'
      case 'COMPLETED':
        return '#4caf50'
      default:
        return '#9e9e9e'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'UNPAID':
        return 'Chưa thanh toán'
      case 'PAID':
        return 'Đã thanh toán'
      case 'PENDING':
        return 'Chờ xác nhận'
      case 'SHIPPING':
        return 'Đang giao'
      case 'CANCELED':
        return 'Đã hủy'
      case 'COMPLETED':
        return 'Đã hoàn thành'
      default:
        return status
    }
  }

  return (
    <TableCell sx={cellStyle}>
      <Chip
        label={getStatusText(status)}
        sx={{
          backgroundColor: getStatusColor(status),
          color: 'white',
          fontWeight: 'bold',
          fontSize: '0.75rem',
          minWidth: 80
        }}
        size='small'
      />
    </TableCell>
  )
}

const PaymentMethodCell = ({ method }: { method: string }) => {
  const getMethodText = (method: string) => {
    switch (method) {
      case 'ONLINE':
        return 'Thanh toán online'
      case 'CASH':
        return 'Thanh toán khi nhận hàng'
      default:
        return method
    }
  }

  return (
    <TableCell sx={cellStyle}>
      <Typography variant='body2' sx={{ fontWeight: 500 }}>
        {getMethodText(method)}
      </Typography>
    </TableCell>
  )
}

const ManageOrderPage: React.FC = () => {
  // State declarations
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTION[0])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error] = useState('')
  const [editModal, setEditModal] = useState(false)
  const [editOrder, setEditOrder] = useState<Order | null>(null)
  const [addModal, setAddModal] = useState(false)
  const [orders, setOrders] = useState<{
    data: any[]
    total: number
    totalPages: number
    currentPage: number
  }>({
    data: [],
    total: 0,
    totalPages: 0,
    currentPage: 1
  })
  const [searchBy, setSearchBy] = useState('')
  const [filters, setFilters] = useState<{
    status: string
    paymentMethod: string
  }>({ status: '', paymentMethod: '' })

  const formatFiltersForAPI = () => {
    const params: Record<string, any> = {
      page: page || 1,
      limit: pageSize || 10,
      sort: 'created_at:desc'
    }

    if (searchBy?.trim()) {
      params.name = `like:${searchBy.trim()}`
    }

    if (filters.status) {
      params.status = filters.status
    }

    Object.keys(params).forEach(key => {
      if (
        params[key] === undefined ||
        params[key] === null ||
        (Array.isArray(params[key]) && params[key].length === 0)
      ) {
        delete params[key]
      }
    })

    return params
  }

  const handleGetListOrders = async () => {
    try {
      setLoading(true)

      const queryParams = formatFiltersForAPI()

      const response = await getListOrders({
        params: queryParams,
        paramsSerializer: params => qs.stringify(params, { arrayFormat: 'repeat', encode: false })
      })

      if (response.status === 'success') {
        setLoading(false)
        setOrders({
          data: response.data || [],
          total: response.meta?.totalItems || 0,
          totalPages: response.meta?.totalPages || 0,
          currentPage: response.meta?.currentPage || 1
        })
      }
    } catch (error: any) {
      setLoading(false)
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  // Load orders from API
  useEffect(() => {
    handleGetListOrders()
  }, [page, pageSize, searchBy, filters])

  // Handlers
  const handleEdit = (order: Order) => {
    setEditOrder(order)
    setEditModal(true)
  }

  const handleSaveEdit = () => {
    // TODO: Implement save edit functionality
    console.log('Save edit order:', editOrder)
    setEditModal(false)
  }

  const handleAdd = () => {
    setAddModal(true)
  }

  const handleSaveAdd = async () => {
    await handleGetListOrders()
    setAddModal(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
  }

  const handleOnchangePagination = (page: number, pageSize: number) => {
    setPage(page)
    setPageSize(pageSize)
  }

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        minHeight: '100vh',
        maxWidth: '100vw',
        p: 4,
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        overflowX: 'hidden',
        backgroundColor: '#f5f5f5'
      }}
    >
      {/* Header Section */}
      <Card sx={{ mb: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <ShoppingCartIcon sx={{ fontSize: 32, color: 'primary.main' }} />
              <Typography variant='h4' fontWeight='bold' color='primary'>
                Quản lý đơn hàng
              </Typography>
            </Box>
            <Button
              variant='contained'
              startIcon={<AddIcon />}
              onClick={handleAdd}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1.5,
                textTransform: 'none',
                fontWeight: 'bold',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}
            >
              Thêm đơn hàng
            </Button>
          </Box>

          {error && (
            <Alert severity='error' sx={{ mb: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Filters Section */}
      <Card sx={{ mb: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <FilterIcon sx={{ color: 'primary.main' }} />
            <Typography variant='h6' fontWeight='bold'>
              Bộ lọc tìm kiếm
            </Typography>
          </Box>

          <Grid container spacing={3} alignItems='flex-end'>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                size='small'
                fullWidth
                placeholder='Tìm kiếm theo tên, SĐT'
                value={searchBy}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setSearchBy(e.target.value)
                  setPage(1)
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <SearchIcon />
                    </InputAdornment>
                  )
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl size='small' fullWidth>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={filters.status}
                  onChange={(e: SelectChangeEvent) => {
                    setFilters({ ...filters, status: e.target.value })
                    setPage(1)
                  }}
                  label='Trạng thái'
                  sx={{
                    borderRadius: 2
                  }}
                >
                  <MenuItem value=''>Tất cả</MenuItem>
                  <MenuItem value='PENDING'>Chờ xác nhận</MenuItem>
                  <MenuItem value='UNPAID'>Chưa thanh toán</MenuItem>
                  <MenuItem value='PAID'>Đã thanh toán</MenuItem>
                  <MenuItem value='SHIPPING'>Đang giao</MenuItem>
                  <MenuItem value='COMPLETED'>Đã hoàn thành</MenuItem>
                  <MenuItem value='CANCELLED'>Đã hủy</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl size='small' fullWidth>
                <InputLabel>Thanh toán</InputLabel>
                <Select
                  value={filters.paymentMethod}
                  onChange={(e: SelectChangeEvent) => {
                    setFilters({ ...filters, paymentMethod: e.target.value })
                    setPage(1)
                  }}
                  label='Thanh toán'
                  sx={{
                    borderRadius: 2
                  }}
                >
                  <MenuItem value=''>Tất cả</MenuItem>
                  <MenuItem value='ONLINE'>Thanh toán online</MenuItem>
                  <MenuItem value='CASH'>Thanh toán khi nhận hàng</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant='outlined'
                startIcon={<RefreshIcon />}
                onClick={() => {
                  setSearchBy('')
                  setFilters({ status: '', paymentMethod: '' })
                  setPage(1)
                }}
                fullWidth
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  textTransform: 'none',
                  fontWeight: 'bold'
                }}
              >
                Làm mới
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Table Section */}
      {loading ? (
        <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <CardContent sx={{ p: 4 }}>
            <Box display='flex' justifyContent='center' alignItems='center' minHeight='300px'>
              <CircularProgress size={60} />
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'primary.main' }}>
                  {[
                    'ID',
                    'Ngày tạo',
                    'Người tạo',
                    'Ngày cập nhật',
                    'Người cập nhật',
                    'Tên khách hàng',
                    'Phương thức thanh toán',
                    'Số điện thoại',
                    'Địa chỉ giao hàng',
                    'Trạng thái',
                    'Mã giảm giá',
                    'Tổng tiền',
                    'Hành động'
                  ].map(header => (
                    <TableCell
                      key={header}
                      sx={{
                        textAlign: 'center',
                        fontWeight: 'bold',
                        whiteSpace: 'nowrap',
                        padding: '16px 8px',
                        color: 'white',
                        backgroundColor: 'primary.main',
                        borderBottom: '2px solid #1976d2'
                      }}
                    >
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.data.length > 0 ? (
                  orders.data.map((order: any, index: number) => (
                    <TableRow
                      key={order.id}
                      sx={{
                        '&:hover': {
                          backgroundColor: '#f5f5f5',
                          transition: 'background-color 0.2s ease'
                        },
                        backgroundColor: index % 2 === 0 ? '#ffffff' : '#fafafa'
                      }}
                    >
                      <TableCell sx={{ textAlign: 'center', fontWeight: 'bold', color: 'primary.main' }}>
                        #{order.id}
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>{formatDate(order.created_at)}</TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Tooltip title={order.created_by}>
                          <span style={ellipsisStyle}>{order.created_by}</span>
                        </Tooltip>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>{formatDate(order.updated_at)}</TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Tooltip title={order.updated_by}>
                          <span style={ellipsisStyle}>{order.updated_by}</span>
                        </Tooltip>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Tooltip title={order.name}>
                          <span style={ellipsisStyle}>{order.name}</span>
                        </Tooltip>
                      </TableCell>
                      <PaymentMethodCell method={order.payment_method} />
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Tooltip title={order.phone}>
                          <span style={ellipsisStyle}>{order.phone}</span>
                        </Tooltip>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Tooltip title={order.shipping_address}>
                          <span style={ellipsisStyle}>{order.shipping_address}</span>
                        </Tooltip>
                      </TableCell>
                      <StatusCell status={order.status} />
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Tooltip title={order.discount_id || 'Không có'}>
                          <span style={ellipsisStyle}>{order.discount_id || '-'}</span>
                        </Tooltip>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center', fontWeight: 'bold', color: 'success.main' }}>
                        <Tooltip title={formatCurrency(order.total_money)}>
                          <span style={ellipsisStyle}>{formatCurrency(order.total_money)}</span>
                        </Tooltip>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <IconButton
                          color='primary'
                          size='small'
                          onClick={() => handleEdit(order)}
                          sx={{
                            backgroundColor: 'primary.light',
                            color: 'white',
                            '&:hover': {
                              backgroundColor: 'primary.main'
                            }
                          }}
                        >
                          <EditIcon fontSize='small' />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={13} sx={{ textAlign: 'center', py: 8 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <ShoppingCartIcon sx={{ fontSize: 64, color: 'grey.400' }} />
                        <Typography variant='h6' color='text.secondary'>
                          Không có đơn hàng nào
                        </Typography>
                        <Typography variant='body2' color='text.secondary'>
                          Hãy thêm đơn hàng mới để bắt đầu
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {orders.totalPages > 1 && (
            <Box sx={{ p: 3, borderTop: '1px solid #e0e0e0' }}>
              <CustomPagination
                onChangePagination={handleOnchangePagination}
                pageSizeOptions={PAGE_SIZE_OPTION}
                pageSize={pageSize}
                totalPages={orders.totalPages}
                page={page}
                rowLength={10}
                isHideShowed
              />
            </Box>
          )}
        </Card>
      )}

      {/* Edit Order Dialog */}
      <EditOrderModal
        open={editModal}
        onClose={() => setEditModal(false)}
        editOrder={editOrder}
        setEditOrder={setEditOrder}
        onSave={handleSaveEdit}
        onSuccess={() => {
          handleGetListOrders()
          setEditModal(false)
        }}
      />

      {/* Add Order Dialog */}
      <AddOrderModal open={addModal} onClose={() => setAddModal(false)} onSave={handleSaveAdd} loading={loading} />
    </Box>
  )
}

export default ManageOrderPage
