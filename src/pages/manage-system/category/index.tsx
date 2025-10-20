import React, { useEffect, useMemo, useState } from 'react'
import type { NextPage } from 'next'
import {
  Box,
  Button,
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
  TextField,
  Typography
} from '@mui/material'
import Avatar from '@mui/material/Avatar'
import Chip from '@mui/material/Chip'
import { Card, CardContent } from '@mui/material'
import StarRoundedIcon from '@mui/icons-material/StarRounded'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import VisibilityIcon from '@mui/icons-material/Visibility'
import ManageSystemLayout from 'src/views/layouts/ManageSystemLayout'
import { getCategories, createCategory, updateCategory, deleteCategory, getCategoryById } from 'src/services/category'
import type {
  TCategory,
  TCreateCategory,
  TUpdateCategory,
  GetCategorysResponse,
  GetCategoryResponse
} from 'src/types/category/manage'
import { uploadImage } from 'src/services/file'
import Spinner from 'src/components/spinner'
import { formatCompactVN } from 'src/utils/date'
import toast from 'react-hot-toast'
import AdvancedFilter, { FilterConfig, useAdvancedFilter } from 'src/components/advanced-filter'
import CustomPagination from 'src/components/custom-pagination'
import { PAGE_SIZE_OPTION } from 'src/configs/gridConfig'

