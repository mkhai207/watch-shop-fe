import AddIcon from '@mui/icons-material/Add'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import {
  Box,
  Button,
  Chip,
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
  Typography
} from '@mui/material'
import React from 'react'
import type { TColor } from 'src/types/color'
import type { TStrapMaterial } from 'src/types/strapMaterial'
import type { TWatch, TWatchVariant } from 'src/types/watch'
import { formatCompactDateVN } from 'src/utils/date'

interface WatchDetailDialogProps {
  open: boolean
  watch: TWatch | null
  variants: TWatchVariant[]
  colors: TColor[]
  strapMaterials: TStrapMaterial[]
  onClose: () => void
  onAddVariant: (watch: TWatch) => void
  onEditVariant: (variant: TWatchVariant) => void
  onDeleteVariant: (variant: TWatchVariant) => void | Promise<void>
}

const InfoItem: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
  <Box
    sx={{
      p: 1.5,
      borderRadius: 1.5,
      bgcolor: theme => theme.palette.action.hover,
      height: '100%'
    }}
  >
    <Typography variant='caption' sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase' }}>
      {label}
    </Typography>
    <Typography variant='body1' sx={{ fontWeight: 700, mt: 0.5 }}>
      {value ?? '-'}
    </Typography>
  </Box>
)

