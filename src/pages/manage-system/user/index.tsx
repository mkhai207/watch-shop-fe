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
  Avatar,
  Tooltip
} from '@mui/material'
import type { NextPage } from 'next'
import React, { useEffect, useState, useCallback } from 'react'
import { useDebounce } from 'src/hooks/useDebounce'
import { useAuth } from 'src/hooks/useAuth'
import toast from 'react-hot-toast'
import AdvancedFilter, { FilterConfig, useAdvancedFilter, buildBackendQuery } from 'src/components/advanced-filter'
import CustomPagination from 'src/components/custom-pagination'
import Spinner from 'src/components/spinner'
import { PAGE_SIZE_OPTION } from 'src/configs/gridConfig'
import { IUser } from 'src/types/user'
import { getUsers, deleteUser } from 'src/services/user'
import ManageSystemLayout from 'src/views/layouts/ManageSystemLayout'
import dayjs from 'dayjs'
import { formatCompactVN } from 'src/utils/date'
import UserDetailDialog from './UserDetailDialog'
import UserEditDialog from './UserEditDialog'
import UserCreateDialog from './UserCreateDialog'

const UserPage: NextPage = () => {
  const [users, setUsers] = useState<IUser[]>([])
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [openCreate, setOpenCreate] = useState(false)
  const [selected, setSelected] = useState<IUser | null>(null)
  const [openDetail, setOpenDetail] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTION[0])
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const filterConfig: FilterConfig = React.useMemo(() => {
    return {
      searchFields: [
        { key: 'first_name', label: 'Tên', type: 'string' },
        { key: 'last_name', label: 'Họ', type: 'string' },
        { key: 'username', label: 'Tên đăng nhập', type: 'string' },
        { key: 'email', label: 'Email', type: 'string' }
      ],
      filterFields: [
        {
          key: 'status',
          label: 'Trạng thái',
          type: 'select',
          operator: 'eq',
          options: [
            { value: '0', label: 'Hoạt động' },
            { value: '1', label: 'Tạm khóa' }
          ]
        },
        {
          key: 'role.id',
          label: 'Vai trò',
          type: 'select',
          operator: 'eq',
          options: [
            { value: '1', label: 'Admin' },
            { value: '2', label: 'Customer' }
          ]
        }
      ],
      sortOptions: [
        { value: 'last_name:asc', label: 'Sắp xếp A-Z' },
        { value: 'last_name:desc', label: 'Sắp xếp Z-A' },
        { value: 'created_at:desc', label: 'Mới nhất' },
        { value: 'created_at:asc', label: 'Cũ nhất' }
      ],
      dateRangeFields: [{ key: 'created_at', label: 'Ngày tạo' }]
    }
  }, [])

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

  const handleFilterChange = React.useCallback(
    (values: any) => {
      setFilterValues(values)
      setPage(1)
    },
    [setFilterValues]
  )

  const fetchUsers = useCallback(
    async (queryParams: any = {}) => {
      setLoading(true)
      try {
        const params = {
          page,
          limit: pageSize,
          ...queryParams
        }

        const response = await getUsers(params)

        if (response && response.users) {
          const userData = response.users

          const usersWithFullName = userData.items.map((user: any) => ({
            ...user,
            fullName: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username
          }))

          setUsers(usersWithFullName)
          setTotalPages(userData.totalPages || 1)
          setTotalCount(userData.totalItems || 0)
        } else {
          setUsers([])
          setTotalPages(1)
          setTotalCount(0)
        }
      } catch (error) {
        toast.error('Có lỗi xảy ra khi tải dữ liệu người dùng')
      } finally {
        setLoading(false)
      }
    },
    [page, pageSize]
  )

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // Reload data when filters change
  useEffect(() => {
    setPage(1) // Reset to first page when filters change
  }, [filterValues])

  useEffect(() => {
    const queryParams = buildBackendQuery(debouncedFilterValues, filterConfig)
    fetchUsers(queryParams)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedFilterValues, page, pageSize])

  const handleViewUser = (user: IUser) => {
    setSelected(user)
    setOpenDetail(true)
  }

  const handleEditUser = (user: IUser) => {
    setSelected(user)
    setOpenEdit(true)
  }

  const { user: currentUser } = useAuth()

  const handleDeleteUser = (user: IUser) => {
    if (currentUser && String(user.id) === String(currentUser.id)) {
      toast.error('Không thể xóa tài khoản đang đăng nhập')

      return
    }
    setSelected(user)
    setOpenDelete(true)
  }

  const confirmDeleteUser = async () => {
    if (!selected) return

    setActionLoading(true)
    try {
      await deleteUser(selected.id)
      toast.success('Xóa người dùng thành công')
      fetchUsers()
      setOpenDelete(false)
      setSelected(null)
    } catch (error: any) {
      if (error?.response?.data?.message) {
        toast.error(error.response.data.message)
      } else {
        toast.error('Có lỗi xảy ra khi xóa người dùng')
      }
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusColor = (status: number) => {
    return status === 0 ? 'success' : 'error'
  }

  const getStatusText = (status: number) => {
    return status === 0 ? 'Hoạt động' : 'Tạm khóa'
  }

  const getRoleText = (roleId: number) => {
    return roleId === 1 ? 'Admin' : 'Customer'
  }

  const getRoleColor = (roleId: number) => {
    return roleId === 1 ? 'error' : 'primary'
  }

  return (
    <>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant='h4' component='h1'>
            Quản lý người dùng
          </Typography>
          <Button variant='contained' startIcon={<AddIcon />} onClick={() => setOpenCreate(true)}>
            Thêm người dùng
          </Button>
        </Box>

        <AdvancedFilter
          config={filterConfig}
          values={filterValues}
          onChange={handleFilterChange}
          onReset={resetFilters}
        />
      </Box>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <TableContainer>
          <Table sx={{ minWidth: 750 }}>
            <TableHead>
              <TableRow>  
                <TableCell align='center'>STT</TableCell>
                <TableCell>Ảnh đại diện</TableCell>
                <TableCell>Họ và tên</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Số điện thoại</TableCell>
                <TableCell>Vai trò</TableCell>
                <TableCell>Giới tính</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Ngày tạo</TableCell>
                <TableCell align='center'>Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} align='center'>
                    <Spinner />
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align='center'>
                    <Typography variant='body2' color='textSecondary'>
                      Không có dữ liệu
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user, index) => (
                  <TableRow key={user.id} hover>
                    <TableCell align='center'>
                      <Typography variant='body2' color='text.secondary'>
                        {(page - 1) * pageSize + index + 1}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Avatar alt={user.fullName} sx={{ width: 40, height: 40 }}>
                        {user.fullName?.charAt(0).toUpperCase()}
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2' fontWeight='medium'>
                        {user.fullName}
                      </Typography>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone_number || ''}</TableCell>
                    <TableCell>
                      <Chip label={getRoleText(user.role_id)} color={getRoleColor(user.role_id)} size='small' />
                    </TableCell>
                    <TableCell>{user.gender === '0' ? 'Nam' : user.gender === '1' ? 'Nữ' : ''}</TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusText(Number(user.status))}
                        color={getStatusColor(Number(user.status))}
                        size='small'
                      />
                    </TableCell>
                    <TableCell>{formatCompactVN(user.created_at)}</TableCell>
                    <TableCell align='center'>
                      <Stack direction='row' spacing={1} justifyContent='center'>
                        <Tooltip title='Xem chi tiết'>
                          <IconButton size='small' onClick={() => handleViewUser(user)}>
                            <VisibilityIcon fontSize='small' />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title='Chỉnh sửa'>
                          <IconButton size='small' onClick={() => handleEditUser(user)}>
                            <EditIcon fontSize='small' />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title='Xóa'>
                          <IconButton size='small' onClick={() => handleDeleteUser(user)} color='error'>
                            <DeleteIcon fontSize='small' />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
          {/* {totalPages > 1 && ( */}
          <CustomPagination
            page={page}
            pageSize={pageSize}
            rowLength={totalCount}
            totalPages={totalPages}
            pageSizeOptions={PAGE_SIZE_OPTION}
            onChangePagination={(newPage: number, newPageSize: number) => {
              setPage(newPage)
              setPageSize(newPageSize)
            }}
          />
          {/* )} */}
        </Box>
      </Paper>

      {/* Dialogs */}
      <UserDetailDialog
        open={openDetail}
        user={selected}
        onClose={() => {
          setOpenDetail(false)
          setSelected(null)
        }}
      />

      <UserEditDialog
        open={openEdit}
        user={selected}
        onClose={() => {
          setOpenEdit(false)
          setSelected(null)
        }}
        onSuccess={() => {
          fetchUsers()
          setOpenEdit(false)
          setSelected(null)
        }}
      />

      <UserCreateDialog
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onSuccess={() => {
          fetchUsers()
          setOpenCreate(false)
        }}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa người dùng "{selected?.fullName}"? Hành động này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDelete(false)}>Hủy</Button>
          <Button variant='contained' color='error' onClick={confirmDeleteUser} disabled={actionLoading}>
            {actionLoading ? 'Đang xóa...' : 'Xóa'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

;(UserPage as any).getLayout = (page: React.ReactNode) => <ManageSystemLayout>{page}</ManageSystemLayout>

export default UserPage
