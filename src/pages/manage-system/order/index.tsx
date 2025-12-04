import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material'
import { NextPage } from 'next'
import React, { useCallback, useEffect, useState } from 'react'
import AdvancedFilter, { buildBackendQuery, FilterConfig, useAdvancedFilter } from 'src/components/advanced-filter'
import { useDebounce } from 'src/hooks/useDebounce'
import CustomPagination from 'src/components/custom-pagination'
import IconifyIcon from 'src/components/Icon'
import { CONFIG_API } from 'src/configs/api'
import { PAGE_SIZE_OPTION } from 'src/configs/gridConfig'
import instanceAxios from 'src/helpers/axios'
import ManageSystemLayout from 'src/views/layouts/ManageSystemLayout'
import { Order, OrderStatus, OrderStatusesResponse } from 'src/types/order'

const paymentMethodMap: Record<string, string> = {
  '1': 'Chuyển khoản',
  '2': 'Thẻ tín dụng',
  '3': 'COD'
}

const OrderManagementPage: NextPage = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [orderStatuses, setOrderStatuses] = useState<OrderStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingStatuses, setLoadingStatuses] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [bulkAction, setBulkAction] = useState('')
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isQuickUpdateDialogOpen, setIsQuickUpdateDialogOpen] = useState(false)
  const [quickUpdateStatus, setQuickUpdateStatus] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateProgress, setUpdateProgress] = useState(0)
  const [updateResults, setUpdateResults] = useState<
    Array<{
      orderCode: string
      success: boolean
      message?: string
    }>
  >([])
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info'
  })

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTION[0])

  // Helper functions for status labels
  const getStatusLabel = (status: OrderStatus) => {
    return `${status.sort_order}. ${status.name}`
  }

  // Sort orderStatuses by sort_order
  const sortedOrderStatuses = React.useMemo(() => {
    return [...orderStatuses].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
  }, [orderStatuses])

  const filterConfig: FilterConfig = React.useMemo(() => {
    return {
      searchFields: [{ key: 'code', label: 'Mã đơn hàng', type: 'string' }],
      filterFields: [
        {
          key: 'current_status_id',
          label: 'Trạng thái',
          type: 'select',
          operator: 'eq',
          options: sortedOrderStatuses.map(status => ({
            value: status.id,
            label: getStatusLabel(status)
          }))
        }
      ],
      sortOptions: [
        { value: 'guess_name:asc', label: 'Tên khách hàng A-Z' },
        { value: 'guess_name:desc', label: 'Tên khách hàng Z-A' }
      ],

      dateRangeFields: [{ key: 'created_at', label: 'Ngày tạo đơn hàng' }]
    }
  }, [sortedOrderStatuses])

  const {
    values: filterValues,
    setValues: setFilterValues,
    reset: resetFilters
  } = useAdvancedFilter({
    config: filterConfig,
    initialValues: {
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
    resetFilters()
  }, [resetFilters])

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

  const fetchOrderStatuses = async () => {
    try {
      setLoadingStatuses(true)
      const response = await instanceAxios.get(`${CONFIG_API.ORDER_STATUS.INDEX}`)
      const data = response.data
      console.log('Order statuses API response:', data)
      
      // Parse response format: { orderStatuses: { items: [...] } }
      const statuses = data?.orderStatuses?.items || data?.orderStatuses?.rows || []
      console.log('Parsed order statuses:', statuses.length)
      setOrderStatuses(statuses)
    } catch (error) {
      console.error('Error fetching order statuses:', error)
      setOrderStatuses([])
    } finally {
      setLoadingStatuses(false)
    }
  }

  const fetchOrders = useCallback(
    async (queryParams?: any) => {
      try {
        setLoading(true)

        const url = `${CONFIG_API.ORDER.INDEX}/all`
        const params = new URLSearchParams()

        params.set('page', page.toString())
        params.set('limit', pageSize.toString())

        if (queryParams) {
          Object.entries(queryParams).forEach(([key, value]) => {
            if (value !== undefined && value !== '' && value !== null) {
              params.set(key, String(value))
            }
          })
        }

        const finalUrl = `${url}?${params.toString()}`
        console.log('Fetching orders from:', finalUrl)

        const response = await instanceAxios.get(finalUrl)
        const data = response.data
        console.log('Orders API response:', data)
        
        let ordersData = []
        let totalItems = 0

        // Try multiple response formats
        if (data?.orders?.items) {
          ordersData = data.orders.items
          totalItems = data.orders.totalItems || data.orders.count || 0
        } else if (data?.orders?.rows) {
          ordersData = data.orders.rows
          totalItems = data.orders.count || data.orders.totalItems || 0
        } else if (Array.isArray(data?.orders)) {
          ordersData = data.orders
          totalItems = ordersData.length
        } else if (Array.isArray(data)) {
          // If data is directly an array
          ordersData = data
          totalItems = data.length
        } else if (data?.data) {
          // If data is wrapped in a data property
          if (Array.isArray(data.data)) {
            ordersData = data.data
            totalItems = data.data.length
          } else if (data.data?.orders) {
            ordersData = data.data.orders.items || data.data.orders.rows || []
            totalItems = data.data.orders.totalItems || data.data.orders.count || 0
          }
        } else {
          console.warn('Unknown response format:', data)
          console.warn('Response keys:', Object.keys(data || {}))
        }

        console.log('Parsed orders:', ordersData.length, 'Total:', totalItems)
        setOrders(ordersData)
        setTotalCount(totalItems)
      } catch (error: any) {
        console.error('Error fetching orders:', error)
        console.error('Error response:', error?.response?.data)
        setSnackbar({ 
          open: true, 
          message: error?.response?.data?.message || 'Lỗi khi tải dữ liệu đơn hàng', 
          severity: 'error' 
        })
        setOrders([])
        setTotalCount(0)
      } finally {
        setLoading(false)
      }
    },
    [page, pageSize]
  )

  useEffect(() => {
    const loadData = async () => {
      await fetchOrderStatuses()
    }
    loadData()
  }, [])

  useEffect(() => {
    // Don't wait for orderStatuses to load - fetch orders independently
    // Order statuses are only needed for filter dropdown, not for fetching orders
    const queryParams = buildBackendQuery(debouncedFilterValues, filterConfig)
    fetchOrders(queryParams)
  }, [debouncedFilterValues, page, pageSize, filterConfig, fetchOrders])

  const paginatedData = orders

  const handleOnchangePagination = (newPage: number, newPageSize: number) => {
    if (newPageSize !== pageSize) {
      setPage(1)
    } else {
      setPage(newPage)
    }
    setPageSize(newPageSize)
  }

  React.useEffect(() => {
    setPage(1)
  }, [filterValues])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    const year = dateString.substring(0, 4)
    const month = dateString.substring(4, 6)
    const day = dateString.substring(6, 8)
    const hour = dateString.substring(8, 10)
    const minute = dateString.substring(10, 12)
    const second = dateString.substring(12, 14)

    const date = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`)

    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusInfo = (statusId: string) => {
    const status = orderStatuses.find(s => s.id === statusId)

    return {
      name: status?.name || `Trạng thái ${statusId}`,
      color: status?.hex_code || '#999999',
      sortOrder: status?.sort_order || 0
    }
  }

  const getPaymentMethodChip = (paymentMethod?: string) => {
    if (!paymentMethod) return <Chip label='Chưa chọn' color='default' size='small' />
    const method = paymentMethodMap[paymentMethod] || 'Khác'

    return <Chip label={method} color='primary' size='small' />
  }

  const handleOrderSelect = (orderId: string, checked: boolean) => {
    if (checked) {
      setSelectedOrders([...selectedOrders, orderId])
    } else {
      setSelectedOrders(selectedOrders.filter(id => id !== orderId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrders(paginatedData.map(order => order.id))
    } else {
      setSelectedOrders([])
    }
  }

  const handleBulkAction = async () => {
    if (!bulkAction || selectedOrders.length === 0) return

    try {
      const updatePromises = selectedOrders.map(orderId =>
        instanceAxios.put(`${CONFIG_API.ORDER.INDEX}/${orderId}/change-status`, {
          order_status_id: parseInt(bulkAction)
        })
      )

      await Promise.all(updatePromises)

      setOrders(
        orders.map(order => {
          if (selectedOrders.includes(order.id)) {
            return { ...order, current_status_id: bulkAction }
          }

          return order
        })
      )

      setBulkAction('')
      setIsBulkDialogOpen(false)
      setSnackbar({ open: true, message: `Đã cập nhật ${selectedOrders.length} đơn hàng`, severity: 'success' })
    } catch (error) {
      console.error('Error updating orders:', error)
      setSnackbar({ open: true, message: 'Lỗi khi cập nhật đơn hàng', severity: 'error' })
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await instanceAxios.put(`${CONFIG_API.ORDER.INDEX}/${orderId}/change-status`, {
        order_status_id: parseInt(newStatus)
      })

      setOrders(orders.map(order => (order.id === orderId ? { ...order, current_status_id: newStatus } : order)))
      setSnackbar({ open: true, message: 'Đã cập nhật trạng thái đơn hàng', severity: 'success' })
    } catch (error) {
      console.error('Error updating order status:', error)
      setSnackbar({ open: true, message: 'Lỗi khi cập nhật trạng thái đơn hàng', severity: 'error' })
    }
  }

  const viewOrderDetail = (order: Order) => {
    setSelectedOrder(order)
    setIsDetailDialogOpen(true)
  }

  const handleQuickUpdate = async () => {
    if (!quickUpdateStatus || selectedOrders.length === 0) return

    setIsUpdating(true)
    setUpdateProgress(0)
    setUpdateResults([])

    const results: Array<{ orderCode: string; success: boolean; message?: string }> = []
    const totalOrders = selectedOrders.length

    for (let i = 0; i < selectedOrders.length; i++) {
      const orderId = selectedOrders[i]
      const order = orders.find(o => o.id === orderId)

      if (!order) continue

      try {
        await instanceAxios.put(`${CONFIG_API.ORDER.INDEX}/${orderId}/change-status`, {
          order_status_id: parseInt(quickUpdateStatus)
        })

        results.push({
          orderCode: order.code,
          success: true,
          message: 'Thành công'
        })

        setOrders(prevOrders =>
          prevOrders.map(o => (o.id === orderId ? { ...o, current_status_id: quickUpdateStatus } : o))
        )
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Lỗi không xác định'
        results.push({
          orderCode: order.code,
          success: false,
          message: errorMessage
        })
      }

      setUpdateProgress(((i + 1) / totalOrders) * 100)
      setUpdateResults([...results])

      await new Promise(resolve => setTimeout(resolve, 200))
    }

    setIsUpdating(false)
  }

  const totalOrders = totalCount
  const totalRevenue = orders.reduce((sum, order) => sum + order.final_amount, 0)
  const pendingOrders = orders.filter(order => order.current_status_id === '1' || order.current_status_id === '2').length
  const completedOrders = orders.filter(order => order.current_status_id === '6').length

  return (
    <>
      <Typography variant='h5' fontWeight={700} sx={{ mb: 3 }}>
        Quản lý đơn hàng
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant='body2' color='text.secondary'>
                    Tổng đơn hàng
                  </Typography>
                  <Typography variant='h4' fontWeight={700}>
                    {totalOrders}
                  </Typography>
                </Box>
                <IconifyIcon icon='mdi:shopping' width={40} height={40} color='primary.main' />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant='body2' color='text.secondary'>
                    Tổng doanh thu
                  </Typography>
                  <Typography variant='h4' fontWeight={700}>
                    {formatPrice(totalRevenue)}
                  </Typography>
                </Box>
                <IconifyIcon icon='mdi:currency-usd' width={40} height={40} color='success.main' />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant='body2' color='text.secondary'>
                    Chờ xử lý
                  </Typography>
                  <Typography variant='h4' fontWeight={700} color='warning.main'>
                    {pendingOrders}
                  </Typography>
                </Box>
                <IconifyIcon icon='mdi:clock-outline' width={40} height={40} color='warning.main' />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant='body2' color='text.secondary'>
                    Hoàn thành
                  </Typography>
                  <Typography variant='h4' fontWeight={700} color='success.main'>
                    {completedOrders}
                  </Typography>
                </Box>
                <IconifyIcon icon='mdi:check-circle' width={40} height={40} color='success.main' />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Advanced Filter */}
      <AdvancedFilter
        config={filterConfig}
        values={filterValues}
        onChange={handleFilterChange}
        onReset={handleFilterReset}
        loading={loading}
        compact={false}
      />

      {/* Orders Table */}
      <Card sx={{ borderRadius: 2, mt: 3 }}>
        <CardHeader
          title='Danh sách đơn hàng'
          action={
            <Button
              variant='contained'
              color='primary'
              onClick={() => {
                setUpdateResults([])
                setQuickUpdateStatus('')
                setIsQuickUpdateDialogOpen(true)
              }}
              disabled={selectedOrders.length === 0}
              startIcon={<IconifyIcon icon='mdi:update' />}
              sx={{
                textTransform: 'none',
                fontWeight: 500,
                borderRadius: 2
              }}
            >
              Cập nhật nhanh ({selectedOrders.length})
            </Button>
          }
        />
        <CardContent>
          <TableContainer>
            <Table sx={{ minWidth: 1100 }}>
              <TableHead>
                <TableRow>
                  <TableCell
                    padding='checkbox'
                    sx={{ position: 'sticky', left: 0, zIndex: 2, backgroundColor: 'background.paper' }}
                  >
                    <Checkbox
                      checked={selectedOrders.length === paginatedData.length && paginatedData.length > 0}
                      onChange={e => handleSelectAll(e.target.checked)}
                    />
                  </TableCell>
                  <TableCell
                    sx={{
                      width: 60,
                      minWidth: 60,
                      position: 'sticky',
                      left: 48,
                      zIndex: 2,
                      backgroundColor: 'background.paper'
                    }}
                  >
                    STT
                  </TableCell>
                  <TableCell
                    sx={{
                      width: 120,
                      minWidth: 120,
                      position: 'sticky',
                      left: 108,
                      zIndex: 2,
                      backgroundColor: 'background.paper'
                    }}
                  >
                    Mã đơn hàng
                  </TableCell>
                  <TableCell sx={{ width: 250, minWidth: 250 }}>Khách hàng</TableCell>
                  <TableCell sx={{ width: 140, minWidth: 140 }}>Tổng tiền</TableCell>
                  <TableCell sx={{ width: 120, minWidth: 120 }}>Thanh toán</TableCell>
                  <TableCell sx={{ width: 180, minWidth: 180 }}>Ngày đặt</TableCell>
                  <TableCell
                    align='right'
                    sx={{
                      width: 150,
                      minWidth: 150,
                      position: 'sticky',
                      right: 0,
                      zIndex: 2,
                      backgroundColor: 'background.paper'
                    }}
                  >
                    Trạng thái
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} align='center' sx={{ py: 4 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                        <IconifyIcon icon='mdi:loading' className='animate-spin' />
                        Đang tải dữ liệu...
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align='center' sx={{ py: 4 }}>
                      Không có đơn hàng nào
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((order, index) => (
                    <TableRow key={order.id} hover sx={{ cursor: 'pointer' }} onClick={() => viewOrderDetail(order)}>
                      <TableCell
                        padding='checkbox'
                        onClick={e => e.stopPropagation()}
                        sx={{ position: 'sticky', left: 0, zIndex: 1, backgroundColor: 'background.paper' }}
                      >
                        <Checkbox
                          checked={selectedOrders.includes(order.id)}
                          onChange={e => handleOrderSelect(order.id, e.target.checked)}
                        />
                      </TableCell>
                      <TableCell
                        sx={{
                          width: 60,
                          minWidth: 60,
                          maxWidth: 60,
                          position: 'sticky',
                          left: 48,
                          zIndex: 1,
                          backgroundColor: 'background.paper'
                        }}
                      >
                        <Typography
                          variant='caption'
                          fontWeight={600}
                          sx={{
                            fontSize: '0.7rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            display: 'block'
                          }}
                        >
                          {(page - 1) * pageSize + index + 1}
                        </Typography>
                      </TableCell>
                      <TableCell
                        sx={{
                          width: 120,
                          minWidth: 120,
                          maxWidth: 120,
                          position: 'sticky',
                          left: 108,
                          zIndex: 1,
                          backgroundColor: 'background.paper'
                        }}
                      >
                        <Typography
                          variant='caption'
                          fontWeight={600}
                          sx={{
                            fontSize: '0.7rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            display: 'block'
                          }}
                        >
                          {order.code}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ width: 250, minWidth: 250, maxWidth: 250 }}>
                        <Box>
                          <Typography
                            variant='caption'
                            fontWeight={600}
                            sx={{
                              fontSize: '0.7rem',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              display: 'block'
                            }}
                          >
                            {order.guess_name}
                          </Typography>
                          <Typography
                            variant='caption'
                            color='text.secondary'
                            sx={{
                              fontSize: '0.68rem',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              display: 'block'
                            }}
                          >
                            {order.guess_email}
                          </Typography>
                          <Typography
                            variant='caption'
                            color='text.secondary'
                            sx={{
                              fontSize: '0.68rem',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              display: 'block'
                            }}
                          >
                            {order.guess_phone}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ width: 140, minWidth: 140, maxWidth: 140 }}>
                        <Typography
                          variant='caption'
                          fontWeight={600}
                          sx={{
                            fontSize: '0.7rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            display: 'block'
                          }}
                        >
                          {formatPrice(order.final_amount)}
                        </Typography>
                        {order.discount_amount > 0 && (
                          <Typography
                            variant='caption'
                            color='success.main'
                            sx={{
                              fontSize: '0.68rem',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              display: 'block'
                            }}
                          >
                            Giảm: {formatPrice(order.discount_amount)}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ width: 120, minWidth: 120, maxWidth: 120 }}>
                        <Chip
                          label={paymentMethodMap[order.payment_method || ''] || 'Chưa chọn'}
                          size='small'
                          sx={{
                            fontSize: '0.68rem',
                            height: 20,
                            maxWidth: '100%',
                            '& .MuiChip-label': {
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ width: 180, minWidth: 180, maxWidth: 180 }}>
                        <Typography
                          variant='caption'
                          sx={{
                            fontSize: '0.7rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            display: 'block'
                          }}
                        >
                          {formatDate(order.created_at)}
                        </Typography>
                      </TableCell>
                      <TableCell
                        align='right'
                        onClick={e => e.stopPropagation()}
                        sx={{
                          width: 150,
                          minWidth: 150,
                          maxWidth: 150,
                          position: 'sticky',
                          right: 0,
                          zIndex: 1,
                          backgroundColor: 'background.paper'
                        }}
                      >
                        <FormControl size='small' sx={{ minWidth: 130, maxWidth: 130 }}>
                          <Select
                            value={order.current_status_id}
                            onChange={e => updateOrderStatus(order.id, e.target.value)}
                            disabled={
                              orderStatuses.filter(status => parseInt(status.id) > parseInt(order.current_status_id))
                                .length === 0
                            }
                            sx={{
                              fontSize: '0.7rem',
                              backgroundColor: getStatusInfo(order.current_status_id).color,
                              color: '#000',
                              '& .MuiSvgIcon-root': { color: '#000' },
                              '& .MuiSelect-select': {
                                fontSize: '0.7rem',
                                padding: '4px 8px',
                                color: '#000',
                                fontWeight: 700
                              },
                              '&.Mui-disabled': {
                                opacity: 1,
                                color: '#000',
                                WebkitTextFillColor: '#000',
                                backgroundColor: getStatusInfo(order.current_status_id).color
                              },
                              '&.Mui-disabled .MuiSelect-select': {
                                color: '#000',
                                WebkitTextFillColor: '#000',
                                fontWeight: 700
                              },
                              '&.Mui-disabled .MuiSvgIcon-root': {
                                color: '#000'
                              },
                              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' }
                            }}
                          >
                            {/* Hiển thị trạng thái hiện tại (display only) */}
                            <MenuItem value={order.current_status_id} sx={{ fontSize: '0.7rem' }}>
                              {getStatusInfo(order.current_status_id).sortOrder}. {getStatusInfo(order.current_status_id).name}
                            </MenuItem>
                            {/* Hiển thị các trạng thái có thể chọn */}
                            {sortedOrderStatuses
                              .filter(status => parseInt(status.id) > parseInt(order.current_status_id))
                              .map(status => (
                                <MenuItem key={status.id} value={status.id} sx={{ fontSize: '0.7rem' }}>
                                  {getStatusLabel(status)}
                                </MenuItem>
                              ))}
                          </Select>
                        </FormControl>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
        <Box sx={{ mt: 3, mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
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
      </Card>

      {/* Order Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onClose={() => setIsDetailDialogOpen(false)} maxWidth='md' fullWidth>
        <DialogTitle>Chi tiết đơn hàng {selectedOrder?.code}</DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardHeader title='Thông tin khách hàng' />
                    <CardContent>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant='body2' color='text.secondary'>
                          Họ tên
                        </Typography>
                        <Typography variant='body1' fontWeight={600}>
                          {selectedOrder.guess_name}
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant='body2' color='text.secondary'>
                          Email
                        </Typography>
                        <Typography variant='body1'>{selectedOrder.guess_email}</Typography>
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant='body2' color='text.secondary'>
                          Số điện thoại
                        </Typography>
                        <Typography variant='body1'>{selectedOrder.guess_phone}</Typography>
                      </Box>
                      <Box>
                        <Typography variant='body2' color='text.secondary'>
                          Địa chỉ giao hàng
                        </Typography>
                        <Typography variant='body1'>{selectedOrder.shipping_address}</Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardHeader title='Thông tin thanh toán' />
                    <CardContent>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant='body2' color='text.secondary'>
                          Phương thức
                        </Typography>
                        {getPaymentMethodChip(selectedOrder.payment_method)}
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant='body2' color='text.secondary'>
                          Tạm tính
                        </Typography>
                        <Typography variant='body1'>{formatPrice(selectedOrder.total_amount)}</Typography>
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant='body2' color='text.secondary'>
                          Phí vận chuyển
                        </Typography>
                        <Typography variant='body1'>{formatPrice(selectedOrder.shipping_fee)}</Typography>
                      </Box>
                      {selectedOrder.discount_amount > 0 && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant='body2' color='text.secondary'>
                            Giảm giá
                          </Typography>
                          <Typography variant='body1' color='success.main'>
                            -{formatPrice(selectedOrder.discount_amount)}
                          </Typography>
                        </Box>
                      )}
                      <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2 }}>
                        <Typography variant='body2' color='text.secondary'>
                          Tổng cộng
                        </Typography>
                        <Typography variant='h6' fontWeight={700}>
                          {formatPrice(selectedOrder.final_amount)}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
              {selectedOrder.note && (
                <Card sx={{ mt: 2 }}>
                  <CardHeader title='Ghi chú' />
                  <CardContent>
                    <Typography variant='body1'>{selectedOrder.note}</Typography>
                  </CardContent>
                </Card>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDetailDialogOpen(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Action Dialog */}
      <Dialog open={isBulkDialogOpen} onClose={() => setIsBulkDialogOpen(false)}>
        <DialogTitle>Cập nhật nhanh hàng loạt</DialogTitle>
        <DialogContent>
          <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
            Bạn đã chọn {selectedOrders.length} đơn hàng. Chọn hành động để thực hiện trên tất cả đơn hàng đã chọn.
          </Typography>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Trạng thái mới</InputLabel>
            <Select value={bulkAction} onChange={e => setBulkAction(e.target.value)} label='Trạng thái mới'>
              {sortedOrderStatuses.map(status => (
                <MenuItem key={status.id} value={status.id}>
                  {getStatusLabel(status)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
            <Typography variant='body2' fontWeight={600} sx={{ mb: 1 }}>
              Các tùy chọn cập nhật nhanh:
            </Typography>
            {sortedOrderStatuses.map(status => (
              <Typography key={status.id} variant='caption' component='div'>
                • <strong>{getStatusLabel(status)}:</strong> {status.description}
              </Typography>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsBulkDialogOpen(false)}>Hủy</Button>
          <Button onClick={handleBulkAction} disabled={!bulkAction} variant='contained'>
            Cập nhật {selectedOrders.length} đơn hàng
          </Button>
        </DialogActions>
      </Dialog>

      {/* Quick Update Dialog */}
      <Dialog
        open={isQuickUpdateDialogOpen}
        onClose={() => !isUpdating && updateResults.length === 0 && setIsQuickUpdateDialogOpen(false)}
        maxWidth='md'
        fullWidth
      >
        <DialogTitle>Cập nhật nhanh trạng thái đơn hàng</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {/* Selected Orders List */}
            <Typography variant='h6' sx={{ mb: 2 }}>
              Danh sách đơn hàng đã chọn ({selectedOrders.length})
            </Typography>
            <List sx={{ maxHeight: 200, overflow: 'auto', border: 1, borderColor: 'divider', borderRadius: 1 }}>
              {selectedOrders.map(orderId => {
                const order = orders.find(o => o.id === orderId)
                if (!order) return null
                const currentStatus = orderStatuses.find(s => s.id === order.current_status_id)

                return (
                  <ListItem key={orderId}>
                    <ListItemIcon>
                      <IconifyIcon icon='mdi:package-variant' />
                    </ListItemIcon>
                    <ListItemText
                      primary={order.code}
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <Typography variant='caption'>Trạng thái hiện tại:</Typography>
                          {currentStatus ? (
                            <Chip
                              label={currentStatus.name}
                              size='small'
                              sx={{
                                backgroundColor: currentStatus.hex_code,
                                color: '#fff',
                                '& .MuiChip-label': { color: '#fff' }
                              }}
                            />
                          ) : (
                            <Typography variant='caption' color='text.secondary'>
                              Không xác định
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                )
              })}
            </List>

            <Divider sx={{ my: 3 }} />

            {/* Status Selection */}
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Trạng thái mới</InputLabel>
              <Select
                value={quickUpdateStatus}
                onChange={e => setQuickUpdateStatus(e.target.value)}
                label='Trạng thái mới'
                disabled={isUpdating}
              >
                {sortedOrderStatuses.map(status => (
                  <MenuItem key={status.id} value={status.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          backgroundColor: status.hex_code
                        }}
                      />
                      {getStatusLabel(status)}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Progress Bar */}
            {isUpdating && (
              <Box sx={{ mb: 2 }}>
                <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                  Đang cập nhật... {Math.round(updateProgress)}%
                </Typography>
                <LinearProgress variant='determinate' value={updateProgress} />
              </Box>
            )}

            {/* Update Results */}
            {updateResults.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant='h6' sx={{ mb: 1 }}>
                  Kết quả cập nhật
                </Typography>

                {/* Summary */}
                <Box sx={{ mb: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                  <Typography variant='body1' sx={{ mb: 1 }}>
                    <strong>Tổng kết:</strong>
                  </Typography>
                  <Typography variant='body2' color='success.main'>
                    ✅ Thành công: {updateResults.filter(r => r.success).length} đơn hàng
                  </Typography>
                  <Typography variant='body2' color='error.main'>
                    ❌ Thất bại: {updateResults.filter(r => !r.success).length} đơn hàng
                  </Typography>
                </Box>

                {/* Detailed Results */}
                <List sx={{ maxHeight: 300, overflow: 'auto', border: 1, borderColor: 'divider', borderRadius: 1 }}>
                  {updateResults.map((result, index) => (
                    <ListItem key={index} sx={{ borderBottom: 1, borderColor: 'divider' }}>
                      <ListItemIcon>
                        <IconifyIcon
                          icon={result.success ? 'mdi:check-circle' : 'mdi:close-circle'}
                          color={result.success ? 'success.main' : 'error.main'}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography
                              variant='body1'
                              color={result.success ? 'success.main' : 'error.main'}
                              fontWeight={600}
                            >
                              {result.orderCode}
                            </Typography>
                            <Chip
                              label={result.success ? 'Thành công' : 'Thất bại'}
                              size='small'
                              color={result.success ? 'success' : 'error'}
                              variant={result.success ? 'filled' : 'outlined'}
                            />
                          </Box>
                        }
                        secondary={
                          result.message && (
                            <Typography variant='body2' color='text.secondary' sx={{ mt: 0.5 }}>
                              {result.message}
                            </Typography>
                          )
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          {updateResults.length > 0 ? (
            <>
              <Button
                onClick={() => {
                  setUpdateResults([])
                  setIsUpdating(false)
                  setUpdateProgress(0)
                  setIsQuickUpdateDialogOpen(false)
                }}
                variant='outlined'
              >
                Đóng
              </Button>
              <Button
                onClick={() => {
                  setSelectedOrders([])
                  setQuickUpdateStatus('')
                  setUpdateResults([])
                  setIsUpdating(false)
                  setUpdateProgress(0)
                  setIsQuickUpdateDialogOpen(false)
                }}
                variant='contained'
                color='primary'
              >
                Xác nhận
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => {
                  setUpdateResults([])
                  setIsUpdating(false)
                  setUpdateProgress(0)
                  setIsQuickUpdateDialogOpen(false)
                }}
                disabled={isUpdating}
              >
                {isUpdating ? 'Đang cập nhật...' : 'Hủy'}
              </Button>
              <Button
                onClick={handleQuickUpdate}
                disabled={!quickUpdateStatus || selectedOrders.length === 0 || isUpdating}
                variant='contained'
              >
                {isUpdating ? 'Đang cập nhật...' : 'Xác nhận cập nhật'}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  )
}

;(OrderManagementPage as any).getLayout = (page: React.ReactNode) => <ManageSystemLayout>{page}</ManageSystemLayout>
;(OrderManagementPage as any).authGuard = true
;(OrderManagementPage as any).guestGuard = false

export default OrderManagementPage