const WatchDetailDialog: React.FC<WatchDetailDialogProps> = ({
  open,
  watch,
  variants,
  colors,
  strapMaterials,
  onClose,
  onAddVariant,
  onEditVariant,
  onDeleteVariant
}) => {
  const [expandMlInfo, setExpandMlInfo] = React.useState(false)
  const sliderContainerRef = React.useRef<HTMLDivElement>(null)
  const sliderImages = React.useMemo(
    () =>
      (watch?.slider || '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean),
    [watch?.slider]
  )

  const hasMlInfo = Boolean(
    (watch as any)?.price_tier ||
      (watch as any)?.gender_target ||
      (watch as any)?.size_category ||
      (watch as any)?.style_tags?.length ||
      (watch as any)?.material_tags?.length ||
      (watch as any)?.color_tags?.length ||
      (watch as any)?.movement_type_tags?.length
  )

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='md'>
      <DialogTitle
        sx={{ fontWeight: 700, color: 'primary.main', borderBottom: '1px solid', borderColor: 'divider', pb: 2 }}
      >
        {watch?.name || 'Thông tin đồng hồ'}
      </DialogTitle>
      <DialogContent sx={{ pb: 3 }}>
        {watch ? (
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 2,
                border: 'none',
                boxShadow: 'none',
                bgcolor: theme => theme.palette.background.paper
              }}
            >
              <Grid container spacing={3}>
                <Grid item xs={12} md={5}>
                  <Box
                    component='img'
                    src={watch.thumbnail || ''}
                    alt={watch.name}
                    sx={{
                      width: '100%',
                      height: 320,
                      borderRadius: 2,
                      border: theme => `1px solid ${theme.palette.divider}`,
                      objectFit: 'cover'
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={7}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <InfoItem
                        label='Mã'
                        value={<Typography sx={{ fontFamily: 'monospace', fontWeight: 700 }}>{watch.code}</Typography>}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <InfoItem label='Model' value={watch.model || '-'} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <InfoItem label='Chất liệu vỏ' value={watch.case_material || '-'} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <InfoItem label='Kích thước vỏ' value={watch.case_size || '-'} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <InfoItem label='Độ rộng dây' value={watch.strap_size || '-'} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <InfoItem label='Giới tính' value={watch.gender === '1' ? 'Nữ' : 'Nam'} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <InfoItem label='Chống nước' value={watch.water_resistance || '-'} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <InfoItem label='Ngày ra mắt' value={formatCompactDateVN(watch.release_date) || '-'} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <InfoItem label='Giá cơ bản' value={`${(watch.base_price || 0).toLocaleString('vi-VN')} đ`} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <InfoItem label='Trạng thái' value={watch.status ? 'Đang bán' : 'Ngừng bán'} />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Paper>

            {hasMlInfo && (
              <Box sx={{ p: 2.5, borderRadius: 2, bgcolor: theme => theme.palette.action.hover }}>
                <Stack
                  direction='row'
                  alignItems='center'
                  justifyContent='space-between'
                  onClick={() => setExpandMlInfo(!expandMlInfo)}
                  sx={{
                    mb: expandMlInfo ? 2 : 0,
                    cursor: 'pointer',
                    userSelect: 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Typography variant='subtitle1' sx={{ color: 'primary.main', fontWeight: 700 }}>
                    Thông tin ML
                  </Typography>
                  <ExpandMoreIcon
                    sx={{
                      transform: expandMlInfo ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s ease',
                      color: 'primary.main'
                    }}
                  />
                </Stack>
                <Box
                  sx={{
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    maxHeight: expandMlInfo ? 1000 : 0,
                    opacity: expandMlInfo ? 1 : 0
                  }}
                >
                  <Grid container spacing={2}>
                    {(watch as any).price_tier && (
                      <Grid item xs={12} md={4}>
                        <InfoItem label='Phân khúc giá' value={(watch as any).price_tier} />
                      </Grid>
                    )}
                    {(watch as any).gender_target && (
                      <Grid item xs={12} md={4}>
                        <InfoItem label='Đối tượng giới tính' value={(watch as any).gender_target} />
                      </Grid>
                    )}
                    {(watch as any).size_category && (
                      <Grid item xs={12} md={4}>
                        <InfoItem label='Phân loại kích thước' value={(watch as any).size_category} />
                      </Grid>
                    )}
                  </Grid>

                  <Stack spacing={1.5} sx={{ mt: 2 }}>
                    {(watch as any).style_tags?.length > 0 && (
                      <Box>
                        <Typography variant='subtitle2' color='text.secondary' sx={{ mb: 0.5 }}>
                          Thẻ phong cách
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {(watch as any).style_tags.map((tag: string) => (
                            <Chip key={tag} label={tag} color='primary' size='small' />
                          ))}
                        </Box>
                      </Box>
                    )}

                    {(watch as any).material_tags?.length > 0 && (
                      <Box>
                        <Typography variant='subtitle2' color='text.secondary' sx={{ mb: 0.5 }}>
                          Thẻ vật liệu
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {(watch as any).material_tags.map((tag: string) => (
                            <Chip key={tag} label={tag} color='secondary' size='small' />
                          ))}
                        </Box>
                      </Box>
                    )}

                    {(watch as any).color_tags?.length > 0 && (
                      <Box>
                        <Typography variant='subtitle2' color='text.secondary' sx={{ mb: 0.5 }}>
                          Thẻ màu sắc
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {(watch as any).color_tags.map((tag: string) => (
                            <Chip key={tag} label={tag} color='success' size='small' />
                          ))}
                        </Box>
                      </Box>
                    )}

                    {(watch as any).movement_type_tags?.length > 0 && (
                      <Box>
                        <Typography variant='subtitle2' color='text.secondary' sx={{ mb: 0.5 }}>
                          Thẻ loại máy
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {(watch as any).movement_type_tags.map((tag: string) => (
                            <Chip key={tag} label={tag} color='warning' size='small' />
                          ))}
                        </Box>
                      </Box>
                    )}
                  </Stack>
                </Box>
              </Box>
            )}

            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 2,
                border: 'none',
                boxShadow: 'none',
                bgcolor: theme => theme.palette.background.paper
              }}
            >
              <Typography variant='subtitle1' sx={{ fontWeight: 700, color: 'primary.main' }}>
                Ảnh mô tả sản phẩm
              </Typography>
              {sliderImages.length > 0 && (
                <Stack direction='row' alignItems='center' gap={1} sx={{ mt: 1 }}>
                  <IconButton
                    size='small'
                    onClick={() => {
                      if (sliderContainerRef.current) {
                        sliderContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' })
                      }
                    }}
                  >
                    <ChevronLeftIcon />
                  </IconButton>
                  <Box
                    ref={sliderContainerRef}
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
                    {sliderImages.map(url => (
                      <Box
                        key={url}
                        component='img'
                        src={url}
                        alt={url}
                        sx={{
                          width: 96,
                          height: 96,
                          minWidth: 96,
                          objectFit: 'cover',
                          borderRadius: 1,
                          border: theme => `1px solid ${theme.palette.divider}`,
                          cursor: 'pointer'
                        }}
                      />
                    ))}
                  </Box>
                  <IconButton
                    size='small'
                    onClick={() => {
                      if (sliderContainerRef.current) {
                        sliderContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' })
                      }
                    }}
                  >
                    <ChevronRightIcon />
                  </IconButton>
                </Stack>
              )}
              {sliderImages.length === 0 && (
                <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
                  Chưa có ảnh slider
                </Typography>
              )}
            </Paper>

            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 2,
                border: 'none',
                boxShadow: 'none',
                bgcolor: theme => theme.palette.background.paper
              }}
            >
              <Stack direction='row' alignItems='center' justifyContent='space-between' sx={{ mb: 1 }}>
                <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>
                  Danh sách phân loại sản phẩm
                </Typography>
                <Button size='small' variant='outlined' startIcon={<AddIcon />} onClick={() => onAddVariant(watch)}>
                  Thêm biến thể
                </Button>
              </Stack>
              <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 'none', border: 'none' }}>
                <Table size='small'>
                  <TableHead>
                    <TableRow>
                      <TableCell>STT</TableCell>
                      <TableCell>Màu</TableCell>
                      <TableCell>Vật liệu dây</TableCell>
                      <TableCell>Tồn</TableCell>
                      <TableCell>Giá</TableCell>
                      <TableCell align='right'>Thao tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {variants
                      .filter(v => v.del_flag !== '1')
                      .map((variant, index) => (
                        <TableRow key={variant.id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>
                            {colors.find(c => String(c.id) === String(variant.color_id))?.name || variant.color_id}
                          </TableCell>
                          <TableCell>
                            {strapMaterials.find(s => String(s.id) === String(variant.strap_material_id))?.name ||
                              variant.strap_material_id}
                          </TableCell>
                          <TableCell>{variant.stock_quantity}</TableCell>
                          <TableCell>{(variant.price || 0).toLocaleString('vi-VN')}</TableCell>
                          <TableCell align='right'>
                            <Stack direction='row' spacing={1} justifyContent='flex-end'>
                              <IconButton size='small' onClick={() => onEditVariant(variant)}>
                                <EditIcon fontSize='small' />
                              </IconButton>
                              <IconButton size='small' onClick={() => onDeleteVariant(variant)}>
                                <DeleteIcon fontSize='small' />
                              </IconButton>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    {variants.filter(v => v.del_flag !== '1').length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} align='center'>
                          Chưa có biến thể
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Stack>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  )
}

export default WatchDetailDialog
