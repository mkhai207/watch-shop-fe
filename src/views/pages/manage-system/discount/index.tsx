import React, { useState } from 'react'
import {
  Box,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  CircularProgress,
  Chip,
  InputAdornment,
  Snackbar,
  IconButton
} from '@mui/material'
import { Edit, Delete } from '@mui/icons-material'

import { useDiscount } from 'src/hooks/useDiscount'
import { TDiscount, NewDiscount } from 'src/types/discount'
import CustomPagination from 'src/components/custom-pagination'
import { PAGE_SIZE_OPTION } from 'src/configs/gridConfig'
import PermissionGuard from 'src/components/auth/PermissionGuard'

const cellStyle = {
  maxWidth: 150,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  textAlign: 'center' as const
}

const ellipsisStyle: React.CSSProperties = {
  maxWidth: 120,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  display: 'inline-block',
  verticalAlign: 'middle'
}

const StatusCell = ({ validFrom, validUntil }: { validFrom: string; validUntil: string }) => {
  const now = new Date()
  const fromDate = new Date(validFrom)
  const untilDate = new Date(validUntil)

  let status = 'Chưa hiệu lực'
  let color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' = 'default'

  if (now >= fromDate && now <= untilDate) {
    status = 'Đang hiệu lực'
    color = 'success'
  } else if (now > untilDate) {
    status = 'Hết hạn'
    color = 'error'
  } else if (now < fromDate) {
    status = 'Chưa hiệu lực'
    color = 'warning'
  }

  return (
    <TableCell sx={cellStyle}>
      <Chip label={status} color={color} size='small' />
    </TableCell>
  )
}

