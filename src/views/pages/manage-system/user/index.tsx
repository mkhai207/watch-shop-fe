import React, { useState, useEffect } from 'react'
import {
  Box,
  Avatar,
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
  Snackbar,
  Alert,
  IconButton
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera'

import { useAuth } from 'src/hooks/useAuth'
import { useFileUpload } from 'src/hooks/useFileUpload'
import { TUser } from 'src/types/auth'
import CustomPagination from 'src/components/custom-pagination'
import { PAGE_SIZE_OPTION } from 'src/configs/gridConfig'
import PermissionGuard from 'src/components/auth/PermissionGuard'

// Kiểu dữ liệu TypeScript cho người dùng
interface NewUser {
  fullName: string
  email: string
  phone: string
  password: string
  confirmPassword: string
}

// Kiểu dữ liệu cho validation errors
interface ValidationErrors {
  fullName?: string
  email?: string
  phone?: string
  password?: string
  confirmPassword?: string
}

const ellipsisStyle: React.CSSProperties = {
  maxWidth: 120,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  display: 'inline-block',
  verticalAlign: 'middle'
}

const AvatarCell = ({ src, alt }: { src: string | null; alt: string }) => (
  <TableCell sx={{ textAlign: 'center' }}>
    <Tooltip title={alt} arrow placement='bottom'>
      <Avatar src={src || undefined} alt={alt} sx={{ width: 40, height: 40, margin: '0 auto' }}>
        {alt.charAt(0)}
      </Avatar>
    </Tooltip>
  </TableCell>
)

const ActiveCell = ({ active, onClick, loading }: { active: boolean; onClick: () => void; loading: boolean }) => (
  <TableCell sx={{ textAlign: 'center' }}>
    <Tooltip title={active ? 'Hoạt động' : 'Click để kích hoạt'} arrow placement='bottom'>
      <Typography
        sx={{
          color: active ? 'green' : 'red',
          fontWeight: 'bold',
          cursor: active ? 'default' : 'pointer',
          userSelect: 'none',
          opacity: loading ? 0.6 : 1
        }}
        onClick={active ? undefined : onClick}
      >
        {active ? 'Hoạt động' : loading ? 'Đang kích hoạt...' : 'Không hoạt động'}
      </Typography>
    </Tooltip>
  </TableCell>
)

const ManageUserPage: React.FC = () => {
  // State declarations
  const { fetchUsers, createNewUser, updateUserProfile, deleteUserProfile } = useAuth()
  const { uploadFile, isUploading } = useFileUpload()
  const [users, setUsers] = useState<TUser[]>([])
  const [loading, setLoading] = useState(false)
  const [editModal, setEditModal] = useState(false)
  const [editUser, setEditUser] = useState<TUser | null>(null)
  const [addModal, setAddModal] = useState(false)
  const [newUser, setNewUser] = useState<NewUser>({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTION[0])
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<string | null>(null)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success')
  const itemsPerPage = pageSize // Use dynamic page size

  // Debug validation errors
  useEffect(() => {
    console.log('Current validation errors:', validationErrors)
  }, [validationErrors])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const response = await fetchUsers()
      setUsers(response.data)
    } catch (err: any) {
      showSnackbar(err.message || 'Failed to fetch users', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Load users from API
  useEffect(() => {
    loadUsers()
  }, []) // Remove fetchUsers dependency to prevent infinite re-renders

  // Handlers
  const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbarMessage(message)
    setSnackbarSeverity(severity)
    setSnackbarOpen(true)
  }

  const handleSnackbarClose = () => {
    setSnackbarOpen(false)
  }

  const handleDeleteClick = (id: string) => {
    setUserToDelete(id)
    setDeleteConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!userToDelete) return

    try {
      setLoading(true)

      // Call API to deactivate user (soft delete)
      await deleteUserProfile(userToDelete)

      // Reload users list after successful deactivation
      await loadUsers()
      showSnackbar('Vô hiệu hóa người dùng thành công')

      console.log('User deactivated successfully')
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi vô hiệu hóa người dùng'
      showSnackbar(errorMsg, 'error')
    } finally {
      setLoading(false)
      setDeleteConfirmOpen(false)
      setUserToDelete(null)
    }
  }

  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false)
    setUserToDelete(null)
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)

      // Create preview URL
      const reader = new FileReader()
      reader.onload = e => {
        setPreviewUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
  }

  const handleEdit = (user: TUser) => {
    setEditUser(user)
    setSelectedFile(null)
    setPreviewUrl(null)
    setEditModal(true)
  }

  const handleSaveEdit = async () => {
    if (editUser) {
      try {
        setLoading(true)

        // Upload ảnh trước nếu có file được chọn
        let avatarUrl = editUser.avatar
        if (selectedFile) {
          try {
            const uploadResponse = await uploadFile(selectedFile)
            avatarUrl = uploadResponse.data?.url || uploadResponse.data?.file_path || uploadResponse.data
          } catch (uploadError: any) {
            showSnackbar('Lỗi khi upload ảnh: ' + (uploadError.message || 'Unknown error'), 'error')

            return
          }
        }

        // Prepare data for API
        const updateData: {
          fullname?: string
          phone?: string
          avatar?: string
          birthday?: string
          gender?: string
          active?: boolean
          role_id?: number
        } = {}

        // Only include fields that have been changed
        if (editUser.full_name !== users.find(u => u.id === editUser.id)?.full_name) {
          updateData.fullname = editUser.full_name || undefined
        }
        if (editUser.phone !== users.find(u => u.id === editUser.id)?.phone) {
          updateData.phone = editUser.phone || undefined
        }
        if (avatarUrl !== users.find(u => u.id === editUser.id)?.avatar) {
          updateData.avatar = avatarUrl || undefined
        }
        if (editUser.birthday !== users.find(u => u.id === editUser.id)?.birthday) {
          updateData.birthday = editUser.birthday || undefined
        }
        if (editUser.gender !== users.find(u => u.id === editUser.id)?.gender) {
          updateData.gender = editUser.gender || undefined
        }
        if (editUser.active !== users.find(u => u.id === editUser.id)?.active) {
          updateData.active = editUser.active
        }
        if (editUser.role.id !== users.find(u => u.id === editUser.id)?.role.id) {
          updateData.role_id = parseInt(editUser.role.id)
        }

        // Call API to update user
        await updateUserProfile(editUser.id, updateData)

        // Reload users list after successful update
        await loadUsers()
        showSnackbar('Cập nhật người dùng thành công')

        setEditModal(false)
        setSelectedFile(null)
        setPreviewUrl(null)
      } catch (err: any) {
        const errorMsg = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi cập nhật người dùng'
        showSnackbar(errorMsg, 'error')
      } finally {
        setLoading(false)
      }
    }
  }

  // Validation functions
  const validateEmail = (email: string): string | undefined => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) return 'Email là bắt buộc'
    if (!emailRegex.test(email)) return 'Email không đúng định dạng'

    return undefined
  }

  const validatePhone = (phone: string): string | undefined => {
    const phoneRegex = /^[0-9]{10,11}$/
    if (!phone) return 'Số điện thoại là bắt buộc'
    if (!phoneRegex.test(phone)) return 'Số điện thoại phải có 10-11 chữ số'

    return undefined
  }

  const validatePassword = (password: string): string | undefined => {
    if (!password) return 'Mật khẩu là bắt buộc'
    if (password.length < 6) return 'Mật khẩu phải có ít nhất 6 ký tự'

    return undefined
  }

  const validateConfirmPassword = (password: string, confirmPassword: string): string | undefined => {
    if (!confirmPassword) return 'Xác nhận mật khẩu là bắt buộc'
    if (password !== confirmPassword) return 'Mật khẩu xác nhận không khớp'

    return undefined
  }

  const validateFullName = (fullName: string): string | undefined => {
    if (!fullName.trim()) return 'Họ tên là bắt buộc'
    if (fullName.trim().length < 6) return 'Họ tên phải có ít nhất 6 ký tự'

    return undefined
  }

  const validateField = (field: keyof NewUser, value: string) => {
    let error: string | undefined

    switch (field) {
      case 'fullName':
        error = validateFullName(value)
        break
      case 'email':
        error = validateEmail(value)
        break
      case 'phone':
        error = validatePhone(value)
        break
      case 'password':
        error = validatePassword(value)
        break
      case 'confirmPassword':
        error = validateConfirmPassword(newUser.password, value)
        break
    }

    console.log(`Validating ${field}: "${value}" -> error: "${error}"`)

    setValidationErrors(prev => {
      const newErrors = {
        ...prev,
        [field]: error
      }
      console.log('New validation errors:', newErrors)

      return newErrors
    })

    return !error
  }

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {}

    errors.fullName = validateFullName(newUser.fullName)
    errors.email = validateEmail(newUser.email)
    errors.phone = validatePhone(newUser.phone)
    errors.password = validatePassword(newUser.password)
    errors.confirmPassword = validateConfirmPassword(newUser.password, newUser.confirmPassword)

    setValidationErrors(errors)

    return !Object.values(errors).some(error => error)
  }

  // Helper function to map API field names to form field names
  const mapApiFieldToFormField = (apiField: string): keyof ValidationErrors | null => {
    const fieldMapping: { [key: string]: keyof ValidationErrors } = {
      fullName: 'fullName',
      full_name: 'fullName',
      email: 'email',
      phone: 'phone',
      password: 'password',
      confirmPassword: 'confirmPassword',
      confirm_password: 'confirmPassword'
    }

    return fieldMapping[apiField] || null
  }

  const handleAdd = () => {
    setNewUser({ fullName: '', email: '', phone: '', password: '', confirmPassword: '' })
    setValidationErrors({})
    setAddModal(true)

    setTimeout(() => {
      console.log('Modal opened, validation errors reset')
    }, 100)
  }

  const handleSaveAdd = async () => {
    // Validate form before submitting
    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)
      setValidationErrors({}) // Clear previous validation errors
      await createNewUser(newUser)

      // Reload users list after successful creation
      await loadUsers()
      showSnackbar('Tạo người dùng thành công')

      setAddModal(false)
      setNewUser({ fullName: '', email: '', phone: '', password: '', confirmPassword: '' })
      setValidationErrors({})
    } catch (err: any) {
      // Handle API validation errors
      if (err.response?.data?.errors) {
        const apiErrors: ValidationErrors = {}

        // Parse API error messages and map to form fields
        Object.keys(err.response.data.errors).forEach(apiField => {
          const errorMessage = err.response.data.errors[apiField]
          const formField = mapApiFieldToFormField(apiField)

          if (formField) {
            if (Array.isArray(errorMessage)) {
              // If error is an array, take the first message
              apiErrors[formField] = errorMessage[0]
            } else {
              // If error is a string
              apiErrors[formField] = errorMessage
            }
          }
        })

        setValidationErrors(apiErrors)
      } else {
        // Handle general errors
        const errorMsg = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi tạo người dùng'
        showSnackbar(errorMsg, 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleToggleActive = async (id: string) => {
    // Chỉ cho phép kích hoạt người dùng (từ không hoạt động thành hoạt động)
    const user = users.find(u => u.id === id)
    if (!user || user.active) {
      return // Nếu user đã hoạt động thì không làm gì
    }

    try {
      setLoading(true)

      // Call API to activate user
      await updateUserProfile(id, { active: true })

      // Reload users list after successful activation
      await loadUsers()
      showSnackbar('Kích hoạt người dùng thành công')

      // Show success message (optional)
      console.log('User activated successfully')
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi kích hoạt người dùng'
      showSnackbar(errorMsg, 'error')
    } finally {
      setLoading(false)
    }
  }

  // Filtering and pagination
  const roles = Array.from(new Set(users.map(u => u.role.name).filter(Boolean)))
  const filteredUsers = users.filter(user => {
    const matchName = user.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchEmail = user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchRole = filterRole ? user.role.name === filterRole : true

    return (matchName || matchEmail) && matchRole
  })
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  const handleOnchangePagination = (page: number, pageSize: number) => {
    setCurrentPage(page)
    setPageSize(pageSize)
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
        Quản lý người dùng
      </Typography>

      <Box sx={{ display: 'flex', mb: 3, gap: 2, alignItems: 'flex-end' }}>
        <PermissionGuard apiPath='/api/v0/auth/register' method='POST'>
          <Button variant='contained' color='primary' onClick={handleAdd}>
            Thêm người dùng
          </Button>
        </PermissionGuard>
        <Box>
          <TextField
            size='small'
            sx={{ width: 180, minWidth: 120 }}
            placeholder='Tìm kiếm theo tên hoặc email'
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
          />
        </Box>
        <Box>
          <FormControl size='small' sx={{ width: 140, minWidth: 100 }}>
            <InputLabel>Vai trò</InputLabel>
            <Select
              value={filterRole}
              onChange={(e: SelectChangeEvent) => {
                setFilterRole(e.target.value)
                setCurrentPage(1)
              }}
              label='Vai trò'
            >
              <MenuItem value=''>Tất cả</MenuItem>
              {roles.map(role => (
                <MenuItem key={role} value={role}>
                  {role}
                </MenuItem>
              ))}
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
                    'Trạng thái',
                    'Avatar',
                    'Ngày sinh',
                    'Email',
                    'Họ tên',
                    'Giới tính',
                    'Số điện thoại',
                    'Vai trò',
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
                {paginatedUsers.length > 0 ? (
                  paginatedUsers.map(user => (
                    <TableRow key={user.id}>
                      <TableCell sx={{ textAlign: 'center' }}>{user.id}</TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>{formatDate(user.created_at)}</TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Tooltip title={user.created_by || 'N/A'}>
                          <span style={ellipsisStyle}>{user.created_by || 'N/A'}</span>
                        </Tooltip>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>{formatDate(user.updated_at)}</TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Tooltip title={user.updated_by || 'N/A'}>
                          <span style={ellipsisStyle}>{user.updated_by || 'N/A'}</span>
                        </Tooltip>
                      </TableCell>
                      <ActiveCell active={user.active} onClick={() => handleToggleActive(user.id)} loading={loading} />
                      <AvatarCell src={user.avatar} alt={user.full_name} />
                      <TableCell sx={{ textAlign: 'center' }}>
                        {user.birthday ? formatDate(user.birthday) : 'N/A'}
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Tooltip title={user.email}>
                          <span style={ellipsisStyle}>{user.email}</span>
                        </Tooltip>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Tooltip title={user.full_name}>
                          <span style={ellipsisStyle}>{user.full_name}</span>
                        </Tooltip>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>{user.gender || 'N/A'}</TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Tooltip title={user.phone}>
                          <span style={ellipsisStyle}>{user.phone}</span>
                        </Tooltip>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Chip
                          label={user.role.name}
                          color={user.role.code === 'ADMIN' ? 'primary' : 'default'}
                          size='small'
                        />
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <PermissionGuard apiPath='/api/users' method='PUT'>
                            <Tooltip title='Sửa'>
                              <IconButton
                                color='warning'
                                size='small'
                                onClick={() => handleEdit(user)}
                                sx={{ '&:hover': { backgroundColor: 'rgba(237, 108, 2, 0.1)' } }}
                              >
                                <EditIcon fontSize='small' />
                              </IconButton>
                            </Tooltip>
                          </PermissionGuard>
                          <PermissionGuard apiPath='/api/users' method='DELETE'>
                            <Tooltip title='Vô hiệu hóa'>
                              <IconButton
                                color='error'
                                size='small'
                                onClick={() => handleDeleteClick(user.id)}
                                disabled={loading}
                                sx={{ '&:hover': { backgroundColor: 'rgba(211, 47, 47, 0.1)' } }}
                              >
                                <DeleteIcon fontSize='small' />
                              </IconButton>
                            </Tooltip>
                          </PermissionGuard>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={14} sx={{ textAlign: 'center' }}>
                      Không có người dùng nào
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <CustomPagination
            page={currentPage}
            pageSize={pageSize}
            rowLength={filteredUsers.length}
            totalPages={totalPages}
            pageSizeOptions={PAGE_SIZE_OPTION}
            onChangePagination={handleOnchangePagination}
          />
        </>
      )}

      {/* Edit User Dialog */}
      <Dialog open={editModal} onClose={() => setEditModal(false)} maxWidth='sm' fullWidth>
        <DialogTitle>Sửa thông tin người dùng</DialogTitle>
        <DialogContent>
          {editUser && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <TextField
                label='Họ tên'
                value={editUser.full_name || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditUser({ ...editUser, full_name: e.target.value })
                }
                fullWidth
                placeholder='Nhập họ tên mới'
              />
              <TextField
                label='Số điện thoại'
                value={editUser.phone || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditUser({ ...editUser, phone: e.target.value })
                }
                fullWidth
                placeholder='Nhập số điện thoại mới'
              />

              {/* Avatar Upload Section */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant='subtitle2' color='text.secondary'>
                  Ảnh đại diện
                </Typography>

                {/* Current Avatar or Preview */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar
                    src={previewUrl || editUser.avatar || undefined}
                    alt={editUser.full_name}
                    sx={{ width: 80, height: 80 }}
                  >
                    {editUser.full_name.charAt(0)}
                  </Avatar>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Button
                      variant='outlined'
                      component='label'
                      startIcon={<PhotoCameraIcon />}
                      size='small'
                      disabled={isUploading}
                    >
                      {selectedFile ? 'Thay đổi ảnh' : 'Chọn ảnh'}
                      <input type='file' accept='image/*' hidden onChange={handleFileSelect} />
                    </Button>
                    {selectedFile && (
                      <Button variant='text' color='error' size='small' onClick={handleRemoveFile}>
                        Xóa ảnh đã chọn
                      </Button>
                    )}
                  </Box>
                </Box>
              </Box>
              <TextField
                label='Ngày sinh'
                type='date'
                value={editUser.birthday ? editUser.birthday.split('T')[0] : ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const date = e.target.value
                  const isoDate = date ? new Date(date).toISOString() : ''
                  setEditUser({ ...editUser, birthday: isoDate })
                }}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <FormControl fullWidth>
                <InputLabel>Giới tính</InputLabel>
                <Select
                  value={(() => {
                    // Map API gender format to Vietnamese display
                    if (editUser.gender === 'MALE') return 'Nam'
                    if (editUser.gender === 'FEMALE') return 'Nữ'
                    if (editUser.gender === 'OTHER') return 'Khác'

                    return ''
                  })()}
                  onChange={(e: SelectChangeEvent) => {
                    const gender = e.target.value

                    const apiGender = gender === 'Nam' ? 'MALE' : gender === 'Nữ' ? 'FEMALE' : 'OTHER'
                    setEditUser({ ...editUser, gender: apiGender })
                  }}
                  label='Giới tính'
                >
                  <MenuItem value='Nam'>Nam</MenuItem>
                  <MenuItem value='Nữ'>Nữ</MenuItem>
                  <MenuItem value='Khác'>Khác</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Vai trò</InputLabel>
                <Select
                  value={editUser.role.id}
                  onChange={(e: SelectChangeEvent) => {
                    const selectedRoleId = e.target.value

                    // Find the role object by ID
                    const allRoles = [
                      { id: '1', code: 'ADMIN', name: 'Admin' },
                      { id: '2', code: 'STAFF', name: 'Staff' },
                      { id: '3', code: 'CUSTOMER', name: 'Customer' }
                    ]
                    const selectedRole = allRoles.find(role => role.id === selectedRoleId)
                    if (selectedRole) {
                      setEditUser({ ...editUser, role: selectedRole })
                    }
                  }}
                  label='Vai trò'
                >
                  <MenuItem value='1'>Admin</MenuItem>
                  <MenuItem value='2'>Staff</MenuItem>
                  <MenuItem value='3'>Customer</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setEditModal(false)
              setSelectedFile(null)
              setPreviewUrl(null)
            }}
            disabled={loading || isUploading}
          >
            Huỷ
          </Button>
          <Button onClick={handleSaveEdit} variant='contained' color='primary' disabled={loading || isUploading}>
            {isUploading ? 'Đang tải ảnh...' : loading ? 'Đang cập nhật...' : 'Lưu'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog open={addModal} onClose={() => setAddModal(false)} maxWidth='sm' fullWidth>
        <DialogTitle>Thêm người dùng mới</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label='Họ tên'
              value={newUser.fullName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const value = e.target.value
                setNewUser({ ...newUser, fullName: value })

                setTimeout(() => validateField('fullName', value), 0)
              }}
              onBlur={e => validateField('fullName', e.target.value)}
              fullWidth
              required
              error={!!validationErrors.fullName}
              helperText={validationErrors.fullName || ' '}
              sx={{
                '& .MuiFormHelperText-root': {
                  color: validationErrors.fullName ? 'error.main' : 'text.secondary'
                }
              }}
            />
            <TextField
              label='Email'
              type='email'
              value={newUser.email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const value = e.target.value
                setNewUser({ ...newUser, email: value })
                validateField('email', value)
              }}
              onBlur={e => validateField('email', e.target.value)}
              fullWidth
              required
              error={!!validationErrors.email}
              helperText={validationErrors.email}
            />
            <TextField
              label='Số điện thoại'
              value={newUser.phone}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const value = e.target.value
                setNewUser({ ...newUser, phone: value })
                validateField('phone', value)
              }}
              onBlur={e => validateField('phone', e.target.value)}
              fullWidth
              required
              error={!!validationErrors.phone}
              helperText={validationErrors.phone}
            />
            <TextField
              label='Mật khẩu'
              type='password'
              value={newUser.password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const value = e.target.value
                setNewUser({ ...newUser, password: value })
                validateField('password', value)

                if (newUser.confirmPassword) {
                  validateField('confirmPassword', newUser.confirmPassword)
                }
              }}
              onBlur={e => validateField('password', e.target.value)}
              fullWidth
              required
              error={!!validationErrors.password}
              helperText={validationErrors.password}
            />
            <TextField
              label='Xác nhận mật khẩu'
              type='password'
              value={newUser.confirmPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const value = e.target.value
                setNewUser({ ...newUser, confirmPassword: value })
                validateField('confirmPassword', value)
              }}
              onBlur={e => validateField('confirmPassword', e.target.value)}
              fullWidth
              required
              error={!!validationErrors.confirmPassword}
              helperText={validationErrors.confirmPassword}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddModal(false)}>Huỷ</Button>
          <Button
            onClick={handleSaveAdd}
            variant='contained'
            color='primary'
            disabled={
              loading || Object.keys(validationErrors).some(key => validationErrors[key as keyof ValidationErrors])
            }
          >
            {loading ? 'Đang tạo...' : 'Lưu'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={handleCancelDelete} maxWidth='sm' fullWidth>
        <DialogTitle>Xác nhận vô hiệu hóa</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc muốn vô hiệu hóa người dùng này? Người dùng sẽ không thể đăng nhập nhưng dữ liệu vẫn được giữ
            lại.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Hủy</Button>
          <Button onClick={handleConfirmDelete} variant='contained' color='error' disabled={loading}>
            {loading ? 'Đang vô hiệu...' : 'Vô hiệu hóa'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} variant='filled' sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default ManageUserPage