const CategoryPage: NextPage = () => {
  const [categories, setCategories] = useState<TCategory[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [actionLoading, setActionLoading] = useState<boolean>(false)
  const [openCreate, setOpenCreate] = useState<boolean>(false)
  const [openEdit, setOpenEdit] = useState<boolean>(false)
  const [selected, setSelected] = useState<TCategory | null>(null)
  const [nameInput, setNameInput] = useState<string>('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [descriptionInput, setDescriptionInput] = useState<string>('')

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTION[0])

  const filterConfig: FilterConfig = React.useMemo(() => {
    return {
      searchFields: [{ key: 'name', label: 'Tên danh mục', type: 'string' }],
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
        { value: 'name_asc', label: 'Tên A-Z' },
        { value: 'name_desc', label: 'Tên Z-A' },
        { value: 'created_at_desc', label: 'Mới nhất' },
        { value: 'created_at_asc', label: 'Cũ nhất' }
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
      sort: 'created_at_desc'
    }
  })

  const totalCategories = categories.length
  const totalProducts = 0
  const avgRating = undefined as number | undefined
  const newCategories = undefined as number | undefined

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await getCategories()
      const data = res as GetCategorysResponse
      const allCategories = data?.categorys?.items || []
      setCategories(allCategories)
    } catch (err: any) {
      toast.error(err?.message || 'Lỗi tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const filtered = useMemo(() => {
    let result = [...categories]

    if (filterValues.search) {
      const searchLower = filterValues.search.toLowerCase().trim()
      result = result.filter(c => c.name.toLowerCase().includes(searchLower))
    }

    Object.entries(filterValues.filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        if (key === 'del_flag') {
          result = result.filter(c => c.del_flag === value)
        }
      }
    })

    if (filterValues.sort) {
      const [field, direction] = filterValues.sort.split('_')
      result.sort((a, b) => {
        let aValue: any
        let bValue: any

        switch (field) {
          case 'name':
            aValue = a.name?.toLowerCase() || ''
            bValue = b.name?.toLowerCase() || ''
            break
          case 'created':
            aValue = new Date(a.created_at || 0)
            bValue = new Date(b.created_at || 0)
            break
          default:
            aValue = a.name?.toLowerCase() || ''
            bValue = b.name?.toLowerCase() || ''
        }

        if (direction === 'desc') {
          return aValue < bValue ? 1 : -1
        }

        return aValue > bValue ? 1 : -1
      })
    }

    return result
  }, [categories, filterValues])

  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize

    return filtered.slice(startIndex, endIndex)
  }, [filtered, page, pageSize])

  const totalPages = Math.ceil(filtered.length / pageSize)

  const handleChangePagination = (newPage: number, newPageSize: number) => {
    setPage(newPage)
    setPageSize(newPageSize)
  }

  const handleOpenCreate = () => {
    setNameInput('')
    setDescriptionInput('')
    setImageFile(null)
    setImagePreview(null)
    setOpenCreate(true)
  }

  const handleCreate = async () => {
    const payload: TCreateCategory = { name: nameInput.trim() }
    if (!payload.name) return toast.error('Tên phân loại không được để trống')
    try {
      setActionLoading(true)
      if (imageFile) {
        const uploadRes = await uploadImage(imageFile)
        const imageUrl = (uploadRes as any)?.uploadedImage?.url as string | undefined
        if (imageUrl) payload.image_url = imageUrl
      }
      if (descriptionInput.trim()) payload.description = descriptionInput.trim()
      const res = await createCategory(payload)
      if ((res as any)?.category) {
        toast.success('Tạo phân loại thành công')
        setOpenCreate(false)
        setImageFile(null)
        setImagePreview(null)
        fetchData()
      } else {
        throw new Error('Tạo thất bại')
      }
    } catch (err: any) {
      toast.error(err?.message || 'Tạo thất bại')
    } finally {
      setActionLoading(false)
    }
  }

  const [editDescription, setEditDescription] = useState<string>('')
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null)
  const [editImageFile, setEditImageFile] = useState<File | null>(null)

  const handleOpenEdit = async (category: TCategory) => {
    try {
      setActionLoading(true)
      const res = (await getCategoryById(category.id)) as GetCategoryResponse
      const full = res?.category || category
      setSelected(full)
      setNameInput(full.name)
      setEditDescription(full.description || '')
      setEditImagePreview(full.image_url || null)
      setOpenEdit(true)
    } catch (e) {
      toast.error('Không tải được chi tiết phân loại')
    } finally {
      setActionLoading(false)
    }
  }

  const handleEdit = async () => {
    if (!selected) return
    const payload: TUpdateCategory = { name: nameInput.trim() }
    if (!payload.name) return toast.error('Tên phân loại không được để trống')
    try {
      setActionLoading(true)
      if (editImageFile) {
        const uploadRes = await uploadImage(editImageFile)
        const imageUrl = (uploadRes as any)?.uploadedImage?.url as string | undefined
        if (imageUrl) (payload as any).image_url = imageUrl
      }
      if (editDescription.trim()) (payload as any).description = editDescription.trim()

      const res = await updateCategory(selected.id, payload)
      if ((res as any)?.category) {
        toast.success('Cập nhật phân loại thành công')
        setOpenEdit(false)
        setSelected(null)
        setEditImageFile(null)
        setEditImagePreview(null)
        fetchData()
      } else {
        throw new Error('Cập nhật thất bại')
      }
    } catch (err: any) {
      toast.error(err?.message || 'Cập nhật thất bại')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async (category: TCategory) => {
    if (!confirm(`Xóa phân loại "${category.name}"?`)) return
    try {
      setActionLoading(true)
      const res = await deleteCategory(category.id)
      if ((res as any)?.category || (res as any)?.success) {
        toast.success('Xóa phân loại thành công')
        fetchData()
      } else {
        throw new Error('Xóa thất bại')
      }
    } catch (err: any) {
      toast.error(err?.message || 'Xóa thất bại')
    } finally {
      setActionLoading(false)
    }
  }

  const [openView, setOpenView] = useState<boolean>(false)
  const [viewing, setViewing] = useState<TCategory | null>(null)
  const handleOpenView = async (category: TCategory) => {
    try {
      setActionLoading(true)
      const res = (await getCategoryById(category.id)) as GetCategoryResponse
      setViewing(res?.category || category)
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
          Quản lý phân loại
        </Typography>
        <Button variant='contained' startIcon={<AddIcon />} onClick={handleOpenCreate}>
          Thêm phân loại
        </Button>
      </Stack>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card elevation={0} sx={{ borderRadius: 2, border: theme => `1px solid ${theme.palette.divider}` }}>
            <CardContent>
              <Typography variant='body2' color='text.secondary'>
                Tổng phân loại
              </Typography>
              <Typography variant='h5' fontWeight={700} sx={{ my: 1 }}>
                {totalCategories || 'N/A'}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                {totalCategories ? `${totalCategories} đang hoạt động` : 'N/A'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card elevation={0} sx={{ borderRadius: 2, border: theme => `1px solid ${theme.palette.divider}` }}>
            <CardContent>
              <Typography variant='body2' color='text.secondary'>
                Tổng sản phẩm
              </Typography>
              <Typography variant='h5' fontWeight={700} sx={{ my: 1 }}>
                {totalProducts || 'N/A'}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                Từ tất cả phân loại
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card elevation={0} sx={{ borderRadius: 2, border: theme => `1px solid ${theme.palette.divider}` }}>
            <CardContent>
              <Typography variant='body2' color='text.secondary'>
                Đánh giá trung bình
              </Typography>
              <Stack direction='row' alignItems='center' spacing={1} sx={{ my: 1 }}>
                <Typography variant='h5' fontWeight={700}>
                  {typeof avgRating === 'number' ? avgRating.toFixed(1) : 'N/A'}
                </Typography>
                {typeof avgRating === 'number' && <StarRoundedIcon sx={{ color: 'warning.main' }} />}
              </Stack>
              <Typography variant='caption' color='text.secondary'>
                Trên 5 sao
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card elevation={0} sx={{ borderRadius: 2, border: theme => `1px solid ${theme.palette.divider}` }}>
            <CardContent>
              <Typography variant='body2' color='text.secondary'>
                Phân loại mới
              </Typography>
              <Typography variant='h5' fontWeight={700} sx={{ my: 1 }}>
                {typeof newCategories === 'number' ? newCategories : 'N/A'}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                Trong tháng này
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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
              <TableCell width={80}>Ảnh</TableCell>
              <TableCell>Tên phân loại</TableCell>
              <TableCell>Mô tả</TableCell>
              <TableCell width={120}>Trạng thái</TableCell>
              <TableCell width={120} align='right'>
                Thao tác
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((category, index) => (
              <TableRow key={category.id} hover sx={{ opacity: category.del_flag === '1' ? 0.6 : 1 }}>
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
                  <Avatar
                    src={category.image_url || undefined}
                    alt={category.name}
                    variant='rounded'
                    sx={{ width: 40, height: 40 }}
                  >
                    {category.name?.charAt(0) || 'C'}
                  </Avatar>
                </TableCell>
                <TableCell sx={{ textDecoration: category.del_flag === '1' ? 'line-through' : 'none' }}>
                  {category.name}
                </TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>{category.description || '-'}</TableCell>
                <TableCell width={120}>
                  {category.del_flag === '1' ? (
                    <Chip label='Đã xóa' color='error' size='small' variant='outlined' />
                  ) : (
                    <Chip label='Hoạt động' color='success' size='small' variant='outlined' />
                  )}
                </TableCell>
                <TableCell align='right'>
                  <Stack direction='row' spacing={1} justifyContent='flex-end'>
                    <IconButton size='small' onClick={() => handleOpenView(category)}>
                      <VisibilityIcon fontSize='small' />
                    </IconButton>
                    <IconButton
                      size='small'
                      disabled={category.del_flag === '1'}
                      onClick={() => handleOpenEdit(category)}
                    >
                      <EditIcon fontSize='small' />
                    </IconButton>
                    <IconButton
                      size='small'
                      color='error'
                      disabled={category.del_flag === '1'}
                      onClick={() => handleDelete(category)}
                    >
                      <DeleteIcon fontSize='small' />
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
            {paginatedData.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align='center'>
                  {loading ? 'Đang tải...' : 'Không có dữ liệu'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Custom Pagination */}
      <Box sx={{ mt: 3 }}>
        <CustomPagination
          page={page}
          pageSize={pageSize}
          rowLength={filtered.length}
          totalPages={totalPages}
          pageSizeOptions={PAGE_SIZE_OPTION}
          onChangePagination={handleChangePagination}
        />
      </Box>

      {/* Create Dialog */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} fullWidth maxWidth='xs'>
        <DialogTitle>Thêm phân loại</DialogTitle>
        <DialogContent>
          <Box component='form' onSubmit={e => e.preventDefault()} sx={{ mt: 1 }}>
            <TextField
              autoFocus
              fullWidth
              label='Tên phân loại'
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
            />
            <TextField
              fullWidth
              multiline
              minRows={2}
              sx={{ mt: 2 }}
              label='Mô tả'
              value={descriptionInput}
              onChange={e => setDescriptionInput(e.target.value)}
            />
            <Box sx={{ mt: 2 }}>
              <Button component='label' variant='outlined'>
                Chọn ảnh
                <input
                  hidden
                  type='file'
                  accept='image/*'
                  onChange={e => {
                    const f = e.target.files?.[0] || null
                    setImageFile(f)
                    if (imagePreview) URL.revokeObjectURL(imagePreview)
                    setImagePreview(f ? URL.createObjectURL(f) : null)
                  }}
                />
              </Button>
              <Typography variant='caption' sx={{ ml: 2 }}>
                {imageFile ? imageFile.name : 'Chưa chọn ảnh'}
              </Typography>
              {imagePreview ? (
                <Box sx={{ mt: 2 }}>
                  <Avatar src={imagePreview} variant='rounded' sx={{ width: 72, height: 72 }} />
                </Box>
              ) : null}
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
        <DialogTitle>Cập nhật phân loại</DialogTitle>
        <DialogContent>
          <Box component='form' onSubmit={e => e.preventDefault()} sx={{ mt: 1 }}>
            <TextField
              autoFocus
              fullWidth
              label='Tên phân loại'
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
            />
            <TextField
              fullWidth
              multiline
              minRows={2}
              sx={{ mt: 2 }}
              label='Mô tả'
              value={editDescription}
              onChange={e => setEditDescription(e.target.value)}
            />
            <Box sx={{ mt: 2 }}>
              <Button component='label' variant='outlined'>
                Đổi ảnh
                <input
                  hidden
                  type='file'
                  accept='image/*'
                  onChange={e => {
                    const f = e.target.files?.[0] || null
                    setEditImageFile(f)
                    if (editImagePreview) URL.revokeObjectURL(editImagePreview)
                    setEditImagePreview(f ? URL.createObjectURL(f) : editImagePreview)
                  }}
                />
              </Button>
              <Typography variant='caption' sx={{ ml: 2 }}>
                {editImageFile ? editImageFile.name : 'Giữ nguyên nếu không chọn ảnh'}
              </Typography>
              {editImagePreview ? (
                <Box sx={{ mt: 2 }}>
                  <Avatar src={editImagePreview} variant='rounded' sx={{ width: 72, height: 72 }} />
                </Box>
              ) : null}
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
      <Dialog open={openView} onClose={() => setOpenView(false)} fullWidth maxWidth='xs'>
        <DialogTitle>Thông tin phân loại</DialogTitle>
        <DialogContent>
          {viewing ? (
            <Box sx={{ mt: 1 }}>
              <Stack direction='row' spacing={2} alignItems='center'>
                <Avatar src={viewing.image_url || undefined} variant='rounded' sx={{ width: 72, height: 72 }} />
                <Box>
                  <Typography variant='h6'>{viewing.name}</Typography>
                  <Chip
                    label={viewing.del_flag === '1' ? 'Đã xóa' : 'Hoạt động'}
                    color={viewing.del_flag === '1' ? 'error' : 'success'}
                    size='small'
                    variant='outlined'
                  />
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
                <Grid item xs={12} sm={6}>
                  <Typography variant='subtitle2' color='text.secondary'>
                    Tạo bởi
                  </Typography>
                  <Typography sx={{ mt: 0.5 }}>{viewing.created_by || '-'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant='subtitle2' color='text.secondary'>
                    Cập nhật bởi
                  </Typography>
                  <Typography sx={{ mt: 0.5 }}>{viewing.updated_by || '-'}</Typography>
                </Grid>
              </Grid>
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenView(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

;(CategoryPage as any).getLayout = (page: React.ReactNode) => <ManageSystemLayout>{page}</ManageSystemLayout>

export default CategoryPage
