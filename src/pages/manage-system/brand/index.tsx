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
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Chip from '@mui/material/Chip'
import { Card, CardContent } from '@mui/material'
import StarRoundedIcon from '@mui/icons-material/StarRounded'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
import VisibilityIcon from '@mui/icons-material/Visibility'
import ManageSystemLayout from 'src/views/layouts/ManageSystemLayout'
import { getBrands, createBrand, updateBrand, deleteBrand, getBrandById } from 'src/services/brand'
import type { TBrand, TCreateBrand, TUpdateBrand, GetBrandsResponse, GetBrandResponse } from 'src/types/brand'
import { uploadImage } from 'src/services/file'
import Spinner from 'src/components/spinner'
import { formatCompactVN } from 'src/utils/date'
import toast from 'react-hot-toast'

const BrandPage: NextPage = () => {
  const [brands, setBrands] = useState<TBrand[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [actionLoading, setActionLoading] = useState<boolean>(false)
  const [search, setSearch] = useState<string>('')
  const [openCreate, setOpenCreate] = useState<boolean>(false)
  const [openEdit, setOpenEdit] = useState<boolean>(false)
  const [selected, setSelected] = useState<TBrand | null>(null)
  const [nameInput, setNameInput] = useState<string>('')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [descriptionInput, setDescriptionInput] = useState<string>('')

  // Simple derived metrics (mock if not provided by API)
  const totalBrands = brands.length
  const totalProducts = 0 // Backend not provided here; keep 0 and show N/A
  const avgRating = undefined as number | undefined // Show N/A when undefined
  const newBrands = undefined as number | undefined // Show N/A when undefined

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await getBrands()
      const data = res as GetBrandsResponse
      setBrands(data?.brands?.rows || [])
    } catch (err: any) {
      toast.error(err?.message || 'Lỗi tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'deleted'>('all')
  const filtered = useMemo(() => {
    const bySearch = brands.filter(b => {
      if (!search) return true
      const lower = search.toLowerCase().trim()
      return b.name.toLowerCase().includes(lower) || b.id.toLowerCase().includes(lower)
    })
    const byStatus = bySearch.filter(b => {
      if (statusFilter === 'all') return true
      const deleted = b.del_flag === '1'
      return statusFilter === 'deleted' ? deleted : !deleted
    })
    return byStatus
  }, [brands, search, statusFilter])

  const handleOpenCreate = () => {
    setNameInput('')
    setDescriptionInput('')
    setLogoFile(null)
    setLogoPreview(null)
    setOpenCreate(true)
  }

  const handleCreate = async () => {
    const payload: TCreateBrand = { name: nameInput.trim() }
    if (!payload.name) return toast.error('Tên thương hiệu không được để trống')
    try {
      setActionLoading(true)
      if (logoFile) {
        const uploadRes = await uploadImage(logoFile)
        const imageUrl = (uploadRes as any)?.uploadedImage?.url as string | undefined
        if (imageUrl) payload.logo_url = imageUrl
      }
      if (descriptionInput.trim()) payload.description = descriptionInput.trim()
      const res = await createBrand(payload)
      if ((res as any)?.brand) {
        toast.success('Tạo thương hiệu thành công')
        setOpenCreate(false)
        setLogoFile(null)
        setLogoPreview(null)
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
  const [editLogoPreview, setEditLogoPreview] = useState<string | null>(null)
  const [editLogoFile, setEditLogoFile] = useState<File | null>(null)

  const handleOpenEdit = async (brand: TBrand) => {
    try {
      setActionLoading(true)
      const res = (await getBrandById(brand.id)) as GetBrandResponse
      const full = res?.brand || brand
      setSelected(full)
      setNameInput(full.name)
      setEditDescription(full.description || '')
      setEditLogoPreview(full.logo_url || null)
      setOpenEdit(true)
    } catch (e) {
      toast.error('Không tải được chi tiết thương hiệu')
    } finally {
      setActionLoading(false)
    }
  }

  const handleEdit = async () => {
    if (!selected) return
    const payload: TUpdateBrand = { name: nameInput.trim() }
    if (!payload.name) return toast.error('Tên thương hiệu không được để trống')
    try {
      setActionLoading(true)
      if (editLogoFile) {
        const uploadRes = await uploadImage(editLogoFile)
        const imageUrl = (uploadRes as any)?.uploadedImage?.url as string | undefined
        if (imageUrl) (payload as any).logo_url = imageUrl
      }
      if (editDescription.trim()) (payload as any).description = editDescription.trim()

      const res = await updateBrand(selected.id, payload)
      if ((res as any)?.brand) {
        toast.success('Cập nhật thương hiệu thành công')
        setOpenEdit(false)
        setSelected(null)
        setEditLogoFile(null)
        setEditLogoPreview(null)
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

  const handleDelete = async (brand: TBrand) => {
    if (!confirm(`Xóa thương hiệu "${brand.name}"?`)) return
    try {
      setActionLoading(true)
      const res = await deleteBrand(brand.id)
      if ((res as any)?.brand || (res as any)?.success) {
        toast.success('Xóa thương hiệu thành công')
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
  const [viewing, setViewing] = useState<TBrand | null>(null)
  const handleOpenView = async (brand: TBrand) => {
    try {
      setActionLoading(true)
      const res = (await getBrandById(brand.id)) as GetBrandResponse
      setViewing(res?.brand || brand)
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
      {/* Header with title and primary action */}
      <Stack direction='row' alignItems='center' justifyContent='space-between' sx={{ mb: 3 }}>
        <Typography variant='h5' fontWeight={700}>
          Quản lý thương hiệu
        </Typography>
        <Button variant='contained' startIcon={<AddIcon />} onClick={handleOpenCreate}>
          Thêm thương hiệu
        </Button>
      </Stack>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card elevation={0} sx={{ borderRadius: 2, border: theme => `1px solid ${theme.palette.divider}` }}>
            <CardContent>
              <Typography variant='body2' color='text.secondary'>
                Tổng thương hiệu
              </Typography>
              <Typography variant='h5' fontWeight={700} sx={{ my: 1 }}>
                {totalBrands || 'N/A'}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                {totalBrands ? `${totalBrands} đang hoạt động` : 'N/A'}
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
                Từ tất cả thương hiệu
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
                Thương hiệu mới
              </Typography>
              <Typography variant='h5' fontWeight={700} sx={{ my: 1 }}>
                {typeof newBrands === 'number' ? newBrands : 'N/A'}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                Trong tháng này
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: theme => `1px solid ${theme.palette.divider}`, mb: 3 }}>
        <Stack direction='row' spacing={2}>
          <TextField
            size='small'
            placeholder='Tìm theo tên hoặc ID...'
            value={search}
            onChange={e => setSearch(e.target.value)}
            InputProps={{ startAdornment: (<SearchIcon fontSize='small' />) as any }}
            sx={{ maxWidth: 360 }}
          />
          <Select
            size='small'
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value='all'>Tất cả trạng thái</MenuItem>
            <MenuItem value='active'>Hoạt động</MenuItem>
            <MenuItem value='deleted'>Đã xóa</MenuItem>
          </Select>
          <Button variant='outlined' onClick={fetchData} disabled={loading}>
            Làm mới
          </Button>
        </Stack>
      </Paper>

      <TableContainer
        component={Paper}
        elevation={0}
        sx={{ borderRadius: 2, border: theme => `1px solid ${theme.palette.divider}` }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width={90}>ID</TableCell>
              <TableCell width={80}>Logo</TableCell>
              <TableCell>Tên thương hiệu</TableCell>
              <TableCell>Mô tả</TableCell>
              <TableCell width={120}>Trạng thái</TableCell>
              <TableCell width={120} align='right'>
                Thao tác
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map(brand => (
              <TableRow key={brand.id} hover sx={{ opacity: brand.del_flag === '1' ? 0.6 : 1 }}>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{brand.id}</TableCell>
                <TableCell>
                  <Avatar
                    src={brand.logo_url || undefined}
                    alt={brand.name}
                    variant='rounded'
                    sx={{ width: 40, height: 40 }}
                  >
                    {brand.name?.charAt(0) || 'B'}
                  </Avatar>
                </TableCell>
                <TableCell sx={{ textDecoration: brand.del_flag === '1' ? 'line-through' : 'none' }}>
                  {brand.name}
                </TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>{brand.description || '-'}</TableCell>
                <TableCell width={120}>
                  {brand.del_flag === '1' ? (
                    <Chip label='Đã xóa' color='error' size='small' variant='outlined' />
                  ) : (
                    <Chip label='Hoạt động' color='success' size='small' variant='outlined' />
                  )}
                </TableCell>
                <TableCell align='right'>
                  <Stack direction='row' spacing={1} justifyContent='flex-end'>
                    <IconButton size='small' onClick={() => handleOpenView(brand)}>
                      <VisibilityIcon fontSize='small' />
                    </IconButton>
                    <IconButton size='small' disabled={brand.del_flag === '1'} onClick={() => handleOpenEdit(brand)}>
                      <EditIcon fontSize='small' />
                    </IconButton>
                    <IconButton
                      size='small'
                      color='error'
                      disabled={brand.del_flag === '1'}
                      onClick={() => handleDelete(brand)}
                    >
                      <DeleteIcon fontSize='small' />
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} align='center'>
                  {loading ? 'Đang tải...' : 'Không có dữ liệu'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create Dialog */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} fullWidth maxWidth='xs'>
        <DialogTitle>Thêm thương hiệu</DialogTitle>
        <DialogContent>
          <Box component='form' onSubmit={e => e.preventDefault()} sx={{ mt: 1 }}>
            <TextField
              autoFocus
              fullWidth
              label='Tên thương hiệu'
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
                Chọn logo
                <input
                  hidden
                  type='file'
                  accept='image/*'
                  onChange={e => {
                    const f = e.target.files?.[0] || null
                    setLogoFile(f)
                    if (logoPreview) URL.revokeObjectURL(logoPreview)
                    setLogoPreview(f ? URL.createObjectURL(f) : null)
                  }}
                />
              </Button>
              <Typography variant='caption' sx={{ ml: 2 }}>
                {logoFile ? logoFile.name : 'Chưa chọn ảnh'}
              </Typography>
              {logoPreview ? (
                <Box sx={{ mt: 2 }}>
                  <Avatar src={logoPreview} variant='rounded' sx={{ width: 72, height: 72 }} />
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
        <DialogTitle>Cập nhật thương hiệu</DialogTitle>
        <DialogContent>
          <Box component='form' onSubmit={e => e.preventDefault()} sx={{ mt: 1 }}>
            <TextField
              autoFocus
              fullWidth
              label='Tên thương hiệu'
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
                Đổi logo
                <input
                  hidden
                  type='file'
                  accept='image/*'
                  onChange={e => {
                    const f = e.target.files?.[0] || null
                    setEditLogoFile(f)
                    if (editLogoPreview) URL.revokeObjectURL(editLogoPreview)
                    setEditLogoPreview(f ? URL.createObjectURL(f) : editLogoPreview)
                  }}
                />
              </Button>
              <Typography variant='caption' sx={{ ml: 2 }}>
                {editLogoFile ? editLogoFile.name : 'Giữ nguyên nếu không chọn ảnh'}
              </Typography>
              {editLogoPreview ? (
                <Box sx={{ mt: 2 }}>
                  <Avatar src={editLogoPreview} variant='rounded' sx={{ width: 72, height: 72 }} />
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
        <DialogTitle>Thông tin thương hiệu</DialogTitle>
        <DialogContent>
          {viewing ? (
            <Box sx={{ mt: 1 }}>
              <Stack direction='row' spacing={2} alignItems='center'>
                <Avatar src={viewing.logo_url || undefined} variant='rounded' sx={{ width: 72, height: 72 }} />
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

;(BrandPage as any).getLayout = (page: React.ReactNode) => <ManageSystemLayout>{page}</ManageSystemLayout>

export default BrandPage
