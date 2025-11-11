import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd'
import VisibilityIcon from '@mui/icons-material/Visibility'
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
import type { NextPage } from 'next'
import React, { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import AdvancedFilter, { FilterConfig, useAdvancedFilter } from 'src/components/advanced-filter'
import CustomPagination from 'src/components/custom-pagination'
import Spinner from 'src/components/spinner'
import { PAGE_SIZE_OPTION } from 'src/configs/gridConfig'
import { getBrands } from 'src/services/brand'
import { getCategories } from 'src/services/category'
import { getColors } from 'src/services/color'
import { uploadImage, uploadMultipleImages } from 'src/services/file'
import { getMovementTypes } from 'src/services/movementType'
import { getStrapMaterials } from 'src/services/strapMaterial'
import {
  createWatch,
  createWatchVariant,
  deleteWatchVariant,
  getWatchById,
  getWatches,
  getWatchVariants,
  updateWatch,
  updateWatchVariant
} from 'src/services/watch'
import type { TBrand } from 'src/types/brand'
import type { TCategory } from 'src/types/category/manage'
import type { TColor } from 'src/types/color'
import type { TMovementType } from 'src/types/movementType'
import type { TStrapMaterial } from 'src/types/strapMaterial'
import type {
  CreateWatchVariant,
  GetWatchesResponse,
  GetWatchResponse,
  TCreateWatch,
  TWatch,
  TWatchVariant
} from 'src/types/watch'
import ManageSystemLayout from 'src/views/layouts/ManageSystemLayout'
import MLFields from 'src/components/ml-fields/MLFields'

const WatchPage: NextPage = () => {
  const [items, setItems] = useState<TWatch[]>([])
  const [variantCountByWatchId, setVariantCountByWatchId] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [openCreate, setOpenCreate] = useState(false)
  const [selected, setSelected] = useState<TWatch | null>(null)

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTION[0])

  const [brands, setBrands] = useState<TBrand[]>([])
  const [categories, setCategories] = useState<TCategory[]>([])
  const [movementTypes, setMovementTypes] = useState<TMovementType[]>([])
  const [colors, setColors] = useState<TColor[]>([])
  const [strapMaterials, setStrapMaterials] = useState<TStrapMaterial[]>([])

  const filterConfig: FilterConfig = React.useMemo(() => {
    return {
      searchFields: [
        { key: 'name', label: 'Tên đồng hồ', type: 'string' },
        { key: 'code', label: 'Mã đồng hồ', type: 'string' }
      ],
      filterFields: [
        {
          key: 'brand_id',
          label: 'Thương hiệu',
          type: 'select',
          operator: 'eq',
          options: brands
            .filter(b => b.del_flag !== '1')
            .map(brand => ({
              value: String(brand.id),
              label: brand.name
            }))
        },
        {
          key: 'category_id',
          label: 'Phân loại',
          type: 'select',
          operator: 'eq',
          options: categories
            .filter(c => c.del_flag !== '1')
            .map(category => ({
              value: String(category.id),
              label: category.name
            }))
        },
        {
          key: 'movement_type_id',
          label: 'Loại máy',
          type: 'select',
          operator: 'eq',
          options: movementTypes
            .filter(m => m.del_flag !== '1')
            .map(movementType => ({
              value: String(movementType.id),
              label: movementType.name
            }))
        },
        {
          key: 'gender',
          label: 'Giới tính',
          type: 'select',
          operator: 'eq',
          options: [
            { value: '0', label: 'Nam' },
            { value: '1', label: 'Nữ' }
          ]
        },
        {
          key: 'status',
          label: 'Trạng thái',
          type: 'select',
          operator: 'eq',
          options: [
            { value: '1', label: 'Đang bán' },
            { value: '0', label: 'Ngừng bán' }
          ]
        },
        {
          key: 'base_price_min',
          label: 'Giá từ (VNĐ)',
          type: 'number',
          operator: 'gte'
        },
        {
          key: 'base_price_max',
          label: 'Giá đến (VNĐ)',
          type: 'number',
          operator: 'lte'
        },
        {
          key: 'price_tier',
          label: 'Phân khúc giá',
          type: 'select',
          operator: 'eq',
          options: [
            { value: 'budget', label: 'Budget' },
            { value: 'mid_range', label: 'Mid Range' },
            { value: 'premium', label: 'Premium' },
            { value: 'luxury', label: 'Luxury' }
          ]
        },
        {
          key: 'gender_target',
          label: 'Đối tượng giới tính',
          type: 'select',
          operator: 'eq',
          options: [
            { value: 'M', label: 'Nam' },
            { value: 'F', label: 'Nữ' },
            { value: 'U', label: 'Unisex' }
          ]
        },
        {
          key: 'size_category',
          label: 'Phân loại kích thước',
          type: 'select',
          operator: 'eq',
          options: [
            { value: 'small', label: 'Nhỏ (< 38mm)' },
            { value: 'medium', label: 'Trung bình (38-42mm)' },
            { value: 'large', label: 'Lớn (> 42mm)' }
          ]
        },
        {
          key: 'style_tags',
          label: 'Thẻ phong cách',
          type: 'multiselect',
          operator: 'in',
          options: [
            'sport',
            'dress',
            'casual',
            'luxury',
            'vintage',
            'modern',
            'classic',
            'chronograph',
            'diving',
            'pilot',
            'military',
            'professional',
            'elegant'
          ].map(tag => ({ value: tag, label: tag }))
        },
        {
          key: 'material_tags',
          label: 'Thẻ vật liệu',
          type: 'multiselect',
          operator: 'in',
          options: [
            'stainless_steel',
            'titanium',
            'gold',
            'platinum',
            'ceramic',
            'carbon_fiber',
            'leather',
            'rubber',
            'fabric',
            'metal_bracelet',
            'sapphire_crystal',
            'mineral_crystal'
          ].map(tag => ({ value: tag, label: tag }))
        },
        {
          key: 'color_tags',
          label: 'Thẻ màu sắc',
          type: 'multiselect',
          operator: 'in',
          options: [
            'black',
            'white',
            'silver',
            'gold',
            'blue',
            'green',
            'red',
            'brown',
            'gray',
            'rose_gold',
            'yellow_gold',
            'platinum',
            'two_tone'
          ].map(tag => ({ value: tag, label: tag }))
        },
        {
          key: 'movement_type_tags',
          label: 'Thẻ loại máy',
          type: 'multiselect',
          operator: 'in',
          options: [
            'mechanical',
            'automatic',
            'manual_wind',
            'quartz',
            'solar',
            'kinetic',
            'spring_drive',
            'tourbillon',
            'chronometer'
          ].map(tag => ({ value: tag, label: tag }))
        }
      ],
      sortOptions: [
        { value: 'name:asc', label: 'Tên A-Z' },
        { value: 'name:desc', label: 'Tên Z-A' },
        { value: 'base_price:asc', label: 'Giá thấp đến cao' },
        { value: 'base_price:desc', label: 'Giá cao đến thấp' },
        { value: 'created_at:desc', label: 'Mới nhất' },
        { value: 'created_at:asc', label: 'Cũ nhất' }
      ],
      dateRangeFields: [
        { key: 'created_at', label: 'Ngày tạo' },
        { key: 'release_date', label: 'Ngày ra mắt' }
      ]
    }
  }, [brands, categories, movementTypes])

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

  const handleFilterChange = React.useCallback(
    (newValues: typeof filterValues) => {
      setFilterValues(newValues)
    },
    [setFilterValues]
  )

  const handleFilterReset = React.useCallback(() => {
    resetFilters()
  }, [resetFilters])

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
    status: '1',
    thumbnail: '',
    slider: '',
    category_id: '' as any,
    brand_id: '' as any,
    movement_type_id: '' as any,
    price_tier: '',
    gender_target: '',
    size_category: '',
    style_tags: [],
    material_tags: [],
    color_tags: [],
    movement_type_tags: [],
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
        getCategories(),
        getMovementTypes(),
        getColors(),
        getStrapMaterials()
      ])
      setBrands((b as any)?.brands?.items || [])
      setCategories((c as any)?.categorys?.items || [])
      setMovementTypes((m as any)?.movementTypes?.items || [])
      setColors((cl as any)?.colors?.items || [])
      setStrapMaterials((sm as any)?.strapMaterials?.rows || [])
    } catch {}
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const [wRes, vRes] = await Promise.all([getWatches(), getWatchVariants()])
      const data = wRes as GetWatchesResponse
      const watchData = (data as any)?.watches

      const allItems = watchData?.items || watchData?.rows || []
      setItems(allItems)

      const vrows = (vRes as any)?.variants?.items || []
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

  useEffect(() => {
    setPage(1)
  }, [filterValues.search, filterValues.filters])

  const { filteredData, paginatedData } = useMemo(() => {
    const searchTerm = (filterValues.search || '').toLowerCase().trim()

    const filtered = items.filter(it => {
      // Text search
      if (searchTerm) {
        const matchesSearch =
          it.name.toLowerCase().includes(searchTerm) ||
          it.code.toLowerCase().includes(searchTerm) ||
          String(it.id).toLowerCase().includes(searchTerm)
        if (!matchesSearch) return false
      }

      // Filter conditions
      const filters = filterValues.filters || {}

      if (filters.brand_id && String(it.brand_id) !== String(filters.brand_id)) return false
      if (filters.category_id && String(it.category_id) !== String(filters.category_id)) return false
      if (filters.movement_type_id && String(it.movement_type_id) !== String(filters.movement_type_id)) return false
      if (filters.gender && String(it.gender) !== String(filters.gender)) return false
      if (filters.status && String(it.status ? '1' : '0') !== String(filters.status)) return false

      if (filters.base_price_min && Number(it.base_price) < Number(filters.base_price_min)) return false
      if (filters.base_price_max && Number(it.base_price) > Number(filters.base_price_max)) return false

      // ML Filters
      if (filters.price_tier && (it as any).price_tier !== filters.price_tier) return false
      if (filters.gender_target && (it as any).gender_target !== filters.gender_target) return false
      if (filters.size_category && (it as any).size_category !== filters.size_category) return false

      // Tag filters (check if any of the selected tags exist in the watch's tags)
      if (filters.style_tags && Array.isArray(filters.style_tags) && filters.style_tags.length > 0) {
        const watchStyleTags = (it as any).style_tags || []
        const hasMatchingTag = filters.style_tags.some((tag: string) => watchStyleTags.includes(tag))
        if (!hasMatchingTag) return false
      }

      if (filters.material_tags && Array.isArray(filters.material_tags) && filters.material_tags.length > 0) {
        const watchMaterialTags = (it as any).material_tags || []
        const hasMatchingTag = filters.material_tags.some((tag: string) => watchMaterialTags.includes(tag))
        if (!hasMatchingTag) return false
      }

      if (filters.color_tags && Array.isArray(filters.color_tags) && filters.color_tags.length > 0) {
        const watchColorTags = (it as any).color_tags || []
        const hasMatchingTag = filters.color_tags.some((tag: string) => watchColorTags.includes(tag))
        if (!hasMatchingTag) return false
      }

      if (
        filters.movement_type_tags &&
        Array.isArray(filters.movement_type_tags) &&
        filters.movement_type_tags.length > 0
      ) {
        const watchMovementTags = (it as any).movement_type_tags || []
        const hasMatchingTag = filters.movement_type_tags.some((tag: string) => watchMovementTags.includes(tag))
        if (!hasMatchingTag) return false
      }

      return true
    })

    const sortedData = [...filtered]
    if (filterValues.sort) {
      const [field, direction] = filterValues.sort.split(':')
      sortedData.sort((a: any, b: any) => {
        let valueA = a[field]
        let valueB = b[field]

        if (field === 'base_price') {
          valueA = Number(valueA) || 0
          valueB = Number(valueB) || 0
        } else if (typeof valueA === 'string') {
          valueA = valueA.toLowerCase()
          valueB = valueB.toLowerCase()
        }

        if (direction === 'desc') {
          return valueA < valueB ? 1 : valueA > valueB ? -1 : 0
        } else {
          return valueA > valueB ? 1 : valueA < valueB ? -1 : 0
        }
      })
    }

    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginated = sortedData.slice(startIndex, endIndex)

    return {
      filteredData: sortedData,
      paginatedData: paginated
    }
  }, [items, filterValues.search, filterValues.filters, filterValues.sort, page, pageSize])

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
      status: '1',
      thumbnail: '',
      slider: '',
      category_id: '' as any,
      brand_id: '' as any,
      movement_type_id: '' as any,
      price_tier: '',
      gender_target: '',
      size_category: '',
      style_tags: [],
      material_tags: [],
      color_tags: [],
      movement_type_tags: [],
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
      const payload = {
        ...form,
        brand_id: Number(form.brand_id),
        category_id: Number(form.category_id),
        movement_type_id: Number(form.movement_type_id),
        variants: form.variants?.map(v => ({
          ...v,
          color_id: Number((v as any).color_id),
          strap_material_id: Number((v as any).strap_material_id)
        })),
        sold: undefined as any,
        rating: undefined as any,
        status: '1' as any
      }
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
    price_tier: '',
    gender_target: '',
    size_category: '',
    style_tags: [],
    material_tags: [],
    color_tags: [],
    movement_type_tags: [],
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
      const payload = {
        ...variantNew,
        watch_id: Number(variantNew.watch_id),
        color_id: Number(variantNew.color_id),
        strap_material_id: Number(variantNew.strap_material_id)
      }
      const res = await createWatchVariant(payload)
      if ((res as any)?.variant?.id) {
        toast.success('Thêm biến thể thành công')
        setOpenVariants(false)
        fetchData()
        const createdWatchId = String(variantNew.watch_id)
        if (viewingWatch && String(viewingWatch.id) === createdWatchId) {
          const wRes = await getWatchById(createdWatchId)
          const watchData = (wRes as any)?.watch || viewingWatch
          setViewingWatch(watchData)

          // Check if variants are already included in the watch data
          if (watchData.variants && Array.isArray(watchData.variants)) {
            setViewVariants(watchData.variants)
          } else {
            // Fallback: fetch variants separately
            const vRes = await getWatchVariants()
            const all = ((vRes as any)?.variants?.items || []) as TWatchVariant[]
            setViewVariants(all.filter(i => String(i.watch_id) === createdWatchId))
          }
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

  const handleOnchangePagination = (page: number, pageSize: number) => {
    setPage(page)
    setPageSize(pageSize)
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

      {/* Advanced Filter */}
      <AdvancedFilter
        config={filterConfig}
        values={filterValues}
        onChange={handleFilterChange}
        onReset={handleFilterReset}
        loading={loading}
        compact={false}
      />

      <TableContainer
        component={Paper}
        elevation={0}
        sx={{ borderRadius: 2, border: theme => `1px solid ${theme.palette.divider}` }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width={90}>STT</TableCell>
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
            {paginatedData.map((row, index) => (
              <TableRow key={row.id} hover sx={{ opacity: row.del_flag === '1' ? 0.6 : 1 }}>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{(page - 1) * pageSize + index + 1}</TableCell>
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
                          const wRes = await getWatchById(String(row.id))
                          const watchData = (wRes as any)?.watch || row
                          setViewingWatch(watchData)

                          // Check if variants are already included in the watch data
                          if (watchData.variants && Array.isArray(watchData.variants)) {
                            setViewVariants(watchData.variants)
                          } else {
                            // Fallback: fetch variants separately
                            const vRes = await getWatchVariants()
                            const all = ((vRes as any)?.variants?.items || []) as any[]
                            setViewVariants(all.filter(v => String(v.watch_id) === String(row.id)) as any)
                          }
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
                            status: String(w.status || '1') as any,
                            thumbnail: w.thumbnail || '',
                            slider: w.slider || '',
                            category_id: (w.category_id as any) || '',
                            brand_id: (w.brand_id as any) || '',
                            movement_type_id: (w.movement_type_id as any) || '',
                            price_tier: (w as any).price_tier || '',
                            gender_target: (w as any).gender_target || '',
                            size_category: (w as any).size_category || '',
                            style_tags: (w as any).style_tags || [],
                            material_tags: (w as any).material_tags || [],
                            color_tags: (w as any).color_tags || [],
                            movement_type_tags: (w as any).movement_type_tags || [],
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
            {paginatedData.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align='center'>
                  {loading ? 'Đang tải...' : 'Không có dữ liệu'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <Box sx={{ mt: 4, mb: 4, width: '100%' }} display='flex' justifyContent='center' alignItems='center'>
          <CustomPagination
            onChangePagination={handleOnchangePagination}
            pageSizeOptions={PAGE_SIZE_OPTION}
            pageSize={pageSize}
            totalPages={Math.ceil(filteredData.length / pageSize)}
            page={page}
            rowLength={filteredData.length}
            isHideShowed={false}
          />
        </Box>
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
                onFocus={e => {
                  if (e.target.value === '0') {
                    e.target.select()
                  }
                }}
                onBlur={e => {
                  if (!e.target.value || e.target.value === '') {
                    setForm(p => ({ ...p, base_price: 0 }))
                  }
                }}
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

            {/* ML Fields */}
            <Grid item xs={12}>
              <MLFields
                values={{
                  price_tier: form.price_tier || '',
                  gender_target: form.gender_target || '',
                  size_category: form.size_category || '',
                  style_tags: form.style_tags || [],
                  material_tags: form.material_tags || [],
                  color_tags: form.color_tags || [],
                  movement_type_tags: form.movement_type_tags || []
                }}
                onChange={(field, value) => setForm(prev => ({ ...prev, [field]: value }))}
              />
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
                    onFocus={e => {
                      if (e.target.value === '0') {
                        e.target.select()
                      }
                    }}
                    onBlur={e => {
                      if (!e.target.value || e.target.value === '') {
                        setVariantDraft(v => ({ ...v, stock_quantity: 0 }))
                      }
                    }}
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
                  onFocus={e => {
                    if (e.target.value === '0') {
                      e.target.select()
                    }
                  }}
                  onBlur={e => {
                    if (!e.target.value || e.target.value === '') {
                      setVariantEditing((p: any) => ({ ...p, stock_quantity: 0 }))
                    }
                  }}
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

                // Refresh the watch data to get updated variants
                if (viewingWatch) {
                  const wRes = await getWatchById(String(viewingWatch.id))
                  const watchData = (wRes as any)?.watch || viewingWatch
                  setViewingWatch(watchData)

                  // Check if variants are already included in the watch data
                  if (watchData.variants && Array.isArray(watchData.variants)) {
                    setViewVariants(watchData.variants)
                  } else {
                    // Fallback: fetch variants separately
                    const vRes = await getWatchVariants()
                    const all = ((vRes as any)?.variants?.items || []) as TWatchVariant[]
                    setViewVariants(all.filter(i => String(i.watch_id) === String(viewingWatch.id)))
                  }
                }
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

                  {/* ML Fields Display */}
                  {((viewingWatch as any).price_tier ||
                    (viewingWatch as any).gender_target ||
                    (viewingWatch as any).size_category ||
                    (viewingWatch as any).style_tags?.length ||
                    (viewingWatch as any).material_tags?.length ||
                    (viewingWatch as any).color_tags?.length ||
                    (viewingWatch as any).movement_type_tags?.length) && (
                    <Box sx={{ mt: 3 }}>
                      <Typography variant='subtitle1' sx={{ mb: 2, color: 'primary.main' }}>
                        🎯 Thông tin ML
                      </Typography>
                      <Grid container spacing={2}>
                        {(viewingWatch as any).price_tier && (
                          <Grid item xs={12} sm={4}>
                            <Typography variant='subtitle2' color='text.secondary'>
                              Phân khúc giá
                            </Typography>
                            <Typography>{(viewingWatch as any).price_tier}</Typography>
                          </Grid>
                        )}
                        {(viewingWatch as any).gender_target && (
                          <Grid item xs={12} sm={4}>
                            <Typography variant='subtitle2' color='text.secondary'>
                              Đối tượng giới tính
                            </Typography>
                            <Typography>{(viewingWatch as any).gender_target}</Typography>
                          </Grid>
                        )}
                        {(viewingWatch as any).size_category && (
                          <Grid item xs={12} sm={4}>
                            <Typography variant='subtitle2' color='text.secondary'>
                              Phân loại kích thước
                            </Typography>
                            <Typography>{(viewingWatch as any).size_category}</Typography>
                          </Grid>
                        )}
                      </Grid>

                      {/* Tags Display */}
                      <Box sx={{ mt: 2 }}>
                        {(viewingWatch as any).style_tags?.length > 0 && (
                          <Box sx={{ mb: 1 }}>
                            <Typography variant='subtitle2' color='text.secondary' sx={{ mb: 0.5 }}>
                              Thẻ phong cách:
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {(viewingWatch as any).style_tags.map((tag: string) => (
                                <Chip key={tag} label={tag} color='primary' size='small' />
                              ))}
                            </Box>
                          </Box>
                        )}

                        {(viewingWatch as any).material_tags?.length > 0 && (
                          <Box sx={{ mb: 1 }}>
                            <Typography variant='subtitle2' color='text.secondary' sx={{ mb: 0.5 }}>
                              Thẻ vật liệu:
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {(viewingWatch as any).material_tags.map((tag: string) => (
                                <Chip key={tag} label={tag} color='secondary' size='small' />
                              ))}
                            </Box>
                          </Box>
                        )}

                        {(viewingWatch as any).color_tags?.length > 0 && (
                          <Box sx={{ mb: 1 }}>
                            <Typography variant='subtitle2' color='text.secondary' sx={{ mb: 0.5 }}>
                              Thẻ màu sắc:
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {(viewingWatch as any).color_tags.map((tag: string) => (
                                <Chip key={tag} label={tag} color='success' size='small' />
                              ))}
                            </Box>
                          </Box>
                        )}

                        {(viewingWatch as any).movement_type_tags?.length > 0 && (
                          <Box sx={{ mb: 1 }}>
                            <Typography variant='subtitle2' color='text.secondary' sx={{ mb: 0.5 }}>
                              Thẻ loại máy:
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {(viewingWatch as any).movement_type_tags.map((tag: string) => (
                                <Chip key={tag} label={tag} color='warning' size='small' />
                              ))}
                            </Box>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  )}
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

                                // Refresh the watch data to get updated variants
                                if (viewingWatch) {
                                  const wRes = await getWatchById(String(viewingWatch.id))
                                  const watchData = (wRes as any)?.watch || viewingWatch
                                  setViewingWatch(watchData)

                                  // Check if variants are already included in the watch data
                                  if (watchData.variants && Array.isArray(watchData.variants)) {
                                    setViewVariants(watchData.variants)
                                  } else {
                                    // Fallback: fetch variants separately
                                    const vRes = await getWatchVariants()
                                    const all = ((vRes as any)?.variants?.items || []) as TWatchVariant[]
                                    setViewVariants(all.filter(i => String(i.watch_id) === String(viewingWatch.id)))
                                  }
                                }
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
                onFocus={e => {
                  if (e.target.value === '0') {
                    e.target.select()
                  }
                }}
                onBlur={e => {
                  if (!e.target.value || e.target.value === '') {
                    setEditForm(p => ({ ...p, base_price: 0 }))
                  }
                }}
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

            {/* ML Fields */}
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
              onChange={(field, value) => setEditForm(prev => ({ ...prev, [field]: value }))}
            />
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
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { variants, ...rest } = editForm as any
                const payload = {
                  ...rest,
                  brand_id: Number(rest.brand_id),
                  category_id: Number(rest.category_id),
                  movement_type_id: Number(rest.movement_type_id),
                  status: String(editForm.status || '1') as any
                }
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
                    onFocus={e => {
                      if (e.target.value === '0') {
                        e.target.select()
                      }
                    }}
                    onBlur={e => {
                      if (!e.target.value || e.target.value === '') {
                        setVariantNew(v => ({ ...v, stock_quantity: 0 }))
                      }
                    }}
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
