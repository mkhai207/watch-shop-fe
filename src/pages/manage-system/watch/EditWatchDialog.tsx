import AddIcon from '@mui/icons-material/Add'
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import CloseIcon from '@mui/icons-material/Close'
import DeleteIcon from '@mui/icons-material/Delete'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Select,
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
import React from 'react'
import MLFields from 'src/components/ml-fields/MLFields'
import type { TBrand } from 'src/types/brand'
import { compactToDateInput, dateInputToCompact } from 'src/utils/date'
import type { TCategory } from 'src/types/category/manage'
import type { TColor } from 'src/types/color'
import type { TMovementType } from 'src/types/movementType'
import type { TStrapMaterial } from 'src/types/strapMaterial'
import type { TCreateWatch, TWatchVariant } from 'src/types/watch'

interface EditWatchDialogProps {
  mode?: 'create' | 'edit'
  open: boolean
  editForm: TCreateWatch
  brands: TBrand[]
  categories: TCategory[]
  movementTypes: TMovementType[]
  colors?: TColor[]
  strapMaterials?: TStrapMaterial[]
  variantDraft?: Omit<TWatchVariant, 'id' | 'watch_id' | 'price'>
  editUploadingThumb: boolean
  editUploadingSlider: boolean
  actionLoading: boolean
  onClose: () => void
  onFormChange: (form: TCreateWatch) => void
  onSave: () => void | Promise<void>
  onUploadThumbnail: (file: File) => void | Promise<void>
  onUploadSlider: (files: File[]) => void | Promise<void>
  onVariantDraftChange?: (draft: Omit<TWatchVariant, 'id' | 'watch_id' | 'price'>) => void
  onAddVariantDraft?: () => void
  onRemoveVariantDraft?: (index: number) => void
}

const InfoField: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <Grid item xs={12} sm={6}>
    <Box
      sx={{
        p: 1.5,
        borderRadius: 1.5,
        bgcolor: theme => theme.palette.action.hover
      }}
    >
      <Typography variant='caption' sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
        {label}
      </Typography>
      {children}
    </Box>
  </Grid>
)

