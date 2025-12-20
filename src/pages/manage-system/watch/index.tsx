import AddIcon from '@mui/icons-material/Add'
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
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography
} from '@mui/material'
import type { NextPage } from 'next'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
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
import { dateInputToCompact, formatCompactVN } from 'src/utils/date'
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
import WatchDetailDialog from './WatchDetailDialog'
import EditWatchDialog from './EditWatchDialog'

const getTodayReleaseDate = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')

  return dateInputToCompact(`${year}-${month}-${day}`)
}

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

  // Form validation state
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof TCreateWatch | 'variants', string>>>({})

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
    release_date: getTodayReleaseDate(),
    base_price: 0,
    rating: 0,
    status: true,
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

  const fetchAllItems = async <T,>(
    fetchFn: (params?: any) => Promise<any>,
    dataPath: string,
    limit: number = 1000
  ): Promise<T[]> => {
    const aggregated: T[] = []
    let currentPage = 1
    let totalPages = 1
    let totalItems = 0

    while (currentPage <= totalPages) {
      const res = await fetchFn({ page: currentPage, limit })
      const data = res?.[dataPath] || res

      if (!data) break

      const pageItems = data.items || data.rows || []
      aggregated.push(...pageItems)

      totalPages = data.totalPages || 1
      totalItems = data.totalItems || aggregated.length

      if (aggregated.length >= totalItems || pageItems.length < limit) break

      currentPage += 1
    }

    return aggregated
  }

  const fetchMasters = async () => {
    try {
      const [b, c, m, cl, sm] = await Promise.all([
        fetchAllItems<TBrand>(getBrands, 'brands', 1000),
        fetchAllItems<TCategory>(getCategories, 'categorys', 1000),
        fetchAllItems<TMovementType>(getMovementTypes, 'movementTypes', 1000),
        fetchAllItems<TColor>(getColors, 'colors', 1000),
        fetchAllItems<TStrapMaterial>(getStrapMaterials, 'strapMaterials', 1000)
      ])
      setBrands(b)
      setCategories(c)
      setMovementTypes(m)
      setColors(cl)
      setStrapMaterials(sm)
    } catch {}
  }

  const WATCH_FETCH_PAGE_SIZE = 100

  const fetchAllWatches = async () => {
    const aggregated: TWatch[] = []
    let currentPage = 1
    let totalPages = 1
    let totalItems = 0

    while (currentPage <= totalPages) {
      const wRes = (await getWatches({
        page: currentPage,
        limit: WATCH_FETCH_PAGE_SIZE
      })) as GetWatchesResponse

      const watchData = (wRes as any)?.watches
      if (!watchData) break

      const pageItems = watchData.items || watchData.rows || []
      aggregated.push(...pageItems)

      totalPages = watchData.totalPages || 1
      totalItems = watchData.totalItems || aggregated.length

      if (aggregated.length >= totalItems) break

      currentPage += 1
    }

    return aggregated
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const [allWatches, vRes] = await Promise.all([fetchAllWatches(), getWatchVariants()])

      setItems(allWatches)

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

  const validateFieldOnBlur = useCallback((field: keyof TCreateWatch, value: any) => {
    setFormErrors(prev => {
      const newErrors = { ...prev }

      if (field === 'base_price') {
        const num = Number(value)
        if (Number.isNaN(num)) {
          newErrors[field] = 'Giá cơ bản không hợp lệ'
        } else if (num <= 0) {
          newErrors[field] = 'Giá cơ bản phải lớn hơn 0'
        } else {
          delete newErrors[field]
        }

        return newErrors
      }

      const str = typeof value === 'string' ? value.trim() : value
      if (!str) {
        const messages: Record<string, string> = {
          code: 'Mã không được để trống',
          name: 'Tên không được để trống',
          description: 'Mô tả không được để trống',
          model: 'Model không được để trống'
        }
        const msg = messages[field as string] || 'Trường này không được để trống'
        newErrors[field] = msg
      } else {
        delete newErrors[field]
      }

      return newErrors
    })
  }, [])

  const clearFieldError = useCallback((field: keyof TCreateWatch | 'variants') => {
    setFormErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[field]

      return newErrors
    })
  }, [])

  const resetForm = () => {
    setFormErrors({})
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
      release_date: getTodayReleaseDate(),
      base_price: 0,
      rating: 0,
      status: true,
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
    if (!v.color_id || !v.strap_material_id) {
      setFormErrors(prev => ({ ...prev, variants: 'Chọn màu và vật liệu dây đeo' }))

      return toast.error('Chọn màu và vật liệu dây đeo')
    }
    const stockNumber = Number(v.stock_quantity)
    if (Number.isNaN(stockNumber) || stockNumber < 0 || !Number.isInteger(stockNumber)) {
      setFormErrors(prev => ({ ...prev, variants: 'Tồn kho phải là số nguyên >= 0' }))

      return toast.error('Tồn kho phải là số nguyên >= 0')
    }
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
    clearFieldError('variants')
    setVariantDraft({ color_id: '' as any, strap_material_id: '' as any, stock_quantity: 0 } as any)
  }

  const handleRemoveVariantDraft = (idx: number) => {
    const next = [...(form.variants || [])]
    next.splice(idx, 1)
    setForm(prev => ({ ...prev, variants: next }))
  }

  const handleCreate = async () => {
    // Validate all fields
    const errors: Partial<Record<keyof TCreateWatch | 'variants', string>> = {}

    if (!form.code.trim()) errors.code = 'Mã không được để trống'
    if (!form.name.trim()) errors.name = 'Tên không được để trống'
    if (!(form.description || '').trim()) errors.description = 'Mô tả không được để trống'
    if (!(form.model || '').trim()) errors.model = 'Model không được để trống'

    const basePrice = Number(form.base_price)
    if (Number.isNaN(basePrice)) {
      errors.base_price = 'Giá cơ bản không hợp lệ'
    } else if (basePrice <= 0) {
      errors.base_price = 'Giá cơ bản phải lớn hơn 0'
    }

    if (!form.brand_id) errors.brand_id = 'Chọn thương hiệu'
    if (!form.category_id) errors.category_id = 'Chọn phân loại'
    if (!form.movement_type_id) errors.movement_type_id = 'Chọn loại máy'

    if (!form.variants || form.variants.length === 0) {
      errors.variants = 'Cần ít nhất 1 biến thể'
    } else {
      form.variants.forEach((v: any, idx: number) => {
        if (!v.color_id || !v.strap_material_id) {
          errors.variants = `Biến thể #${idx + 1} thiếu màu hoặc vật liệu dây`
        }
        const stock = Number(v.stock_quantity)
        if (Number.isNaN(stock) || stock < 0 || !Number.isInteger(stock)) {
          errors.variants = `Tồn kho biến thể #${idx + 1} phải là số nguyên >= 0`
        }
      })
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      const firstError = Object.values(errors)[0]
      toast.error(firstError)

      return
    }
    try {
      setActionLoading(true)
      let releaseDate = form.release_date || ''
      if (releaseDate && releaseDate.length < 14) {
        releaseDate = releaseDate.padEnd(14, '0')
      }
      const payload = {
        ...form,
        release_date: releaseDate,
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
        status: true
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
    release_date: getTodayReleaseDate(),
    base_price: 0,
    rating: 0,
    status: true,
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

  const refreshViewingWatch = useCallback(
    async (watchId: string | number) => {
      const id = String(watchId)
      const wRes = await getWatchById(id)
      const watchData = (wRes as any)?.watch || viewingWatch
      if (watchData) {
        setViewingWatch(watchData)
      }

      if (watchData?.variants && Array.isArray(watchData.variants)) {
        setViewVariants(watchData.variants.filter((v: TWatchVariant) => v.del_flag !== '1'))
      } else {
        const vRes = await getWatchVariants()
        const all = ((vRes as any)?.variants?.items || []) as TWatchVariant[]
        setViewVariants(all.filter(i => String(i.watch_id) === id && i.del_flag !== '1'))
      }
    },
    [viewingWatch]
  )

  const handleViewWatch = useCallback(
    async (row: TWatch) => {
      try {
        setActionLoading(true)
        await refreshViewingWatch(row.id)
        setOpenViewWatch(true)
      } catch {
        toast.error('Không tải được chi tiết')
      } finally {
        setActionLoading(false)
      }
    },
    [refreshViewingWatch]
  )

  const handleOpenEditVariant = (variant: TWatchVariant) => {
    setVariantEditing({ ...(variant as any) })
    setOpenEditVariant(true)
  }

  const handleDeleteVariantFromView = async (variant: TWatchVariant) => {
    if (!variant?.id || !viewingWatch) return
    try {
      setActionLoading(true)
      await deleteWatchVariant(String(variant.id))
      toast.success('Đã xóa biến thể')
      await refreshViewingWatch(viewingWatch.id)
    } catch (e: any) {
      toast.error(e?.message || 'Xóa thất bại')
    } finally {
      setActionLoading(false)
    }
  }

  const handleAddVariantFromView = (watch: TWatch) => {
    openVariantDialog(watch)
  }

  const handleToggleStatus = async (watch: TWatch) => {
    try {
      setActionLoading(true)
      const newStatus = !watch.status
      const payload = {
        code: watch.code,
        name: watch.name,
        base_price: watch.base_price,
        category_id: Number(watch.category_id),
        brand_id: Number(watch.brand_id),
        movement_type_id: Number(watch.movement_type_id),
        status: newStatus
      }
      await updateWatch(String(watch.id), payload as any)
      toast.success(newStatus ? 'Đã bật trạng thái bán' : 'Đã tắt trạng thái bán')
      await fetchData()
    } catch (err: any) {
      toast.error(err?.message || 'Cập nhật trạng thái thất bại')
    } finally {
      setActionLoading(false)
    }
  }

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

          if (watchData.variants && Array.isArray(watchData.variants)) {
            setViewVariants(watchData.variants.filter((v: TWatchVariant) => v.del_flag !== '1'))
          } else {
            const vRes = await getWatchVariants()
            const all = ((vRes as any)?.variants?.items || []) as TWatchVariant[]
            setViewVariants(all.filter(i => String(i.watch_id) === createdWatchId && i.del_flag !== '1'))
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
              <TableCell width={90} sx={{ whiteSpace: 'nowrap' }}>
                STT
              </TableCell>
              <TableCell width={160} sx={{ whiteSpace: 'nowrap' }}>
                Mã
              </TableCell>
              <TableCell width={100} sx={{ whiteSpace: 'nowrap' }}>
                Ảnh
              </TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>Tên sản phẩm</TableCell>
              <TableCell width={140} sx={{ whiteSpace: 'nowrap' }}>
                Giá
              </TableCell>
              <TableCell width={140} sx={{ whiteSpace: 'nowrap' }}>
                SL bán
              </TableCell>
              <TableCell width={140} sx={{ whiteSpace: 'nowrap' }}>
                Tồn kho
              </TableCell>
              <TableCell width={120} sx={{ whiteSpace: 'nowrap' }}>
                Giới tính
              </TableCell>
              <TableCell width={120} align='center' sx={{ whiteSpace: 'nowrap' }}>
                Trạng thái
              </TableCell>
              <TableCell width={180} sx={{ whiteSpace: 'nowrap' }}>
                Ngày tạo
              </TableCell>
              {/* <TableCell width={120}>Biến thể</TableCell> */}
              <TableCell width={160} align='center' sx={{ whiteSpace: 'nowrap' }}>
                Thao tác
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((row, index) => (
              <TableRow key={row.id} hover sx={{ opacity: row.del_flag === '1' ? 0.6 : 1 }}>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{(page - 1) * pageSize + index + 1}</TableCell>
                <TableCell sx={{ fontFamily: 'monospace' }}>{row.code}</TableCell>
                <TableCell>
                  {row.thumbnail ? (
                    <Box
                      component='img'
                      src={row.thumbnail}
                      alt={row.name}
                      sx={{
                        width: 60,
                        height: 60,
                        objectFit: 'cover',
                        borderRadius: 1,
                        border: theme => `1px solid ${theme.palette.divider}`
                      }}
                      onError={e => {
                        console.log('Image load error for:', row.name, 'URL:', row.thumbnail)
                        e.currentTarget.style.display = 'none'
                      }}
                      onLoad={() => {
                        console.log('Image loaded successfully for:', row.name, 'URL:', row.thumbnail)
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'grey.100',
                        borderRadius: 1,
                        border: theme => `1px solid ${theme.palette.divider}`
                      }}
                    >
                      <Typography variant='caption' color='text.disabled'>
                        N/A
                      </Typography>
                    </Box>
                  )}
                </TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell>{(row.base_price || 0).toLocaleString('vi-VN')}</TableCell>
                <TableCell>{Number(row.sold || 0)}</TableCell>
                <TableCell>{Number(row.totalInventory || 0)}</TableCell>
                <TableCell>{row.gender === '1' ? 'Nữ' : 'Nam'}</TableCell>
                <TableCell>
                  {row.del_flag === '1' ? (
                    <Chip label='Đã xóa' color='error' size='small' variant='outlined' />
                  ) : (
                    <Chip
                      label={row.status ? 'Đang kinh doanh' : 'Ngừng kinh doanh'}
                      color={row.status ? 'success' : 'default'}
                      size='small'
                      variant='outlined'
                    />
                  )}
                </TableCell>
                <TableCell>{formatCompactVN(row.created_at)}</TableCell>
                {/* <TableCell>{variantCountByWatchId[String(row.id)] || 0}</TableCell> */}
                <TableCell align='right'>
                  <Stack direction='row' spacing={1} justifyContent='flex-end' alignItems='center'>
                    <IconButton size='small' onClick={() => handleViewWatch(row)}>
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
                            status: w.status as any,
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
                    <Tooltip title={row.status ? 'Ngừng kinh doanh' : 'Mở lại kinh doanh'}>
                      <Switch
                        checked={Boolean(row.status)}
                        onChange={() => handleToggleStatus(row)}
                        size='small'
                        disabled={row.del_flag === '1'}
                        sx={{
                          '& .MuiSwitch-switchBase': {
                            color: '#bdbdbd',
                            '&.Mui-checked': {
                              color: 'success.main'
                            },
                            '&.Mui-checked + .MuiSwitch-track': {
                              backgroundColor: 'success.main'
                            }
                          },
                          '& .MuiSwitch-track': {
                            backgroundColor: '#bdbdbd'
                          }
                        }}
                      />
                    </Tooltip>
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
      <EditWatchDialog
        mode='create'
        open={openCreate}
        editForm={form}
        brands={brands}
        categories={categories}
        movementTypes={movementTypes}
        colors={colors}
        strapMaterials={strapMaterials}
        variantDraft={variantDraft}
        editUploadingThumb={thumbUploading}
        editUploadingSlider={sliderUploading}
        actionLoading={actionLoading}
        onClose={() => setOpenCreate(false)}
        onFormChange={setForm}
        onSave={handleCreate}
        formErrors={formErrors}
        onClearFieldError={clearFieldError}
        onFieldBlurValidate={validateFieldOnBlur}
        onUploadThumbnail={async (file: File) => {
          try {
            setThumbUploading(true)
            const res = await uploadImage(file)
            const url = (res as any)?.uploadedImage?.url as string | undefined
            if (url) setForm(p => ({ ...p, thumbnail: url }))
            else toast.error('Tải ảnh thất bại')
          } catch (err: any) {
            toast.error(err?.message || 'Tải ảnh thất bại')
          } finally {
            setThumbUploading(false)
          }
        }}
        onUploadSlider={async (files: File[]) => {
          try {
            setSliderUploading(true)
            const res = await uploadMultipleImages(files)
            const urls = ((res as any)?.uploadedImages || []).map((it: any) => it?.url).filter(Boolean)
            if (urls.length) {
              const existingUrls = (form.slider || '')
                .split(',')
                .map(s => s.trim())
                .filter(Boolean)
              const allUrls = [...existingUrls, ...urls]
              setForm(p => ({ ...p, slider: allUrls.join(', ') }))
            } else {
              toast.error('Tải ảnh thất bại')
            }
          } catch (err: any) {
            toast.error(err?.message || 'Tải ảnh thất bại')
          } finally {
            setSliderUploading(false)
          }
        }}
        onVariantDraftChange={setVariantDraft}
        onAddVariantDraft={handleAddVariantDraft}
        onRemoveVariantDraft={handleRemoveVariantDraft}
      />

      {/* Edit Variant dialog */}
      <Dialog open={openEditVariant} onClose={() => setOpenEditVariant(false)} fullWidth maxWidth='sm'>
        <DialogTitle>Chỉnh sửa biến thể</DialogTitle>
        <DialogContent>
          {variantEditing ? (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={4}>
                <Select
                  fullWidth
                  displayEmpty
                  value={(variantEditing as any).color_id || ''}
                  onChange={e => setVariantEditing((p: any) => ({ ...p, color_id: e.target.value }))}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 200
                      }
                    }
                  }}
                  renderValue={value => {
                    if (!value) return 'Chọn màu'

                    return colors.find(c => String(c.id) === String(value))?.name || value
                  }}
                >
                  <MenuItem value=''>Chọn màu</MenuItem>
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
                  value={(variantEditing as any).strap_material_id || ''}
                  onChange={e => setVariantEditing((p: any) => ({ ...p, strap_material_id: e.target.value }))}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 200
                      }
                    }
                  }}
                  renderValue={value => {
                    if (!value) return 'Chọn vật liệu dây'

                    return strapMaterials.find(s => String(s.id) === String(value))?.name || value
                  }}
                >
                  <MenuItem value=''>Chọn vật liệu dây</MenuItem>
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
                  color_id: Number(v.color_id),
                  strap_material_id: Number(v.strap_material_id),
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
                    setViewVariants(watchData.variants.filter((v: TWatchVariant) => v.del_flag !== '1'))
                  } else {
                    // Fallback: fetch variants separately
                    const vRes = await getWatchVariants()
                    const all = ((vRes as any)?.variants?.items || []) as TWatchVariant[]
                    setViewVariants(
                      all.filter(i => String(i.watch_id) === String(viewingWatch.id) && i.del_flag !== '1')
                    )
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

      <WatchDetailDialog
        open={openViewWatch}
        watch={viewingWatch}
        variants={viewVariants}
        colors={colors}
        strapMaterials={strapMaterials}
        onClose={() => setOpenViewWatch(false)}
        onAddVariant={handleAddVariantFromView}
        onEditVariant={handleOpenEditVariant}
        onDeleteVariant={handleDeleteVariantFromView}
      />

      {/* Edit Watch dialog */}
      <EditWatchDialog
        open={openEditWatch}
        editForm={editForm}
        brands={brands}
        categories={categories}
        movementTypes={movementTypes}
        editUploadingThumb={editUploadingThumb}
        editUploadingSlider={editUploadingSlider}
        actionLoading={actionLoading}
        onClose={() => setOpenEditWatch(false)}
        onFormChange={setEditForm}
        onSave={async () => {
          if (!selected) return
          try {
            setActionLoading(true)
            const { variants, ...rest } = editForm as any
            let releaseDate = rest.release_date || ''
            if (releaseDate && releaseDate.length < 14) {
              releaseDate = releaseDate.padEnd(14, '0')
            }
            const payload = {
              ...rest,
              release_date: releaseDate,
              brand_id: Number(rest.brand_id),
              category_id: Number(rest.category_id),
              movement_type_id: Number(rest.movement_type_id),
              status: Boolean(editForm.status)
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
        onUploadThumbnail={async (file: File) => {
          try {
            setEditUploadingThumb(true)
            const res = await uploadImage(file)
            const url = (res as any)?.uploadedImage?.url
            if (url) setEditForm(p => ({ ...p, thumbnail: url }))
          } finally {
            setEditUploadingThumb(false)
          }
        }}
        onUploadSlider={async (files: File[]) => {
          try {
            setEditUploadingSlider(true)
            const res = await uploadMultipleImages(files)
            const urls = ((res as any)?.uploadedImages || []).map((i: any) => i?.url).filter(Boolean)
            if (urls.length) {
              const existingUrls = (editForm.slider || '')
                .split(',')
                .map(s => s.trim())
                .filter(Boolean)
              const allUrls = [...existingUrls, ...urls]
              setEditForm(p => ({ ...p, slider: allUrls.join(', ') }))
            }
          } finally {
            setEditUploadingSlider(false)
          }
        }}
      />

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
                    renderValue={value => {
                      if (!value) return 'Vật liệu dây'

                      return strapMaterials.find(s => String(s.id) === String(value))?.name || value
                    }}
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
