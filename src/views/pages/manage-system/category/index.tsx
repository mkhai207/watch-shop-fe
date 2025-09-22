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
  Alert,
  IconButton,
  Snackbar
} from '@mui/material'
import { Edit, Delete, Add } from '@mui/icons-material'
import CustomPagination from 'src/components/custom-pagination'
import { PAGE_SIZE_OPTION } from 'src/configs/gridConfig'

import { useCategory } from 'src/hooks/useCategory'
import { TCategory } from 'src/types/category'
import PermissionGuard from 'src/components/auth/PermissionGuard'

// Kiểu dữ liệu TypeScript cho phân loại mới
interface NewCategory {
  code: string
  name: string
}

const ellipsisStyle: React.CSSProperties = {
  maxWidth: 120,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  display: 'inline-block',
  verticalAlign: 'middle'
}

const ManageCategoryPage: React.FC = () => {
  // State declarations
  const { fetchCategories, categories, loading, createCategory, updateCategory, deleteCategory } = useCategory()
  const [editModal, setEditModal] = useState(false)
  const [editCategory, setEditCategory] = useState<TCategory | null>(null)
  const [addModal, setAddModal] = useState(false)
  const [newCategory, setNewCategory] = useState<NewCategory>({
    code: '',
    name: ''
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTION[0])
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<{ id: number; name: string; code: string } | null>(null)
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null)
  const [showError, setShowError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const itemsPerPage = pageSize

  // Load categories from API
  useEffect(() => {
    const loadCategories = async () => {
      try {
        await fetchCategories()
      } catch (err: any) {
        console.error('Error loading categories:', err)
      }
    }

    loadCategories()
  }, [fetchCategories])

  // Handlers
  const handleDelete = (id: number) => {
    const categoryToDelete = categories.find(c => c.id === id)
    if (categoryToDelete) {
      setCategoryToDelete({
        id: categoryToDelete.id,
        name: categoryToDelete.name,
        code: categoryToDelete.code
      })
      setDeleteConfirmOpen(true)
    }
  }

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return

    setDeleteLoading(categoryToDelete.id)

    try {
      console.log('Deleting category with ID:', categoryToDelete.id)

      // Call API to delete category
      await deleteCategory(categoryToDelete.id)

      // Close modal and reset state
      setDeleteConfirmOpen(false)
      setCategoryToDelete(null)

      // Success - no alert needed as data will be automatically updated
    } catch (err: any) {
      console.error('Error deleting category:', err)

      // Show error notification
      setErrorMessage(err.message || 'Có lỗi xảy ra khi xóa phân loại')
      setShowError(true)

      // Close modal and reset state on error too
      setDeleteConfirmOpen(false)
      setCategoryToDelete(null)
    } finally {
      setDeleteLoading(null)
    }
  }

  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false)
    setCategoryToDelete(null)
  }

  const handleErrorClose = () => {
    setShowError(false)
    setErrorMessage('')
  }

  const handleEdit = (category: TCategory) => {
    setEditCategory(category)
    setEditModal(true)
  }

  const handleSaveEdit = async () => {
    if (!editCategory) return

    try {
      // Validate input
      if (!editCategory.code.trim() || !editCategory.name.trim()) {
        alert('Vui lòng nhập đầy đủ mã và tên phân loại')

        return
      }

      // Prepare update data (only changed fields)
      const updateData: { code?: string; name?: string } = {}

      // Find original category to compare
      const originalCategory = categories.find(c => c.id === editCategory.id)
      if (originalCategory) {
        if (editCategory.code.trim() !== originalCategory.code) {
          updateData.code = editCategory.code.trim()
        }
        if (editCategory.name.trim() !== originalCategory.name) {
          updateData.name = editCategory.name.trim()
        }
      }

      // If no changes, just close modal
      if (Object.keys(updateData).length === 0) {
        setEditModal(false)

        return
      }

      console.log('Updating category with data:', updateData)

      // Call API to update category
      await updateCategory(editCategory.id, updateData)

      // Close modal
      setEditModal(false)

      // Show success message
      alert('Cập nhật phân loại thành công!')
    } catch (err: any) {
      console.error('Error updating category:', err)
      alert(err.message || 'Có lỗi xảy ra khi cập nhật phân loại')
    }
  }

  const handleAdd = () => {
    setNewCategory({ code: '', name: '' })
    setAddModal(true)
  }

  const handleSaveAdd = async () => {
    try {
      // Validate input
      if (!newCategory.code.trim() || !newCategory.name.trim()) {
        alert('Vui lòng nhập đầy đủ mã và tên phân loại')

        return
      }

      // Call API to create category
      await createCategory({
        code: newCategory.code.trim(),
        name: newCategory.name.trim()
      })

      // Close modal and reset form
      setAddModal(false)
      setNewCategory({ code: '', name: '' })

      // Success - no alert needed as data will be automatically updated
    } catch (err: any) {
      console.error('Error creating category:', err)
      alert(err.message || 'Có lỗi xảy ra khi tạo phân loại')
    }
  }

  // Filtering and pagination
  const filteredCategories = categories.filter(category => {
    const matchCode = category.code.toLowerCase().includes(searchTerm.toLowerCase())
    const matchName = category.name.toLowerCase().includes(searchTerm.toLowerCase())

    return matchCode || matchName
  })
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage)
  const paginatedCategories = filteredCategories.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

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
        Quản lý phân loại
      </Typography>

      <Box sx={{ display: 'flex', mb: 3, gap: 2, alignItems: 'flex-end' }}>
        <PermissionGuard apiPath='/api/v0/categories/create-category' method='POST'>
          <Button variant='contained' color='primary' onClick={handleAdd} startIcon={<Add />}>
            Thêm phân loại
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
                    'Mã phân loại',
                    'Tên phân loại',
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
                {paginatedCategories.length > 0 ? (
                  paginatedCategories.map(category => (
                    <TableRow key={category.id}>
                      <TableCell sx={{ textAlign: 'center' }}>{category.id}</TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>{formatDate(category.created_at)}</TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Tooltip title={category.created_by || 'N/A'}>
                          <span style={ellipsisStyle}>{category.created_by || 'N/A'}</span>
                        </Tooltip>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>{formatDate(category.updated_at)}</TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Tooltip title={category.updated_by || 'N/A'}>
                          <span style={ellipsisStyle}>{category.updated_by || 'N/A'}</span>
                        </Tooltip>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Chip label={category.code} color='primary' size='small' />
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Tooltip title={category.name}>
                          <span style={ellipsisStyle}>{category.name}</span>
                        </Tooltip>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <PermissionGuard apiPath='/api/v0/categories/update' method='PUT'>
                            <IconButton color='primary' onClick={() => handleEdit(category)} size='small'>
                              <Edit />
                            </IconButton>
                          </PermissionGuard>
                          <PermissionGuard apiPath='/api/v0/categories/delete' method='DELETE'>
                            <IconButton
                              color='error'
                              onClick={() => handleDelete(category.id)}
                              size='small'
                              disabled={deleteLoading === category.id}
                            >
                              {deleteLoading === category.id ? (
                                <CircularProgress size={16} color='error' />
                              ) : (
                                <Delete />
                              )}
                            </IconButton>
                          </PermissionGuard>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} sx={{ textAlign: 'center' }}>
                      Không có phân loại nào
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ mt: 4, mb: 4 }}>
            <CustomPagination
              onChangePagination={handleOnchangePagination}
              pageSizeOptions={PAGE_SIZE_OPTION}
              pageSize={pageSize}
              totalPages={totalPages}
              page={currentPage}
              rowLength={filteredCategories.length}
              isHideShowed
            />
          </Box>
        </>
      )}

      {/* Edit Category Dialog */}
      <Dialog open={editModal} onClose={() => setEditModal(false)} maxWidth='sm' fullWidth>
        <DialogTitle>Sửa thông tin phân loại</DialogTitle>
        <DialogContent>
          {editCategory && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <TextField
                label='Mã phân loại'
                value={editCategory.code}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditCategory({ ...editCategory, code: e.target.value })
                }
                fullWidth
              />
              <TextField
                label='Tên phân loại'
                value={editCategory.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditCategory({ ...editCategory, name: e.target.value })
                }
                fullWidth
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

      {/* Add Category Dialog */}
      <Dialog open={addModal} onClose={() => setAddModal(false)} maxWidth='sm' fullWidth>
        <DialogTitle>Thêm phân loại mới</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label='Mã phân loại'
              value={newCategory.code}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNewCategory({ ...newCategory, code: e.target.value })
              }
              fullWidth
            />
            <TextField
              label='Tên phân loại'
              value={newCategory.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNewCategory({ ...newCategory, name: e.target.value })
              }
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddModal(false)}>Huỷ</Button>
          <Button onClick={handleSaveAdd} variant='contained' color='primary'>
            Lưu
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={handleCancelDelete}
        aria-labelledby='delete-dialog-title'
        aria-describedby='delete-dialog-description'
      >
        <DialogTitle id='delete-dialog-title'>Xác nhận xóa phân loại</DialogTitle>
        <DialogContent>
          <Typography id='delete-dialog-description'>
            Bạn có chắc chắn muốn xóa phân loại "{categoryToDelete?.name}" ({categoryToDelete?.code})?
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
            ⚠️ Lưu ý: Đây là thao tác xóa vĩnh viễn và không thể khôi phục!
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color='inherit'>
            Hủy
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color='error'
            variant='contained'
            disabled={deleteLoading === categoryToDelete?.id}
          >
            {deleteLoading === categoryToDelete?.id ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={16} color='inherit' />
                Đang xóa...
              </Box>
            ) : (
              'Xóa'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error Snackbar */}
      <Snackbar
        open={showError}
        autoHideDuration={6000}
        onClose={handleErrorClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleErrorClose} severity='error' sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default ManageCategoryPage
