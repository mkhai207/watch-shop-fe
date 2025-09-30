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
  Typography,
  MenuItem,
  Select,
  Chip
} from '@mui/material'
import ManageSystemLayout from 'src/views/layouts/ManageSystemLayout'
import Spinner from 'src/components/spinner'
import toast from 'react-hot-toast'
import { formatCompactVN } from 'src/utils/date'
import {
  getWatches,
  createWatch,
  getWatchById,
  createWatchVariant,
  getWatchVariants,
  updateWatch,
  updateWatchVariant,
  deleteWatchVariant
} from 'src/services/watch'
import type {
  TWatch,
  TWatchVariant,
  TCreateWatch,
  CreateWatchVariant,
  GetWatchesResponse,
  GetWatchResponse
} from 'src/types/watch'
import { getBrands } from 'src/services/brand'
import { getCategorys } from 'src/services/categoryManage'
import { getMovementTypes } from 'src/services/movementType'
import { getColors } from 'src/services/color'
import { getStrapMaterials } from 'src/services/strapMaterial'
import type { TBrand } from 'src/types/brand'
import type { TCategory } from 'src/types/category/manage'
import type { TMovementType } from 'src/types/movementType'
import type { TColor } from 'src/types/color'
import type { TStrapMaterial } from 'src/types/strapMaterial'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import VisibilityIcon from '@mui/icons-material/Visibility'
import SearchIcon from '@mui/icons-material/Search'
import { uploadImage, uploadMultipleImages } from 'src/services/file'
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd'