const EditWatchDialog: React.FC<EditWatchDialogProps> = ({
  mode = 'edit',
  open,
  editForm,
  brands,
  categories,
  movementTypes,
  colors = [],
  strapMaterials = [],
  variantDraft,
  editUploadingThumb,
  editUploadingSlider,
  actionLoading,
  onClose,
  onFormChange,
  onSave,
  onUploadThumbnail,
  onUploadSlider,
  onVariantDraftChange,
  onAddVariantDraft,
  onRemoveVariantDraft
}) => {
  const [expandMlInfo, setExpandMlInfo] = React.useState(false)
  const sliderImages = React.useMemo(
    () =>
      (editForm.slider || '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean),
    [editForm.slider]
  )

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='md'>
      <DialogTitle sx={{ fontWeight: 700, color: 'primary.main', borderBottom: '1px solid', borderColor: 'divider', pb: 2 }}>
        {mode === 'create' ? 'Thêm đồng hồ' : 'Cập nhật thông tin đồng hồ'}
      </DialogTitle>
      <DialogContent sx={{ pb: 3 }}>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {/* Basic Info */}
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: 'none', boxShadow: 'none', bgcolor: theme => theme.palette.background.paper }}>
            <Typography variant='subtitle1' sx={{ fontWeight: 700, color: 'primary.main', mb: 2 }}>
              Thông tin cơ bản
            </Typography>
            <Grid container spacing={3} sx={{ mb: 2 }}>
              <Grid item xs={12} md={5}>
                <Box
                  component='label'
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: 320,
                    borderRadius: 2,
                    border: theme => `2px dashed ${theme.palette.divider}`,
                    bgcolor: 'background.paper',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: theme => theme.palette.action.hover
                    }
                  }}
                >
                  {editForm.thumbnail ? (
                    <>
                      <Box
                        component='img'
                        src={editForm.thumbnail}
                        alt='thumbnail'
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                      <IconButton
                        size='small'
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          onFormChange({ ...editForm, thumbnail: '' })
                        }}
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          bgcolor: 'background.paper',
                          '&:hover': { bgcolor: 'error.main', color: 'white' }
                        }}
                      >
                        <CloseIcon fontSize='small' />
                      </IconButton>
                    </>
                  ) : (
                    <Stack alignItems='center' spacing={1}>
                      <AddPhotoAlternateIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
                      <Typography variant='caption' color='text.secondary'>
                        Chọn ảnh đại diện
                      </Typography>
                    </Stack>
                  )}
                  <input
                    hidden
                    type='file'
                    accept='image/*'
                    disabled={editUploadingThumb}
                    onChange={async e => {
                      const f = e.target.files?.[0]
                      if (f) {
                        await onUploadThumbnail(f)
                        ;(e.target as any).value = ''
                      }
                    }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={7}>
                <Grid container spacing={2}>
                  <InfoField label='Mã'>
                    <TextField
                      fullWidth
                      size='small'
                      value={editForm.code}
                      onChange={e => onFormChange({ ...editForm, code: e.target.value })}
                      sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'background.paper' } }}
                    />
                  </InfoField>
                  <InfoField label='Tên'>
                    <TextField
                      fullWidth
                      size='small'
                      value={editForm.name}
                      onChange={e => onFormChange({ ...editForm, name: e.target.value })}
                      sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'background.paper' } }}
                    />
                  </InfoField>
                  <InfoField label='Model'>
                    <TextField
                      fullWidth
                      size='small'
                      value={editForm.model || ''}
                      onChange={e => onFormChange({ ...editForm, model: e.target.value })}
                      sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'background.paper' } }}
                    />
                  </InfoField>
                  <InfoField label='Thương hiệu'>
                    <Select
                      fullWidth
                      size='small'
                      displayEmpty
                      value={editForm.brand_id as any}
                      onChange={e => onFormChange({ ...editForm, brand_id: e.target.value as any })}
                      sx={{ bgcolor: 'background.paper' }}
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
                  </InfoField>
                  <InfoField label='Phân loại'>
                    <Select
                      fullWidth
                      size='small'
                      displayEmpty
                      value={editForm.category_id as any}
                      onChange={e => onFormChange({ ...editForm, category_id: e.target.value as any })}
                      sx={{ bgcolor: 'background.paper' }}
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
                  </InfoField>
                  <InfoField label='Loại máy'>
                    <Select
                      fullWidth
                      size='small'
                      displayEmpty
                      value={editForm.movement_type_id as any}
                      onChange={e => onFormChange({ ...editForm, movement_type_id: e.target.value as any })}
                      sx={{ bgcolor: 'background.paper' }}
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
                  </InfoField>
                  <Grid item xs={12}>
                    <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: theme => theme.palette.action.hover }}>
                      <Typography variant='caption' sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
                        Mô tả
                      </Typography>
                      <TextField
                        fullWidth
                        multiline
                        minRows={2}
                        size='small'
                        value={editForm.description || ''}
                        onChange={e => onFormChange({ ...editForm, description: e.target.value })}
                        sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'background.paper' } }}
                      />
                    </Box>
                  </Grid>

                </Grid>
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={12} md={5}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: theme => theme.palette.action.hover }}>
                      <Typography variant='caption' sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
                        Giới tính
                      </Typography>
                      <Select
                        fullWidth
                        size='small'
                        value={editForm.gender as any}
                        onChange={e => onFormChange({ ...editForm, gender: e.target.value })}
                        sx={{ bgcolor: 'background.paper' }}
                      >
                        <MenuItem value='0'>Nam</MenuItem>
                        <MenuItem value='1'>Nữ</MenuItem>
                      </Select>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: theme => theme.palette.action.hover }}>
                      <Typography variant='caption' sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
                        Ngày ra mắt
                      </Typography>
                      <TextField
                        fullWidth
                        size='small'
                        type='date'
                        InputLabelProps={{ shrink: true }}
                        value={compactToDateInput(editForm.release_date)}
                        onChange={e => onFormChange({ ...editForm, release_date: dateInputToCompact(e.target.value) })}
                        sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'background.paper' } }}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: theme => theme.palette.action.hover }}>
                      <Typography variant='caption' sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
                        Giá cơ bản (VNĐ)
                      </Typography>
                      <TextField
                        fullWidth
                        size='small'
                        value={editForm.base_price ? editForm.base_price.toLocaleString('vi-VN') : ''}
                        onChange={e => {
                          const value = e.target.value.replace(/\./g, '')
                          const numValue = value === '' ? 0 : Number(value)
                          if (!isNaN(numValue)) {
                            onFormChange({ ...editForm, base_price: numValue })
                          }
                        }}
                        onFocus={e => {
                          if (editForm.base_price === 0) e.target.select()
                        }}
                        sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'background.paper' } }}
                      />
                    </Box>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} md={7}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: theme => theme.palette.action.hover }}>
                      <Typography variant='caption' sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
                        Chất liệu vỏ
                      </Typography>
                      <TextField
                        fullWidth
                        size='small'
                        value={editForm.case_material || ''}
                        onChange={e => onFormChange({ ...editForm, case_material: e.target.value })}
                        sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'background.paper' } }}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: theme => theme.palette.action.hover }}>
                      <Typography variant='caption' sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
                        Kích thước vỏ (mm)
                      </Typography>
                      <TextField
                        fullWidth
                        size='small'
                        type='number'
                        value={editForm.case_size as any}
                        onChange={e => onFormChange({ ...editForm, case_size: Number(e.target.value) })}
                        sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'background.paper' } }}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: theme => theme.palette.action.hover }}>
                      <Typography variant='caption' sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
                        Độ rộng dây (mm)
                      </Typography>
                      <TextField
                        fullWidth
                        size='small'
                        type='number'
                        value={editForm.strap_size as any}
                        onChange={e => onFormChange({ ...editForm, strap_size: Number(e.target.value) })}
                        sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'background.paper' } }}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: theme => theme.palette.action.hover }}>
                      <Typography variant='caption' sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
                        Chống nước
                      </Typography>
                      <TextField
                        fullWidth
                        size='small'
                        value={editForm.water_resistance || ''}
                        onChange={e => onFormChange({ ...editForm, water_resistance: e.target.value })}
                        sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'background.paper' } }}
                      />
                    </Box>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Paper>

          {/* Slider Images */}
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: 'none', boxShadow: 'none', bgcolor: theme => theme.palette.background.paper }}>
            <Typography variant='subtitle1' sx={{ fontWeight: 700, color: 'primary.main', mb: 2 }}>
              Ảnh mô tả sản phẩm
            </Typography>
            <Stack direction='row' alignItems='center' gap={1}>
              <IconButton
                size='small'
                onClick={() => {
                  const container = document.getElementById('edit-slider-container')
                  if (container) {
                    container.scrollBy({ left: -200, behavior: 'smooth' })
                  }
                }}
              >
                <ChevronLeftIcon />
              </IconButton>
              <Box
                id='edit-slider-container'
                sx={{
                  display: 'flex',
                  gap: 1,
                  overflowX: 'auto',
                  overflowY: 'hidden',
                  scrollBehavior: 'smooth',
                  flex: 1,
                  '&::-webkit-scrollbar': {
                    display: 'none'
                  },
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none'
                }}
              >
                {sliderImages.map((url, index) => (
                  <Box
                    key={url}
                    sx={{
                      position: 'relative',
                      width: 96,
                      height: 96,
                      minWidth: 96,
                      borderRadius: 1,
                      border: theme => `1px solid ${theme.palette.divider}`,
                      overflow: 'hidden'
                    }}
                  >
                    <Box
                      component='img'
                      src={url}
                      alt={url}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                    <IconButton
                      size='small'
                      onClick={() => {
                        const newImages = sliderImages.filter((_, i) => i !== index)
                        onFormChange({ ...editForm, slider: newImages.join(', ') })
                      }}
                      sx={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        bgcolor: 'background.paper',
                        '&:hover': { bgcolor: 'error.main', color: 'white' },
                        width: 24,
                        height: 24
                      }}
                    >
                      <CloseIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>
                ))}
                <Box
                  component='label'
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 96,
                    height: 96,
                    minWidth: 96,
                    borderRadius: 1,
                    border: theme => `2px dashed ${theme.palette.divider}`,
                    bgcolor: 'background.paper',
                    cursor: editUploadingSlider ? 'default' : 'pointer',
                    '&:hover': editUploadingSlider ? {} : {
                      borderColor: 'primary.main',
                      bgcolor: theme => theme.palette.action.hover
                    }
                  }}
                >
                  {editUploadingSlider ? (
                    <Typography variant='caption' color='text.secondary'>
                      Đang tải...
                    </Typography>
                  ) : (
                    <AddPhotoAlternateIcon sx={{ fontSize: 32, color: 'text.secondary' }} />
                  )}
                  <input
                    hidden
                    type='file'
                    accept='image/*'
                    multiple
                    disabled={editUploadingSlider}
                    onChange={async e => {
                      const files = Array.from(e.target.files || [])
                      if (files.length) {
                        await onUploadSlider(files as File[])
                        ;(e.target as any).value = ''
                      }
                    }}
                  />
                </Box>
              </Box>
              <IconButton
                size='small'
                onClick={() => {
                  const container = document.getElementById('edit-slider-container')
                  if (container) {
                    container.scrollBy({ left: 200, behavior: 'smooth' })
                  }
                }}
              >
                <ChevronRightIcon />
              </IconButton>
            </Stack>
          </Paper>

          {/* ML Fields */}
          <Box sx={{ p: 2.5, borderRadius: 2, bgcolor: theme => theme.palette.action.hover }}>
            <Stack
              direction='row'
              alignItems='center'
              justifyContent='space-between'
              onClick={() => setExpandMlInfo(!expandMlInfo)}
              sx={{ cursor: 'pointer', mb: expandMlInfo ? 2 : 0 }}
            >
              <Typography variant='subtitle1' sx={{ color: 'primary.main', fontWeight: 700 }}>
                Thông tin ML
              </Typography>
              <ExpandMoreIcon
                sx={{
                  transform: expandMlInfo ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s ease'
                }}
              />
            </Stack>
            <Box
              sx={{
                maxHeight: expandMlInfo ? 1000 : 0,
                opacity: expandMlInfo ? 1 : 0,
                overflow: 'hidden',
                transition: 'all 0.3s ease'
              }}
            >
              <MLFields
                values={{
                  price_tier: editForm.price_tier || '',
                  gender_target: editForm.gender_target || '',
                  size_category: editForm.size_category || '',
                  style_tags: editForm.style_tags || [],
                  material_tags: editForm.material_tags || [],
                  color_tags: editForm.color_tags || [],
                  movement_type_tags: editForm.movement_type_tags || []
                }}
                onChange={(field, value) => onFormChange({ ...editForm, [field]: value })}
              />
            </Box>
          </Box>

          {/* Variants Section - Only in create mode */}
          {mode === 'create' && (
            <Box sx={{ p: 2.5, borderRadius: 2, bgcolor: theme => theme.palette.action.hover }}>
              <Typography variant='subtitle1' sx={{ fontWeight: 700, color: 'primary.main', mb: 2 }}>
                Danh sách phân loại sản phẩm
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <Select
                    fullWidth
                    displayEmpty
                    value={variantDraft?.color_id || ''}
                    onChange={e => onVariantDraftChange?.({ ...variantDraft!, color_id: e.target.value as any })}
                  >
                    <MenuItem value=''>Màu sắc</MenuItem>
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
                    value={variantDraft?.strap_material_id || ''}
                    onChange={e => onVariantDraftChange?.({ ...variantDraft!, strap_material_id: e.target.value as any })}
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
                    value={variantDraft?.stock_quantity || 0}
                    onChange={e => onVariantDraftChange?.({ ...variantDraft!, stock_quantity: Number(e.target.value) })}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <Button 
                    fullWidth 
                    variant='outlined' 
                    startIcon={<AddIcon />} 
                    onClick={onAddVariantDraft}
                    sx={{ height: '100%' }}
                  >
                    Thêm
                  </Button>
                </Grid>
                
                <Grid item xs={12}>
                  <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                    <Table size='small'>
                      <TableHead>
                        <TableRow>
                          <TableCell>STT</TableCell>
                          <TableCell>Màu sắc</TableCell>
                          <TableCell>Vật liệu dây</TableCell>
                          <TableCell>Tồn kho</TableCell>
                          <TableCell align='right'>Thao tác</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(editForm.variants || []).map((v, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{idx + 1}</TableCell>
                            <TableCell>
                              {colors.find(c => String(c.id) === String((v as any).color_id))?.name || (v as any).color_id}
                            </TableCell>
                            <TableCell>
                              {strapMaterials.find(s => String(s.id) === String((v as any).strap_material_id))?.name ||
                                (v as any).strap_material_id}
                            </TableCell>
                            <TableCell>{(v as any).stock_quantity}</TableCell>
                            <TableCell align='right'>
                              <IconButton size='small' onClick={() => onRemoveVariantDraft?.(idx)}>
                                <DeleteIcon fontSize='small' />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                        {(editForm.variants || []).length === 0 && (
                          <TableRow>
                            <TableCell colSpan={5} align='center'>
                              Chưa có biến thể
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>
            </Box>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button
          variant='contained'
          disabled={actionLoading || editUploadingThumb || editUploadingSlider}
          onClick={onSave}
        >
          {mode === 'create' ? 'Tạo' : 'Lưu'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default EditWatchDialog
