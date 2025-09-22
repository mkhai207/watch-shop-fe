import React, { useState, ChangeEvent, useEffect } from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  Paper,
  IconButton,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material'
import { Edit, Delete, Add } from '@mui/icons-material'
import CustomPagination from 'src/components/custom-pagination'
import { PAGE_SIZE_OPTION } from 'src/configs/gridConfig'
import { useBrand } from 'src/hooks/useBrand'
import { TBrand } from 'src/types/brand'
import PermissionGuard from 'src/components/auth/PermissionGuard'

const cellStyle = {
  maxWidth: '140px',
  whiteSpace: 'nowrap' as const,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  textAlign: 'center' as const,
  cursor: 'pointer'
}

const TooltipCell = ({ value }: { value: string | number }) => (
  <TableCell sx={cellStyle}>
    <Tooltip title={String(value)} arrow placement='bottom'>
      <span>{value}</span>
    </Tooltip>
  </TableCell>
)

const emptyBrand: TBrand = {
  id: '0',
  created_at: '',
  created_by: '',
  updated_at: '',
  updated_by: '',
  name: ''
}

const ManageBrandPage: React.FC = () => {
  const { fetchBrands, createNewBrand, updateExistingBrand, deleteExistingBrand } = useBrand()
  const [brands, setBrands] = useState<TBrand[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const [form, setForm] = useState<TBrand>(emptyBrand)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTION[0])
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [formError, setFormError] = useState('')
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [brandToDelete, setBrandToDelete] = useState<{ id: string; name: string } | null>(null)
  const [showError, setShowError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [searchBrandName, setSearchBrandName] = useState('')
  const itemsPerPage = pageSize

  // Load brands from API
  useEffect(() => {
    const loadBrands = async () => {
      setLoading(true)
      try {
        const response = await fetchBrands()
        setBrands(response.data)
      } catch (err: any) {
        setErrorMessage(err.message || 'Không thể tải danh sách thương hiệu')
        setShowError(true)
      } finally {
        setLoading(false)
      }
    }

    loadBrands()
  }, [fetchBrands])

  const handleOpenAdd = () => {
    const newId = brands && brands.length > 0 ? Math.max(...brands.map(b => Number(b.id))) + 1 : 1
    setForm({
      ...emptyBrand,
      id: String(newId),
      created_at: new Date().toISOString().slice(0, 10),
      created_by: 'admin'
    })
    setEditIndex(null)
    setOpen(true)
  }

  const handleOpenEdit = (index: number) => {
    if (brands && brands[index]) {
      setForm(brands[index])
      setEditIndex(index)
      setOpen(true)
    }
  }

  const handleClose = () => {
    setOpen(false)
    setForm(emptyBrand)
    setEditIndex(null)
    setFormError('') // Clear form error when closing
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev: TBrand) => ({
      ...prev,
      [name]: value
    }))

    // Clear form error when user starts typing
    if (formError) {
      setFormError('')
    }
  }

  const handleSave = async () => {
    if (!form.name.trim()) {
      setFormError('Vui lòng nhập tên thương hiệu')

      return
    }

    setSaving(true)
    setFormError('')

    try {
      if (editIndex !== null) {
        // Edit existing brand using API
        const response = await updateExistingBrand(form.id, { id: form.id, name: form.name })

        if (response.error) {
          throw response.error.message || 'Có lỗi xảy ra khi cập nhật thương hiệu'
        }

        // Reload brands from API after successful update
        const brandsResponse = await fetchBrands()
        if (brandsResponse.data) {
          setBrands(brandsResponse.data)
        }

        // Show success message for edit
        setSuccessMessage('Cập nhật thương hiệu thành công!')
        setShowSuccess(true)
        handleClose()
      } else {
        // Add new brand using API
        const response = await createNewBrand({ name: form.name })

        if (response.error) {
          throw response.error.message || 'Có lỗi xảy ra khi tạo thương hiệu'
        }

        // Reload brands from API after successful creation
        const brandsResponse = await fetchBrands()
        if (brandsResponse.data) {
          setBrands(brandsResponse.data)
        }

        // Show success message for create
        setSuccessMessage('Thêm thương hiệu thành công!')
        setShowSuccess(true)
        handleClose()
      }
    } catch (err: any) {
      // Don't close the form on error, just show the error message
      setFormError(err.message || 'Có lỗi xảy ra khi lưu thương hiệu')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = (brandId: string, brandName: string) => {
    setBrandToDelete({ id: brandId, name: brandName })
    setDeleteConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!brandToDelete) return

    setDeleteLoading(brandToDelete.id)

    try {
      console.log('🔄 Deleting brand with ID:', brandToDelete.id)
      const response = await deleteExistingBrand(brandToDelete.id)
      console.log('Delete API Response:', response)
      console.log('Response type:', typeof response)
      console.log('Is response an Error?', response instanceof Error)
      console.log('Response success property:', response?.success)
      console.log('Response isAxiosError:', response?.isAxiosError)

      // Check if response is an error object (from catch block in service)
      if (response instanceof Error || response?.response?.status || response?.isAxiosError) {
        console.error('❌ Delete failed - response is an error:', response)
        const errorMessage =
          response?.response?.data?.message || response?.message || 'Có lỗi xảy ra khi xóa thương hiệu'
        throw new Error(errorMessage)
      }

      // Check if response has error property or success is false
      if (response.error || response.success === false) {
        console.error('❌ Delete failed with error property:', response.error || response.message)
        throw new Error(response.error?.message || response.message || 'Có lỗi xảy ra khi xóa thương hiệu')
      }

      // Only proceed with success actions if we have a successful response
      console.log('✅ Delete successful, reloading brands...')

      // Reload brands from API after successful deletion
      const brandsResponse = await fetchBrands()
      if (brandsResponse.data) {
        setBrands(brandsResponse.data)
        console.log('✅ Brands reloaded successfully')
      }

      // Show success message for delete
      setSuccessMessage('Xóa thương hiệu thành công!')
      setShowSuccess(true)

      // Close modal and reset state
      setDeleteConfirmOpen(false)
      setBrandToDelete(null)
    } catch (err: any) {
      console.error('❌ Delete operation failed:', err)

      // Show error snackbar instead of setting global error
      setErrorMessage(err.message || 'Có lỗi xảy ra khi xóa thương hiệu')
      setShowError(true)

      // Also close modal and reset state on error
      setDeleteConfirmOpen(false)
      setBrandToDelete(null)
    } finally {
      setDeleteLoading(null)
    }
  }

  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false)
    setBrandToDelete(null)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  const handleOnchangePagination = (page: number, pageSize: number) => {
    setCurrentPage(page)
    setPageSize(pageSize)
  }

  const handleSearchBrand = (searchValue: string) => {
    setSearchBrandName(searchValue)
    setCurrentPage(1) // Reset to first page when searching
  }

  // Filter brands based on search
  const filteredBrands = brands.filter(brand => brand.name.toLowerCase().includes(searchBrandName.toLowerCase()))

  // Calculate pagination with filtered data
  const totalPages = Math.ceil(filteredBrands.length / itemsPerPage)
  const paginatedBrands = filteredBrands.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleSuccessClose = () => {
    setShowSuccess(false)
    setSuccessMessage('')
  }

  const handleErrorClose = () => {
    setShowError(false)
    setErrorMessage('')
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant='h4' component='h1'>
          Quản lý Thương hiệu
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <PermissionGuard apiPath='/api/v0/brands/create-brand' method='POST'>
          <Button variant='contained' startIcon={<Add />} onClick={handleOpenAdd} sx={{ backgroundColor: '#1976d2' }}>
            Thêm thương hiệu
          </Button>
        </PermissionGuard>
        <TextField
          size='small'
          placeholder='Tìm kiếm theo tên thương hiệu...'
          value={searchBrandName}
          onChange={e => handleSearchBrand(e.target.value)}
          sx={{ minWidth: 250 }}
        />
      </Box>

      {loading ? (
        <Box display='flex' justifyContent='center' alignItems='center' minHeight='200px'>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Tên thương hiệu</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Ngày tạo</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Người tạo</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Ngày cập nhật</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Người cập nhật</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedBrands && paginatedBrands.length > 0 ? (
                  paginatedBrands.map((brand, index) => {
                    const actualIndex = (currentPage - 1) * itemsPerPage + index

                    return (
                      <TableRow key={brand.id} hover>
                        <TooltipCell value={brand.id} />
                        <TooltipCell value={brand.name} />
                        <TooltipCell value={formatDate(brand.created_at)} />
                        <TooltipCell value={brand.created_by} />
                        <TooltipCell value={formatDate(brand.updated_at)} />
                        <TooltipCell value={brand.updated_by} />
                        <TableCell sx={{ textAlign: 'center' }}>
                          <PermissionGuard apiPath='/api/v0/brands/update' method='PUT'>
                            <IconButton color='primary' onClick={() => handleOpenEdit(actualIndex)} size='small'>
                              <Edit />
                            </IconButton>
                          </PermissionGuard>
                          <PermissionGuard apiPath='/api/v0/brands/delete' method='DELETE'>
                            <IconButton
                              color='error'
                              onClick={() => handleDelete(brand.id, brand.name)}
                              size='small'
                              disabled={deleteLoading === brand.id}
                            >
                              {deleteLoading === brand.id ? <CircularProgress size={16} color='error' /> : <Delete />}
                            </IconButton>
                          </PermissionGuard>
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} sx={{ textAlign: 'center', py: 3 }}>
                      Không có dữ liệu
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <Box sx={{ mt: 4, mb: 4 }}>
            <CustomPagination
              onChangePagination={handleOnchangePagination}
              pageSizeOptions={PAGE_SIZE_OPTION}
              pageSize={pageSize}
              totalPages={totalPages}
              page={currentPage}
              rowLength={filteredBrands.length}
              isHideShowed
            />
          </Box>
        </>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth='sm' fullWidth>
        <DialogTitle>{editIndex !== null ? 'Chỉnh sửa thương hiệu' : 'Thêm thương hiệu mới'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin='dense'
            name='name'
            label='Tên thương hiệu'
            type='text'
            fullWidth
            variant='outlined'
            value={form.name}
            onChange={handleChange}
            sx={{ mt: 2 }}
            error={!!formError}
            helperText={formError}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color='inherit'>
            Hủy
          </Button>
          <Button onClick={handleSave} variant='contained' color='primary' disabled={saving}>
            {saving ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={16} color='inherit' />
                {editIndex !== null ? 'Đang cập nhật...' : 'Đang thêm...'}
              </Box>
            ) : editIndex !== null ? (
              'Cập nhật'
            ) : (
              'Thêm'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={6000}
        onClose={handleSuccessClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={handleSuccessClose} severity='success' sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>

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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={handleCancelDelete}
        aria-labelledby='delete-dialog-title'
        aria-describedby='delete-dialog-description'
      >
        <DialogTitle id='delete-dialog-title'>Xác nhận xóa thương hiệu</DialogTitle>
        <DialogContent>
          <Typography id='delete-dialog-description'>
            Bạn có chắc chắn muốn xóa thương hiệu "{brandToDelete?.name}"?
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
            Hành động này không thể hoàn tác.
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
            disabled={deleteLoading === brandToDelete?.id}
          >
            {deleteLoading === brandToDelete?.id ? (
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
    </Box>
  )
}

export default ManageBrandPage