const WatchPage: NextPage = () => {
  const [items, setItems] = useState<TWatch[]>([])
  const [variantCountByWatchId, setVariantCountByWatchId] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [openCreate, setOpenCreate] = useState(false)
  const [openView, setOpenView] = useState(false)
  const [selected, setSelected] = useState<TWatch | null>(null)

  // Master data
  const [brands, setBrands] = useState<TBrand[]>([])
  const [categories, setCategories] = useState<TCategory[]>([])
  const [movementTypes, setMovementTypes] = useState<TMovementType[]>([])
  const [colors, setColors] = useState<TColor[]>([])
  const [strapMaterials, setStrapMaterials] = useState<TStrapMaterial[]>([])

  // Create form
  const [form, setForm] = useState<TCreateWatch>({
    code: '',
    name: '',
    description: '',
    model: '',
    case_material: '',
    case_size: undefined,
    strap_size: undefined,
    gender: '0',
    water_resistance: '',
    release_date: '',
    base_price: 0,
    rating: 0,
    status: '0',
    thumbnail: '',
    slider: '',
    category_id: '' as any,
    brand_id: '' as any,
    movement_type_id: '' as any,
    variants: []
  })

  const [variantDraft, setVariantDraft] = useState<Omit<TWatchVariant, 'id' | 'watch_id' | 'price'>>({
    color_id: '' as any,
    strap_material_id: '' as any,
    stock_quantity: 0
  } as any)
  const [thumbUploading, setThumbUploading] = useState<boolean>(false)
  const [sliderUploading, setSliderUploading] = useState<boolean>(false)

  const fetchMasters = async () => {
    try {
      const [b, c, m, cl, sm] = await Promise.all([
        getBrands(),
        getCategorys(),
        getMovementTypes(),
        getColors(),
        getStrapMaterials()
      ])
      setBrands((b as any)?.brands?.rows || [])
      setCategories((c as any)?.categorys?.rows || [])
      setMovementTypes((m as any)?.movementTypes?.rows || [])
      setColors((cl as any)?.colors?.rows || [])
      setStrapMaterials((sm as any)?.strapMaterials?.rows || [])
    } catch {}
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const [wRes, vRes] = await Promise.all([getWatches(), getWatchVariants()])
      const data = wRes as GetWatchesResponse
      setItems((data as any)?.watches?.items || [])
      const vrows = (vRes as any)?.variants?.rows || []
      const counts: Record<string, number> = {}
      vrows.forEach((v: any) => {
        const id = String(v.watch_id)
        counts[id] = (counts[id] || 0) + 1
      })
      setVariantCountByWatchId(counts)
    } catch (err: any) {
      toast.error(err?.message || 'Lỗi tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMasters()
    fetchData()
  }, [])

  const filtered = useMemo(() => {
    const lower = search.toLowerCase().trim()
    return items.filter(it => {
      if (!lower) return true
      return (
        it.name.toLowerCase().includes(lower) ||
        it.code.toLowerCase().includes(lower) ||
        String(it.id).toLowerCase().includes(lower)
      )
    })
  }, [items, search])

  const resetForm = () => {
    setForm({
      code: '',
      name: '',
      description: '',
      model: '',
      case_material: '',
      case_size: undefined,
      strap_size: undefined,
      gender: '0',
      water_resistance: '',
      release_date: '',
      base_price: 0,
      rating: 0,
      status: '0',
      thumbnail: '',
      slider: '',
      category_id: '' as any,
      brand_id: '' as any,
      movement_type_id: '' as any,
      variants: []
    })
    setVariantDraft({ color_id: '' as any, strap_material_id: '' as any, stock_quantity: 0 } as any)
  }

  const handleAddVariantDraft = () => {
    const v = { ...variantDraft } as any
    if (!v.color_id || !v.strap_material_id) return toast.error('Chọn màu và vật liệu dây đeo')
    const current = [...(form.variants || [])] as any[]
    const idx = current.findIndex(
      i => String(i.color_id) === String(v.color_id) && String(i.strap_material_id) === String(v.strap_material_id)
    )
    if (idx >= 0) {
      const merged = { ...current[idx] }
      merged.stock_quantity = Number(merged.stock_quantity || 0) + Number(v.stock_quantity || 0)
      current[idx] = merged
    } else {
      current.push(v)
    }
    setForm(prev => ({ ...prev, variants: current }))
    setVariantDraft({ color_id: '' as any, strap_material_id: '' as any, stock_quantity: 0 } as any)
  }

  const handleRemoveVariantDraft = (idx: number) => {
    const next = [...(form.variants || [])]
    next.splice(idx, 1)
    setForm(prev => ({ ...prev, variants: next }))
  }

  const handleCreate = async () => {
    if (!form.name.trim()) return toast.error('Tên không được để trống')
    if (!form.code.trim()) return toast.error('Mã không được để trống')
    if (!form.brand_id || !form.category_id || !form.movement_type_id)
      return toast.error('Chọn đủ thương hiệu, phân loại, loại máy')
    try {
      setActionLoading(true)
      const payload = { ...form, sold: undefined as any, rating: undefined as any, status: '1' as any }
      const res = await createWatch(payload as any)
      if ((res as any)?.watch?.watch?.id) {
        toast.success('Tạo đồng hồ thành công')
        setOpenCreate(false)
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

  const [openVariants, setOpenVariants] = useState(false)
  const [variantsWatch, setVariantsWatch] = useState<TWatch | null>(null)
  const [variantNew, setVariantNew] = useState<CreateWatchVariant>({
    watch_id: '' as any,
    color_id: '' as any,
    strap_material_id: '' as any,
    stock_quantity: 0
  } as any)

  // View & Edit states
  const [openViewWatch, setOpenViewWatch] = useState(false)
  const [viewingWatch, setViewingWatch] = useState<TWatch | null>(null)
  const [viewVariants, setViewVariants] = useState<TWatchVariant[]>([])
  const [openEditWatch, setOpenEditWatch] = useState(false)
  const [editForm, setEditForm] = useState<TCreateWatch>({
    code: '',
    name: '',
    description: '',
    model: '',
    case_material: '',
    case_size: undefined,
    strap_size: undefined,
    gender: '0',
    water_resistance: '',
    release_date: '',
    base_price: 0,
    rating: 0,
    status: '1',
    thumbnail: '',
    slider: '',
    category_id: '' as any,
    brand_id: '' as any,
    movement_type_id: '' as any,
    variants: []
  })
  const [editUploadingThumb, setEditUploadingThumb] = useState(false)
  const [editUploadingSlider, setEditUploadingSlider] = useState(false)
  const [openEditVariant, setOpenEditVariant] = useState(false)
  const [variantEditing, setVariantEditing] = useState<any>(null)

  const openVariantDialog = async (row: TWatch) => {
    try {
      setActionLoading(true)
      const res = (await getWatchById(row.id)) as GetWatchResponse
      setVariantsWatch(res?.watch || row)
      setVariantNew({
        watch_id: row.id as any,
        color_id: '' as any,
        strap_material_id: '' as any,
        stock_quantity: 0
      } as any)
      setOpenVariants(true)
    } catch {
      toast.error('Không tải được chi tiết')
    } finally {
      setActionLoading(false)
    }
  }

  const handleCreateVariant = async () => {
    if (!variantNew.watch_id || !variantNew.color_id || !variantNew.strap_material_id)
      return toast.error('Chọn đủ thuộc tính')
    if (!Number(variantNew.stock_quantity) || Number(variantNew.stock_quantity) <= 0)
      return toast.error('Tồn kho phải lớn hơn 0')
    try {
      setActionLoading(true)
      const res = await createWatchVariant(variantNew)
      if ((res as any)?.variant?.id) {
        toast.success('Thêm biến thể thành công')
        setOpenVariants(false)
        // Refresh main list counts
        fetchData()
        // If viewing this watch details, refresh its info and variants list
        const createdWatchId = String(variantNew.watch_id)
        if (viewingWatch && String(viewingWatch.id) === createdWatchId) {
          const [wRes, vRes] = await Promise.all([getWatchById(createdWatchId), getWatchVariants()])
          setViewingWatch(((wRes as any)?.watch || viewingWatch) as any)
          const all = ((vRes as any)?.variants?.rows || []) as TWatchVariant[]
          setViewVariants(all.filter(i => String(i.watch_id) === createdWatchId))
        }
      } else {
        throw new Error('Thêm thất bại')
      }
    } catch (err: any) {
      toast.error(err?.message || 'Thêm thất bại')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <>
      {(loading || actionLoading) && <Spinner />}
      <Stack direction='row' alignItems='center' justifyContent='space-between' sx={{ mb: 3 }}>
        <Typography variant='h5' fontWeight={700}>
          Quản lý đồng hồ
        </Typography>
        <Button
          variant='contained'
          startIcon={<AddIcon />}
          onClick={() => {
            resetForm()
            setOpenCreate(true)
          }}
        >
          Thêm đồng hồ
        </Button>
      </Stack>

      <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: theme => `1px solid ${theme.palette.divider}`, mb: 3 }}>
        <Stack direction='row' spacing={2}>
          <TextField
            size='small'
            placeholder='Tìm theo tên, mã hoặc ID...'
            value={search}
            onChange={e => setSearch(e.target.value)}
            InputProps={{ startAdornment: (<SearchIcon fontSize='small' />) as any }}
            sx={{ maxWidth: 360 }}
          />
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
              <TableCell width={160}>Mã</TableCell>
              <TableCell>Tên</TableCell>
              <TableCell width={140}>Giá cơ bản</TableCell>
              <TableCell width={120}>Giới tính</TableCell>
              <TableCell width={120}>Trạng thái</TableCell>
              <TableCell width={120}>Biến thể</TableCell>
              <TableCell width={160} align='right'>
                Thao tác
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map(row => (
              <TableRow key={row.id} hover sx={{ opacity: row.del_flag === '1' ? 0.6 : 1 }}>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.id}</TableCell>
                <TableCell sx={{ fontFamily: 'monospace' }}>{row.code}</TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell>{(row.base_price || 0).toLocaleString('vi-VN')}</TableCell>
                <TableCell>{row.gender === '1' ? 'Nữ' : 'Nam'}</TableCell>
                <TableCell>
                  {row.del_flag === '1' ? (
                    <Chip label='Đã xóa' color='error' size='small' variant='outlined' />
                  ) : (
                    <Chip
                      label={row.status ? 'Đang bán' : 'Ngừng bán'}
                      color={row.status ? 'success' : 'default'}
                      size='small'
                      variant='outlined'
                    />
                  )}
                </TableCell>
                <TableCell>{variantCountByWatchId[String(row.id)] || 0}</TableCell>
                <TableCell align='right'>
                  <Stack direction='row' spacing={1} justifyContent='flex-end'>
                    <IconButton
                      size='small'
                      onClick={async () => {
                        try {
                          setActionLoading(true)
                          const [wRes, vRes] = await Promise.all([getWatchById(String(row.id)), getWatchVariants()])
                          setViewingWatch((wRes as any)?.watch || row)
                          const all = ((vRes as any)?.variants?.rows || []) as any[]
                          setViewVariants(all.filter(v => String(v.watch_id) === String(row.id)) as any)
                          setOpenViewWatch(true)
                        } finally {
                          setActionLoading(false)
                        }
                      }}
                    >
                      <VisibilityIcon fontSize='small' />
                    </IconButton>
                    <IconButton
                      size='small'
                      onClick={async () => {
                        try {
                          setActionLoading(true)
                          const res = (await getWatchById(String(row.id))) as GetWatchResponse
                          const w = (res as any)?.watch || row
                          setEditForm({
                            code: w.code || '',
                            name: w.name || '',
                            description: w.description || '',
                            model: w.model || '',
                            case_material: w.case_material || '',
                            case_size: (w.case_size as any) || undefined,
                            strap_size: (w.strap_size as any) || undefined,
                            gender: (w.gender as any) ?? '0',
                            water_resistance: w.water_resistance || '',
                            release_date: w.release_date || '',
                            base_price: (w.base_price as any) || 0,
                            rating: (w.rating as any) || 0,
                            status: (w.status ? '1' : '0') as any,
                            thumbnail: w.thumbnail || '',
                            slider: w.slider || '',
                            category_id: (w.category_id as any) || '',
                            brand_id: (w.brand_id as any) || '',
                            movement_type_id: (w.movement_type_id as any) || '',
                            variants: []
                          })
                          setSelected(w)
                          setOpenEditWatch(true)
                        } finally {
                          setActionLoading(false)
                        }
                      }}
                    >
                      <EditIcon fontSize='small' />
                    </IconButton>
                    <IconButton size='small' onClick={() => openVariantDialog(row)}>
                      <PlaylistAddIcon fontSize='small' />
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align='center'>
                  {loading ? 'Đang tải...' : 'Không có dữ liệu'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create Watch */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} fullWidth maxWidth='md'>
        <DialogTitle>Thêm đồng hồ</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label='Mã'
                value={form.code}
                onChange={e => setForm(p => ({ ...p, code: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label='Tên'
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                minRows={2}
                label='Mô tả'
                value={form.description || ''}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label='Model'
                value={form.model || ''}
                onChange={e => setForm(p => ({ ...p, model: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label='Chất liệu vỏ'
                value={form.case_material || ''}
                onChange={e => setForm(p => ({ ...p, case_material: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type='number'
                label='Kích thước vỏ (mm)'
                value={form.case_size as any}
                onChange={e => setForm(p => ({ ...p, case_size: Number(e.target.value) }))}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type='number'
                label='Độ rộng dây (mm)'
                value={form.strap_size as any}
                onChange={e => setForm(p => ({ ...p, strap_size: Number(e.target.value) }))}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Select
                fullWidth
                value={form.gender as any}
                onChange={e => setForm(p => ({ ...p, gender: e.target.value }))}
              >
                <MenuItem value='0'>Nam</MenuItem>
                <MenuItem value='1'>Nữ</MenuItem>
              </Select>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label='Chống nước'
                value={form.water_resistance || ''}
                onChange={e => setForm(p => ({ ...p, water_resistance: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type='date'
                label='Ngày ra mắt'
                InputLabelProps={{ shrink: true }}
                value={form.release_date || ''}
                onChange={e => setForm(p => ({ ...p, release_date: e.target.value }))}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type='number'
                label='Giá cơ bản (VNĐ)'
                value={form.base_price as any}
                onChange={e => setForm(p => ({ ...p, base_price: Number(e.target.value) }))}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant='body2' color='text.secondary'>
                Trạng thái mặc định: Đang bán
              </Typography>
            </Grid>
            <Grid item xs={12} md={12}>
              {form.thumbnail ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    component='img'
                    src={form.thumbnail}
                    alt='thumbnail'
                    sx={{
                      width: 96,
                      height: 96,
                      objectFit: 'cover',
                      borderRadius: 1,
                      border: theme => `1px solid ${theme.palette.divider}`
                    }}
                  />
                  <Typography
                    variant='caption'
                    sx={{
                      maxWidth: 320,
                      display: 'inline-block',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {form.thumbnail}
                  </Typography>
                </Box>
              ) : (
                <Typography variant='body2' color='text.secondary'>
                  Chưa có thumbnail
                </Typography>
              )}
            </Grid>
            <Grid item xs={12} md={12}>
              <Button component='label' variant='outlined' disabled={thumbUploading}>
                {thumbUploading ? 'Đang tải...' : 'Chọn ảnh thumbnail'}
                <input
                  hidden
                  type='file'
                  accept='image/*'
                  onChange={async e => {
                    const f = e.target.files?.[0]
                    if (!f) return
                    try {
                      setThumbUploading(true)
                      const res = await uploadImage(f)
                      const url = (res as any)?.uploadedImage?.url as string | undefined
                      if (url) setForm(p => ({ ...p, thumbnail: url }))
                      else toast.error('Tải ảnh thất bại')
                    } catch (err: any) {
                      toast.error(err?.message || 'Tải ảnh thất bại')
                    } finally {
                      setThumbUploading(false)
                      ;(e.target as any).value = ''
                    }
                  }}
                />
              </Button>
            </Grid>
            <Grid item xs={12} md={12}>
              {(form.slider || '').trim() ? null : (
                <Typography variant='body2' color='text.secondary'>
                  Chưa có ảnh slider
                </Typography>
              )}
            </Grid>
            <Grid item xs={12} md={12}>
              <Box sx={{ mt: 0, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {(form.slider || '')
                  .split(',')
                  .map(u => u.trim())
                  .filter(Boolean)
                  .map(url => (
                    <Box
                      key={url}
                      component='img'
                      src={url}
                      alt=''
                      sx={{
                        width: 72,
                        height: 72,
                        objectFit: 'cover',
                        borderRadius: 1,
                        border: theme => `1px solid ${theme.palette.divider}`
                      }}
                    />
                  ))}
              </Box>
              <Button component='label' variant='outlined' disabled={sliderUploading} sx={{ mt: 1.5 }}>
                {sliderUploading ? 'Đang tải ảnh...' : 'Tải nhiều ảnh slider'}
                <input
                  hidden
                  type='file'
                  accept='image/*'
                  multiple
                  onChange={async e => {
                    const files = Array.from(e.target.files || [])
                    if (!files.length) return
                    try {
                      setSliderUploading(true)
                      const res = await uploadMultipleImages(files as File[])
                      const urls = ((res as any)?.uploadedImages || []).map((it: any) => it?.url).filter(Boolean)
                      if (urls.length) {
                        setForm(p => ({ ...p, slider: urls.join(',') }))
                      } else {
                        toast.error('Tải ảnh thất bại')
                      }
                    } catch (err: any) {
                      toast.error(err?.message || 'Tải ảnh thất bại')
                    } finally {
                      setSliderUploading(false)
                      ;(e.target as any).value = ''
                    }
                  }}
                />
              </Button>
            </Grid>

            <Grid item xs={12} md={4}>
              <Select
                fullWidth
                displayEmpty
                value={form.brand_id as any}
                onChange={e => setForm(p => ({ ...p, brand_id: e.target.value as any }))}
              >
                <MenuItem value=''>Chọn thương hiệu</MenuItem>
                {brands
                  .filter(b => b.del_flag !== '1')
                  .map(b => (
                    <MenuItem key={b.id} value={b.id}>
                      {b.name}
                    </MenuItem>
                  ))}
              </Select>
            </Grid>
            <Grid item xs={12} md={4}>
              <Select
                fullWidth
                displayEmpty
                value={form.category_id as any}
                onChange={e => setForm(p => ({ ...p, category_id: e.target.value as any }))}
              >
                <MenuItem value=''>Chọn phân loại</MenuItem>
                {categories
                  .filter(c => c.del_flag !== '1')
                  .map(c => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.name}
                    </MenuItem>
                  ))}
              </Select>
            </Grid>
            <Grid item xs={12} md={4}>
              <Select
                fullWidth
                displayEmpty
                value={form.movement_type_id as any}
                onChange={e => setForm(p => ({ ...p, movement_type_id: e.target.value as any }))}
              >
                <MenuItem value=''>Chọn loại máy</MenuItem>
                {movementTypes
                  .filter(m => m.del_flag !== '1')
                  .map(m => (
                    <MenuItem key={m.id} value={m.id}>
                      {m.name}
                    </MenuItem>
                  ))}
              </Select>
            </Grid>

            {/* Variant builder */}
            <Grid item xs={12}>
              <Typography variant='subtitle1' sx={{ mt: 1, mb: 1 }}>
                Biến thể
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <Select
                    fullWidth
                    displayEmpty
                    value={variantDraft.color_id as any}
                    onChange={e => setVariantDraft(v => ({ ...v, color_id: e.target.value as any }))}
                  >
                    <MenuItem value=''>Màu</MenuItem>
                    {colors
                      .filter(c => c.del_flag !== '1')
                      .map(c => (
                        <MenuItem key={c.id} value={c.id}>
                          {c.name}
                        </MenuItem>
                      ))}
                  </Select>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Select
                    fullWidth
                    displayEmpty
                    value={variantDraft.strap_material_id as any}
                    onChange={e => setVariantDraft(v => ({ ...v, strap_material_id: e.target.value as any }))}
                  >
                    <MenuItem value=''>Vật liệu dây</MenuItem>
                    {strapMaterials
                      .filter(s => s.del_flag !== '1')
                      .map(s => (
                        <MenuItem key={s.id} value={s.id}>
                          {s.name}
                        </MenuItem>
                      ))}
                  </Select>
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    type='number'
                    label='Tồn kho'
                    value={variantDraft.stock_quantity as any}
                    onChange={e => setVariantDraft(v => ({ ...v, stock_quantity: Number(e.target.value) }))}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button variant='outlined' startIcon={<AddIcon />} onClick={handleAddVariantDraft}>
                    Thêm biến thể
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Table size='small'>
                    <TableHead>
                      <TableRow>
                        <TableCell>Màu</TableCell>
                        <TableCell>Vật liệu dây</TableCell>
                        <TableCell>Tồn kho</TableCell>

                        <TableCell align='right'>Xóa</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(form.variants || []).map((v, idx) => (
                        <TableRow key={idx}>
                          <TableCell>
                            {colors.find(c => c.id == (v as any).color_id)?.name || (v as any).color_id}
                          </TableCell>
                          <TableCell>
                            {strapMaterials.find(s => s.id == (v as any).strap_material_id)?.name ||
                              (v as any).strap_material_id}
                          </TableCell>
                          <TableCell>{(v as any).stock_quantity}</TableCell>

                          <TableCell align='right'>
                            <IconButton size='small' onClick={() => handleRemoveVariantDraft(idx)}>
                              <DeleteIcon fontSize='small' />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                      {(form.variants || []).length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} align='center'>
                            Chưa có biến thể
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreate(false)}>Hủy</Button>
          <Button variant='contained' onClick={handleCreate}>
            Tạo
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Variant dialog */}
      <Dialog open={openEditVariant} onClose={() => setOpenEditVariant(false)} fullWidth maxWidth='sm'>
        <DialogTitle>Chỉnh sửa biến thể</DialogTitle>
        <DialogContent>
          {variantEditing ? (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label='Màu'
                  value={
                    colors.find(c => String(c.id) === String((variantEditing as any).color_id))?.name ||
                    (variantEditing as any).color_id
                  }
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label='Vật liệu dây'
                  value={
                    strapMaterials.find(s => String(s.id) === String((variantEditing as any).strap_material_id))
                      ?.name || (variantEditing as any).strap_material_id
                  }
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  type='number'
                  label='Tồn'
                  value={(variantEditing as any).stock_quantity as any}
                  onChange={e => setVariantEditing((p: any) => ({ ...p, stock_quantity: Number(e.target.value) }))}
                />
              </Grid>
            </Grid>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditVariant(false)}>Hủy</Button>
          <Button
            variant='contained'
            onClick={async () => {
              const v: any = variantEditing
              if (!v?.id) return
              try {
                setActionLoading(true)
                await updateWatchVariant(String(v.id), {
                  stock_quantity: v.stock_quantity
                } as any)
                toast.success('Cập nhật biến thể thành công')
                setOpenEditVariant(false)
                const vRes = await getWatchVariants()
                const all = ((vRes as any)?.variants?.rows || []) as TWatchVariant[]
                if (viewingWatch) setViewVariants(all.filter(i => String(i.watch_id) === String(viewingWatch?.id)))
              } catch (e: any) {
                toast.error(e?.message || 'Cập nhật thất bại')
              } finally {
                setActionLoading(false)
              }
            }}
          >
            Lưu
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Watch dialog */}
      <Dialog open={openViewWatch} onClose={() => setOpenViewWatch(false)} fullWidth maxWidth='md'>
        <DialogTitle>Thông tin đồng hồ</DialogTitle>
        <DialogContent>
          {viewingWatch ? (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Box
                    component='img'
                    src={viewingWatch.thumbnail || ''}
                    alt=''
                    sx={{
                      width: '100%',
                      maxWidth: 280,
                      borderRadius: 2,
                      border: theme => `1px solid ${theme.palette.divider}`
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={8}>
                  <Typography variant='h6'>{viewingWatch.name}</Typography>
                  <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
                    {viewingWatch.description || '-'}
                  </Typography>
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant='subtitle2' color='text.secondary'>
                        Mã
                      </Typography>
                      <Typography sx={{ fontFamily: 'monospace' }}>{viewingWatch.code}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant='subtitle2' color='text.secondary'>
                        Model
                      </Typography>
                      <Typography>{viewingWatch.model || '-'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant='subtitle2' color='text.secondary'>
                        Chất liệu vỏ
                      </Typography>
                      <Typography>{viewingWatch.case_material || '-'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant='subtitle2' color='text.secondary'>
                        Kích thước vỏ
                      </Typography>
                      <Typography>{viewingWatch.case_size || '-'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant='subtitle2' color='text.secondary'>
                        Độ rộng dây
                      </Typography>
                      <Typography>{viewingWatch.strap_size || '-'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant='subtitle2' color='text.secondary'>
                        Giới tính
                      </Typography>
                      <Typography>{viewingWatch.gender === '1' ? 'Nữ' : 'Nam'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant='subtitle2' color='text.secondary'>
                        Chống nước
                      </Typography>
                      <Typography>{viewingWatch.water_resistance || '-'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant='subtitle2' color='text.secondary'>
                        Ngày ra mắt
                      </Typography>
                      <Typography>{viewingWatch.release_date || '-'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant='subtitle2' color='text.secondary'>
                        Giá cơ bản
                      </Typography>
                      <Typography>{(viewingWatch.base_price || 0).toLocaleString('vi-VN')} đ</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant='subtitle2' color='text.secondary'>
                        Trạng thái
                      </Typography>
                      <Typography>{viewingWatch.status ? 'Đang bán' : 'Ngừng bán'}</Typography>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
              <Typography variant='subtitle1' sx={{ mt: 3 }}>
                Ảnh slider
              </Typography>
              <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {(viewingWatch.slider || '')
                  .split(',')
                  .map(s => s.trim())
                  .filter(Boolean)
                  .map(url => (
                    <Box
                      key={url}
                      component='img'
                      src={url}
                      alt=''
                      sx={{
                        width: 80,
                        height: 80,
                        objectFit: 'cover',
                        borderRadius: 1,
                        border: theme => `1px solid ${theme.palette.divider}`
                      }}
                    />
                  ))}
              </Box>

              <Stack direction='row' alignItems='center' justifyContent='space-between' sx={{ mt: 3 }}>
                <Typography variant='subtitle1'>Biến thể liên quan</Typography>
                <Button
                  size='small'
                  variant='outlined'
                  startIcon={<AddIcon />}
                  onClick={() => viewingWatch && openVariantDialog(viewingWatch)}
                >
                  Thêm biến thể
                </Button>
              </Stack>
              <Table size='small' sx={{ mt: 1 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Màu</TableCell>
                    <TableCell>Vật liệu dây</TableCell>
                    <TableCell>Tồn</TableCell>
                    <TableCell>Giá</TableCell>
                    <TableCell align='right'>Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {viewVariants.map(v => (
                    <TableRow key={v.id}>
                      <TableCell>{v.id}</TableCell>
                      <TableCell>{colors.find(c => String(c.id) === String(v.color_id))?.name || v.color_id}</TableCell>
                      <TableCell>
                        {strapMaterials.find(s => String(s.id) === String(v.strap_material_id))?.name ||
                          v.strap_material_id}
                      </TableCell>
                      <TableCell>{v.stock_quantity}</TableCell>
                      <TableCell>{(v.price || 0).toLocaleString('vi-VN')}</TableCell>
                      <TableCell align='right'>
                        <Stack direction='row' spacing={1} justifyContent='flex-end'>
                          <IconButton
                            size='small'
                            onClick={() => {
                              setVariantEditing({ ...(v as any) })
                              setOpenEditVariant(true)
                            }}
                          >
                            <EditIcon fontSize='small' />
                          </IconButton>
                          <IconButton
                            size='small'
                            onClick={async () => {
                              try {
                                setActionLoading(true)
                                await deleteWatchVariant(String(v.id))
                                toast.success('Đã xóa biến thể')
                                const vRes = await getWatchVariants()
                                const all = ((vRes as any)?.variants?.rows || []) as TWatchVariant[]
                                if (viewingWatch)
                                  setViewVariants(all.filter(i => String(i.watch_id) === String(viewingWatch?.id)))
                              } catch (e: any) {
                                toast.error(e?.message || 'Xóa thất bại')
                              } finally {
                                setActionLoading(false)
                              }
                            }}
                          >
                            <DeleteIcon fontSize='small' />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenViewWatch(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Watch dialog */}
      <Dialog open={openEditWatch} onClose={() => setOpenEditWatch(false)} fullWidth maxWidth='md'>
        <DialogTitle>Chỉnh sửa đồng hồ</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label='Mã'
                value={editForm.code}
                onChange={e => setEditForm(p => ({ ...p, code: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label='Tên'
                value={editForm.name}
                onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                minRows={2}
                label='Mô tả'
                value={editForm.description || ''}
                onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label='Model'
                value={editForm.model || ''}
                onChange={e => setEditForm(p => ({ ...p, model: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label='Chất liệu vỏ'
                value={editForm.case_material || ''}
                onChange={e => setEditForm(p => ({ ...p, case_material: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type='number'
                label='Kích thước vỏ (mm)'
                value={editForm.case_size as any}
                onChange={e => setEditForm(p => ({ ...p, case_size: Number(e.target.value) }))}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type='number'
                label='Độ rộng dây (mm)'
                value={editForm.strap_size as any}
                onChange={e => setEditForm(p => ({ ...p, strap_size: Number(e.target.value) }))}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Select
                fullWidth
                value={editForm.gender as any}
                onChange={e => setEditForm(p => ({ ...p, gender: e.target.value }))}
              >
                <MenuItem value='0'>Nam</MenuItem>
                <MenuItem value='1'>Nữ</MenuItem>
              </Select>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label='Chống nước'
                value={editForm.water_resistance || ''}
                onChange={e => setEditForm(p => ({ ...p, water_resistance: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type='date'
                label='Ngày ra mắt'
                InputLabelProps={{ shrink: true }}
                value={editForm.release_date || ''}
                onChange={e => setEditForm(p => ({ ...p, release_date: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type='number'
                label='Giá cơ bản (VNĐ)'
                value={editForm.base_price as any}
                onChange={e => setEditForm(p => ({ ...p, base_price: Number(e.target.value) }))}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant='body2' color='text.secondary'>
                Trạng thái mặc định: Đang bán
              </Typography>
            </Grid>
            <Grid item xs={12} md={12}>
              {editForm.thumbnail ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <Box
                    component='img'
                    src={editForm.thumbnail}
                    alt=''
                    sx={{
                      width: 96,
                      height: 96,
                      objectFit: 'cover',
                      borderRadius: 1,
                      border: theme => `1px solid ${theme.palette.divider}`
                    }}
                  />
                  <Typography
                    variant='caption'
                    sx={{
                      maxWidth: 320,
                      display: 'inline-block',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {editForm.thumbnail}
                  </Typography>
                </Box>
              ) : null}
              <Button component='label' variant='outlined' disabled={editUploadingThumb}>
                {editUploadingThumb ? 'Đang tải...' : 'Chọn thumbnail mới'}
                <input
                  hidden
                  type='file'
                  accept='image/*'
                  onChange={async e => {
                    const f = e.target.files?.[0]
                    if (!f) return
                    try {
                      setEditUploadingThumb(true)
                      const res = await uploadImage(f)
                      const url = (res as any)?.uploadedImage?.url
                      if (url) setEditForm(p => ({ ...p, thumbnail: url }))
                    } finally {
                      setEditUploadingThumb(false)
                      ;(e.target as any).value = ''
                    }
                  }}
                />
              </Button>
            </Grid>
            <Grid item xs={12} md={12}>
              <Box sx={{ mt: 0, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {(editForm.slider || '')
                  .split(',')
                  .map(s => s.trim())
                  .filter(Boolean)
                  .map(url => (
                    <Box
                      key={url}
                      component='img'
                      src={url}
                      alt=''
                      sx={{
                        width: 64,
                        height: 64,
                        objectFit: 'cover',
                        borderRadius: 1,
                        border: theme => `1px solid ${theme.palette.divider}`
                      }}
                    />
                  ))}
              </Box>
              <Button component='label' variant='outlined' disabled={editUploadingSlider} sx={{ mt: 1.5 }}>
                {editUploadingSlider ? 'Đang tải ảnh...' : 'Tải nhiều ảnh slider'}
                <input
                  hidden
                  type='file'
                  accept='image/*'
                  multiple
                  onChange={async e => {
                    const files = Array.from(e.target.files || [])
                    if (!files.length) return
                    try {
                      setEditUploadingSlider(true)
                      const res = await uploadMultipleImages(files as File[])
                      const urls = ((res as any)?.uploadedImages || []).map((i: any) => i?.url).filter(Boolean)
                      if (urls.length) setEditForm(p => ({ ...p, slider: urls.join(',') }))
                    } finally {
                      setEditUploadingSlider(false)
                      ;(e.target as any).value = ''
                    }
                  }}
                />
              </Button>
            </Grid>
            <Grid item xs={12} md={4}>
              <Select
                fullWidth
                displayEmpty
                value={editForm.brand_id as any}
                onChange={e => setEditForm(p => ({ ...p, brand_id: e.target.value as any }))}
              >
                <MenuItem value=''>Chọn thương hiệu</MenuItem>
                {brands
                  .filter(b => b.del_flag !== '1')
                  .map(b => (
                    <MenuItem key={b.id} value={b.id}>
                      {b.name}
                    </MenuItem>
                  ))}
              </Select>
            </Grid>
            <Grid item xs={12} md={4}>
              <Select
                fullWidth
                displayEmpty
                value={editForm.category_id as any}
                onChange={e => setEditForm(p => ({ ...p, category_id: e.target.value as any }))}
              >
                <MenuItem value=''>Chọn phân loại</MenuItem>
                {categories
                  .filter(c => c.del_flag !== '1')
                  .map(c => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.name}
                    </MenuItem>
                  ))}
              </Select>
            </Grid>
            <Grid item xs={12} md={4}>
              <Select
                fullWidth
                displayEmpty
                value={editForm.movement_type_id as any}
                onChange={e => setEditForm(p => ({ ...p, movement_type_id: e.target.value as any }))}
              >
                <MenuItem value=''>Chọn loại máy</MenuItem>
                {movementTypes
                  .filter(m => m.del_flag !== '1')
                  .map(m => (
                    <MenuItem key={m.id} value={m.id}>
                      {m.name}
                    </MenuItem>
                  ))}
              </Select>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditWatch(false)}>Hủy</Button>
          <Button
            variant='contained'
            onClick={async () => {
              if (!selected) return
              try {
                setActionLoading(true)
                const { variants, ...rest } = editForm as any
                const payload = { ...rest, status: '0' as any }
                await updateWatch(String(selected.id), payload as any)
                toast.success('Cập nhật thành công')
                setOpenEditWatch(false)
                fetchData()
              } catch (e: any) {
                toast.error(e?.message || 'Cập nhật thất bại')
              } finally {
                setActionLoading(false)
              }
            }}
          >
            Lưu
          </Button>
        </DialogActions>
      </Dialog>

      {/* Variants dialog (add single variant after created) */}
      <Dialog open={openVariants} onClose={() => setOpenVariants(false)} fullWidth maxWidth='sm'>
        <DialogTitle>Biến thể của đồng hồ</DialogTitle>
        <DialogContent>
          {variantsWatch ? (
            <Box>
              <Typography variant='subtitle1' sx={{ mb: 2 }}>
                {variantsWatch.name} (#{variantsWatch.id})
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Select
                    fullWidth
                    displayEmpty
                    value={variantNew.color_id as any}
                    onChange={e => setVariantNew(v => ({ ...v, color_id: e.target.value as any }))}
                  >
                    <MenuItem value=''>Màu</MenuItem>
                    {colors
                      .filter(c => c.del_flag !== '1')
                      .map(c => (
                        <MenuItem key={c.id} value={c.id}>
                          {c.name}
                        </MenuItem>
                      ))}
                  </Select>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Select
                    fullWidth
                    displayEmpty
                    value={variantNew.strap_material_id as any}
                    onChange={e => setVariantNew(v => ({ ...v, strap_material_id: e.target.value as any }))}
                  >
                    <MenuItem value=''>Vật liệu dây</MenuItem>
                    {strapMaterials
                      .filter(s => s.del_flag !== '1')
                      .map(s => (
                        <MenuItem key={s.id} value={s.id}>
                          {s.name}
                        </MenuItem>
                      ))}
                  </Select>
                </Grid>
                <Grid item xs={12} md={2}>
                  <TextField
                    fullWidth
                    type='number'
                    label='Tồn'
                    value={variantNew.stock_quantity as any}
                    onChange={e => setVariantNew(v => ({ ...v, stock_quantity: Number(e.target.value) }))}
                  />
                </Grid>
              </Grid>
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenVariants(false)}>Đóng</Button>
          <Button variant='contained' onClick={handleCreateVariant}>
            Thêm biến thể
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

;(WatchPage as any).getLayout = (page: React.ReactNode) => <ManageSystemLayout>{page}</ManageSystemLayout>

export default WatchPage