const ManageDiscountPage: React.FC = () => {
  // State declarations
  const { discounts, loading, error, createDiscount, updateDiscount, deleteDiscount } = useDiscount()
  const [editModal, setEditModal] = useState(false)
  const [editDiscount, setEditDiscount] = useState<TDiscount | null>(null)
  const [addModal, setAddModal] = useState(false)
  const [newDiscount, setNewDiscount] = useState<NewDiscount>({
    code: '',
    name: '',
    description: '',
    discount_value: 0,
    discount_type: 'PERCENTAGE',
    valid_from: '',
    valid_until: '',
    minimum_order_value: 0,
    max_discount_amount: null
  })
  const [newDiscountDates, setNewDiscountDates] = useState({
    valid_from: null as Date | null,
    valid_until: null as Date | null
  })
  const [editDiscountDates, setEditDiscountDates] = useState({
    valid_from: null as Date | null,
    valid_until: null as Date | null
  })
  const [confirmDeleteModal, setConfirmDeleteModal] = useState<{
    open: boolean
    discountId: number | null
  }>({
    open: false,
    discountId: null
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTION[0])
  const [snackbar, setSnackbar] = useState<{
    open: boolean
    message: string
    severity: 'success' | 'error' | 'info' | 'warning'
  }>({
    open: false,
    message: '',
    severity: 'info'
  })

  // Handlers
  const handleDelete = (id: number) => {
    setConfirmDeleteModal({
      open: true,
      discountId: id
    })
  }

  const handleConfirmDelete = async () => {
    if (confirmDeleteModal.discountId) {
      try {
        await deleteDiscount(confirmDeleteModal.discountId)
        setConfirmDeleteModal({ open: false, discountId: null })
      } catch (err) {
        console.error('Lỗi khi xóa khuyến mãi:', err)
        setSnackbar(prev => ({
          ...prev,
          open: true,
          message: 'Có lỗi xảy ra khi xóa khuyến mãi. Vui lòng thử lại!',
          severity: 'error'
        }))
      }
    }
  }

  const handleCancelDelete = () => {
    setConfirmDeleteModal({ open: false, discountId: null })
  }

  // Hàm chuyển đổi ISO string về format DD/MM/YYYY HH:mm
  const convertFromISOString = (isoString: string): string => {
    try {
      const date = new Date(isoString)
      if (isNaN(date.getTime())) return ''

      const day = date.getDate().toString().padStart(2, '0')
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const year = date.getFullYear()
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')

      return `${day}/${month}/${year} ${hours}:${minutes}`
    } catch (error) {
      console.error('Lỗi chuyển đổi từ ISO string:', error)

      return ''
    }
  }

  const handleEdit = (discount: TDiscount) => {
    setEditDiscount({
      ...discount,
      valid_from: convertFromISOString(discount.valid_from),
      valid_until: convertFromISOString(discount.valid_until)
    })
    setEditDiscountDates({
      valid_from: new Date(discount.valid_from),
      valid_until: new Date(discount.valid_until)
    })
    setEditModal(true)
  }

  const handleAdd = () => {
    setNewDiscount({
      code: '',
      name: '',
      description: '',
      discount_value: 0,
      discount_type: 'PERCENTAGE',
      valid_from: '',
      valid_until: '',
      minimum_order_value: 0,
      max_discount_amount: null
    })
    setNewDiscountDates({
      valid_from: null,
      valid_until: null
    })
    setAddModal(true)
  }

  const formatDateForInput = (date: Date | null): string => {
    if (!date) return ''
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')

    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  const handleSaveEdit = async () => {
    if (editDiscount) {
      try {
        // Validate dates
        if (!editDiscountDates.valid_from || !editDiscountDates.valid_until) {
          setSnackbar(prev => ({
            ...prev,
            open: true,
            message: 'Vui lòng chọn thời gian hiệu lực!',
            severity: 'error'
          }))

          return
        }

        if (editDiscountDates.valid_from >= editDiscountDates.valid_until) {
          setSnackbar(prev => ({
            ...prev,
            open: true,
            message: 'Thời gian kết thúc phải sau thời gian bắt đầu!',
            severity: 'error'
          }))

          return
        }

        await updateDiscount(editDiscount.id, {
          code: editDiscount.code,
          name: editDiscount.name,
          description: editDiscount.description,
          discount_value: editDiscount.discount_value,
          discount_type: editDiscount.discount_type,
          valid_from: editDiscountDates.valid_from.toISOString(),
          valid_until: editDiscountDates.valid_until.toISOString(),
          minimum_order_value: editDiscount.minimum_order_value,
          max_discount_amount: editDiscount.max_discount_amount
        })
        setEditModal(false)
        setSnackbar(prev => ({
          ...prev,
          open: true,
          message: 'Cập nhật khuyến mãi thành công!',
          severity: 'success'
        }))
      } catch (err) {
        console.error('Lỗi khi cập nhật khuyến mãi:', err)
        setSnackbar(prev => ({
          ...prev,
          open: true,
          message: 'Có lỗi xảy ra khi cập nhật khuyến mãi. Vui lòng thử lại!',
          severity: 'error'
        }))
      }
    }
  }

  const handleSaveAdd = async () => {
    // Validation
    if (!newDiscount.code.trim()) {
      setSnackbar(prev => ({
        ...prev,
        open: true,
        message: 'Vui lòng nhập mã khuyến mãi!',
        severity: 'error'
      }))

      return
    }

    if (!newDiscount.name.trim()) {
      setSnackbar(prev => ({
        ...prev,
        open: true,
        message: 'Vui lòng nhập tên khuyến mãi!',
        severity: 'error'
      }))

      return
    }

    if (newDiscount.discount_value <= 0) {
      setSnackbar(prev => ({
        ...prev,
        open: true,
        message: 'Giá trị giảm phải lớn hơn 0!',
        severity: 'error'
      }))

      return
    }

    if (!newDiscountDates.valid_from || !newDiscountDates.valid_until) {
      setSnackbar(prev => ({
        ...prev,
        open: true,
        message: 'Vui lòng chọn thời gian hiệu lực!',
        severity: 'error'
      }))

      return
    }

    if (newDiscountDates.valid_from >= newDiscountDates.valid_until) {
      setSnackbar(prev => ({
        ...prev,
        open: true,
        message: 'Thời gian kết thúc phải sau thời gian bắt đầu!',
        severity: 'error'
      }))

      return
    }

    try {
      // Format dữ liệu trước khi gửi API
      const formattedDiscount = {
        ...newDiscount,
        valid_from: newDiscountDates.valid_from.toISOString(),
        valid_until: newDiscountDates.valid_until.toISOString()
      }
      await createDiscount(formattedDiscount)
      setAddModal(false)
      setSnackbar(prev => ({
        ...prev,
        open: true,
        message: 'Tạo khuyến mãi thành công!',
        severity: 'success'
      }))
    } catch (err) {
      console.error('Lỗi khi tạo khuyến mãi:', err)
      setSnackbar(prev => ({
        ...prev,
        open: true,
        message: 'Có lỗi xảy ra khi tạo khuyến mãi. Vui lòng thử lại!',
        severity: 'error'
      }))
    }
  }

  // Filtering and pagination
  const filteredDiscounts = discounts.filter(discount => {
    const matchCode = discount.code?.toLowerCase().includes(searchTerm.toLowerCase()) || false
    const matchName = discount.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false
    const matchType = filterType ? discount.discount_type === filterType : true

    return (matchCode || matchName) && matchType
  })
  const totalPages = Math.ceil(filteredDiscounts.length / pageSize)
  const paginatedDiscounts = filteredDiscounts.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const handleOnchangePagination = (page: number, size: number) => {
    setCurrentPage(page)
    setPageSize(size)
  }

  return (
    <Box
      sx={{
        width: '100%',
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box'
      }}
    >
      <Typography variant='h5' fontWeight='bold' mb={3}>
        Quản lý khuyến mãi
      </Typography>

      <Box sx={{ display: 'flex', mb: 3, gap: 2, alignItems: 'flex-end' }}>
        <PermissionGuard apiPath='/api/v0/discounts/create-discount' method='POST'>
          <Button variant='contained' color='primary' onClick={handleAdd}>
            Thêm khuyến mãi
          </Button>
        </PermissionGuard>
        <Box>
          <TextField
            size='small'
            sx={{ width: 180, minWidth: 120 }}
            placeholder='Tìm kiếm theo mã hoặc tên'
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
          />
        </Box>
        <Box>
          <FormControl size='small' sx={{ width: 140, minWidth: 100 }}>
            <InputLabel>Loại giảm</InputLabel>
            <Select
              value={filterType}
              onChange={(e: SelectChangeEvent) => {
                setFilterType(e.target.value)
                setCurrentPage(1)
              }}
              label='Loại giảm'
            >
              <MenuItem value=''>Tất cả</MenuItem>
              <MenuItem value='PERCENTAGE'>Phần trăm</MenuItem>
              <MenuItem value='FIXED'>Số tiền cố định</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {loading ? (
        <Box display='flex' justifyContent='center' alignItems='center' minHeight='200px'>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer
            component={Paper}
            sx={{
              width: '100%',
              overflowX: 'auto',
              maxWidth: '100%'
            }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  {[
                    'ID',
                    'Ngày tạo',
                    'Người tạo',
                    'Ngày cập nhật',
                    'Người cập nhật',
                    'Mã khuyến mãi',
                    'Tên khuyến mãi',
                    'Mô tả',
                    'Loại giảm',
                    'Giá trị giảm',
                    'Hiệu lực từ',
                    'Hiệu lực đến',
                    'Giá trị đơn hàng tối thiểu',
                    'Giá trị giảm tối đa',
                    'Trạng thái',
                    'Hành động'
                  ].map(header => (
                    <TableCell
                      key={header}
                      sx={{
                        textAlign: 'center',
                        fontWeight: 'bold',
                        whiteSpace: 'nowrap',
                        padding: '8px'
                      }}
                    >
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedDiscounts.length > 0 ? (
                  paginatedDiscounts.map(discount => (
                    <TableRow key={discount.id}>
                      <TableCell sx={{ textAlign: 'center' }}>{discount.id}</TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>{formatDate(discount.created_at)}</TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Tooltip title={discount.created_by || 'N/A'}>
                          <span style={ellipsisStyle}>{discount.created_by || 'N/A'}</span>
                        </Tooltip>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>{formatDate(discount.updated_at)}</TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Tooltip title={discount.updated_by || 'N/A'}>
                          <span style={ellipsisStyle}>{discount.updated_by || 'N/A'}</span>
                        </Tooltip>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Tooltip title={discount.code}>
                          <span style={ellipsisStyle}>{discount.code}</span>
                        </Tooltip>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Tooltip title={discount.name}>
                          <span style={ellipsisStyle}>{discount.name}</span>
                        </Tooltip>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Tooltip title={discount.description}>
                          <span style={ellipsisStyle}>{discount.description}</span>
                        </Tooltip>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Chip
                          label={discount.discount_type === 'PERCENTAGE' ? 'Phần trăm' : 'Số tiền cố định'}
                          color={discount.discount_type === 'PERCENTAGE' ? 'primary' : 'secondary'}
                          size='small'
                        />
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        {discount.discount_type === 'PERCENTAGE'
                          ? `${discount.discount_value}%`
                          : formatCurrency(discount.discount_value)}
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>{formatDate(discount.valid_from)}</TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>{formatDate(discount.valid_until)}</TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>{formatCurrency(discount.minimum_order_value)}</TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        {discount.max_discount_amount ? formatCurrency(discount.max_discount_amount) : 'Không giới hạn'}
                      </TableCell>
                      <StatusCell validFrom={discount.valid_from} validUntil={discount.valid_until} />
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <PermissionGuard apiPath='/api/v0/discounts/update-discount' method='PUT'>
                            <IconButton
                              color='warning'
                              size='small'
                              onClick={() => handleEdit(discount)}
                              sx={{ '&:hover': { backgroundColor: 'warning.light' } }}
                            >
                              <Edit fontSize='small' />
                            </IconButton>
                          </PermissionGuard>
                          <PermissionGuard apiPath='/api/v0/discounts/delete-discount' method='DELETE'>
                            <IconButton
                              color='error'
                              size='small'
                              onClick={() => handleDelete(discount.id)}
                              sx={{ '&:hover': { backgroundColor: 'error.light' } }}
                            >
                              <Delete fontSize='small' />
                            </IconButton>
                          </PermissionGuard>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={16} sx={{ textAlign: 'center', py: 4 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                        <Typography variant='body1' color='text.secondary'>
                          {searchTerm || filterType
                            ? 'Không tìm thấy khuyến mãi nào phù hợp với bộ lọc'
                            : 'Chưa có khuyến mãi nào trong hệ thống'}
                        </Typography>
                        {(searchTerm || filterType) && (
                          <Button
                            variant='outlined'
                            size='small'
                            onClick={() => {
                              setSearchTerm('')
                              setFilterType('')
                              setCurrentPage(1)
                            }}
                          >
                            Xóa bộ lọc
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {filteredDiscounts.length > 0 ? (
            <CustomPagination
              page={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              rowLength={filteredDiscounts.length}
              pageSizeOptions={PAGE_SIZE_OPTION}
              onChangePagination={handleOnchangePagination}
              isHideShowed
            />
          ) : (
            <Box sx={{ mt: 4, mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Typography variant='body1' color='text.secondary' sx={{ fontSize: '1rem', fontWeight: 500 }}>
                {searchTerm || filterType
                  ? 'Không tìm thấy khuyến mãi nào phù hợp với bộ lọc'
                  : 'Chưa có khuyến mãi nào trong hệ thống'}
              </Typography>
              {(searchTerm || filterType) && (
                <Button
                  variant='outlined'
                  onClick={() => {
                    setSearchTerm('')
                    setFilterType('')
                    setCurrentPage(1)
                  }}
                >
                  Xóa bộ lọc
                </Button>
              )}
            </Box>
          )}
        </>
      )}

      {/* Edit Discount Dialog */}
      <Dialog open={editModal} onClose={() => setEditModal(false)} maxWidth='md' fullWidth>
        <DialogTitle>Sửa thông tin khuyến mãi</DialogTitle>
        <DialogContent>
          {editDiscount && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <TextField
                label='Mã khuyến mãi'
                value={editDiscount.code}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditDiscount({ ...editDiscount, code: e.target.value })
                }
                fullWidth
              />
              <TextField
                label='Tên khuyến mãi'
                value={editDiscount.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditDiscount({ ...editDiscount, name: e.target.value })
                }
                fullWidth
              />
              <TextField
                label='Mô tả'
                value={editDiscount.description}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditDiscount({ ...editDiscount, description: e.target.value })
                }
                fullWidth
                multiline
                rows={3}
              />
              <FormControl fullWidth>
                <InputLabel>Loại giảm</InputLabel>
                <Select
                  value={editDiscount.discount_type}
                  onChange={(e: SelectChangeEvent) =>
                    setEditDiscount({ ...editDiscount, discount_type: e.target.value as 'PERCENTAGE' | 'FIXED' })
                  }
                  label='Loại giảm'
                >
                  <MenuItem value='PERCENTAGE'>Phần trăm</MenuItem>
                  <MenuItem value='FIXED'>Số tiền cố định</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label='Giá trị giảm'
                type='number'
                value={editDiscount.discount_value}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditDiscount({ ...editDiscount, discount_value: parseFloat(e.target.value) || 0 })
                }
                fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      {editDiscount.discount_type === 'PERCENTAGE' ? '%' : 'VND'}
                    </InputAdornment>
                  )
                }}
              />
              <TextField
                label='Hiệu lực từ'
                type='datetime-local'
                value={formatDateForInput(editDiscountDates.valid_from)}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const date = e.target.value ? new Date(e.target.value) : null
                  setEditDiscountDates(prev => ({ ...prev, valid_from: date }))
                }}
                fullWidth
                InputLabelProps={{
                  shrink: true
                }}
                inputProps={{
                  min: new Date().toISOString().slice(0, 16)
                }}
              />
              <TextField
                label='Hiệu lực đến'
                type='datetime-local'
                value={formatDateForInput(editDiscountDates.valid_until)}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const date = e.target.value ? new Date(e.target.value) : null
                  setEditDiscountDates(prev => ({ ...prev, valid_until: date }))
                }}
                fullWidth
                InputLabelProps={{
                  shrink: true
                }}
                inputProps={{
                  min: editDiscountDates.valid_from
                    ? formatDateForInput(editDiscountDates.valid_from)
                    : new Date().toISOString().slice(0, 16)
                }}
              />
              <TextField
                label='Giá trị đơn hàng tối thiểu'
                type='number'
                value={editDiscount.minimum_order_value}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditDiscount({ ...editDiscount, minimum_order_value: parseInt(e.target.value) })
                }
                fullWidth
                InputProps={{
                  endAdornment: <InputAdornment position='end'>VND</InputAdornment>
                }}
              />
              <TextField
                label='Giá trị giảm tối đa'
                type='number'
                value={editDiscount.max_discount_amount || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditDiscount({
                    ...editDiscount,
                    max_discount_amount: e.target.value ? parseInt(e.target.value) : null
                  })
                }
                fullWidth
                InputProps={{
                  endAdornment: <InputAdornment position='end'>VND</InputAdornment>
                }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditModal(false)}>Huỷ</Button>
          <Button onClick={handleSaveEdit} variant='contained' color='primary'>
            Lưu
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Discount Dialog */}
      <Dialog open={addModal} onClose={() => setAddModal(false)} maxWidth='md' fullWidth>
        <DialogTitle>Thêm khuyến mãi mới</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label='Mã khuyến mãi'
              value={newDiscount.code}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNewDiscount({ ...newDiscount, code: e.target.value })
              }
              fullWidth
            />
            <TextField
              label='Tên khuyến mãi'
              value={newDiscount.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNewDiscount({ ...newDiscount, name: e.target.value })
              }
              fullWidth
            />
            <TextField
              label='Mô tả'
              value={newDiscount.description}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNewDiscount({ ...newDiscount, description: e.target.value })
              }
              fullWidth
              multiline
              rows={3}
            />
            <FormControl fullWidth>
              <InputLabel>Loại giảm</InputLabel>
              <Select
                value={newDiscount.discount_type}
                onChange={(e: SelectChangeEvent) =>
                  setNewDiscount({ ...newDiscount, discount_type: e.target.value as 'PERCENTAGE' | 'FIXED' })
                }
                label='Loại giảm'
              >
                <MenuItem value='PERCENTAGE'>Phần trăm</MenuItem>
                <MenuItem value='FIXED'>Số tiền cố định</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label='Giá trị giảm'
              type='number'
              value={newDiscount.discount_value}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNewDiscount({ ...newDiscount, discount_value: parseFloat(e.target.value) || 0 })
              }
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    {newDiscount.discount_type === 'PERCENTAGE' ? '%' : 'VND'}
                  </InputAdornment>
                )
              }}
            />
            <TextField
              label='Hiệu lực từ'
              type='datetime-local'
              value={formatDateForInput(newDiscountDates.valid_from)}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const date = e.target.value ? new Date(e.target.value) : null
                setNewDiscountDates(prev => ({ ...prev, valid_from: date }))
              }}
              fullWidth
              InputLabelProps={{
                shrink: true
              }}
              inputProps={{
                min: new Date().toISOString().slice(0, 16)
              }}
            />
            <TextField
              label='Hiệu lực đến'
              type='datetime-local'
              value={formatDateForInput(newDiscountDates.valid_until)}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const date = e.target.value ? new Date(e.target.value) : null
                setNewDiscountDates(prev => ({ ...prev, valid_until: date }))
              }}
              fullWidth
              InputLabelProps={{
                shrink: true
              }}
              inputProps={{
                min: newDiscountDates.valid_from
                  ? formatDateForInput(newDiscountDates.valid_from)
                  : new Date().toISOString().slice(0, 16)
              }}
            />
            <TextField
              label='Giá trị đơn hàng tối thiểu'
              type='number'
              value={newDiscount.minimum_order_value}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNewDiscount({ ...newDiscount, minimum_order_value: parseInt(e.target.value) })
              }
              fullWidth
              InputProps={{
                endAdornment: <InputAdornment position='end'>VND</InputAdornment>
              }}
            />
            <TextField
              label='Giá trị giảm tối đa'
              type='number'
              value={newDiscount.max_discount_amount || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNewDiscount({
                  ...newDiscount,
                  max_discount_amount: e.target.value ? parseInt(e.target.value) : null
                })
              }
              fullWidth
              InputProps={{
                endAdornment: <InputAdornment position='end'>VND</InputAdornment>
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddModal(false)} disabled={loading}>
            Huỷ
          </Button>
          <Button
            onClick={handleSaveAdd}
            variant='contained'
            color='primary'
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Box
          sx={{
            backgroundColor:
              snackbar.severity === 'success'
                ? '#4caf50'
                : snackbar.severity === 'error'
                  ? '#f44336'
                  : snackbar.severity === 'warning'
                    ? '#ff9800'
                    : '#2196f3',
            color: 'white',
            padding: 2,
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            minWidth: 300
          }}
        >
          <Typography variant='body2'>{snackbar.message}</Typography>
          <Button
            size='small'
            onClick={() => setSnackbar(prev => ({ ...prev, open: false }))}
            sx={{ color: 'white', ml: 2 }}
          >
            ✕
          </Button>
        </Box>
      </Snackbar>

      {/* Confirm Delete Dialog */}
      <Dialog open={confirmDeleteModal.open} onClose={handleCancelDelete} maxWidth='sm' fullWidth>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>Bạn có chắc chắn muốn xóa khuyến mãi này? Hành động này không thể hoàn tác.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color='inherit'>
            Hủy
          </Button>
          <Button onClick={handleConfirmDelete} color='error' variant='contained' autoFocus>
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ManageDiscountPage
