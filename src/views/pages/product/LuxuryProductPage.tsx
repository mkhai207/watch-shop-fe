import {
  Box,
  Grid,
  Typography,
  useTheme,
  TextField,
  Slider,
  Select,
  MenuItem,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  Card,
  CardContent,
  CardMedia,
  Chip,
  IconButton
} from '@mui/material'
import Autocomplete from '@mui/material/Autocomplete'
import { FavoriteBorder, ShoppingCartOutlined, GridView, ViewList, Star } from '@mui/icons-material'
import { NextPage } from 'next'
import Link from 'next/link'
import { useMemo, useState, useEffect } from 'react'
import CardProduct from 'src/components/card-product/CardProduct'
import { TProduct } from 'src/types/product'

type TProps = {}

const LuxuryProductPage: NextPage<TProps> = () => {
  const theme = useTheme()

  const watches = useMemo(
    () => [
      {
        id: 1,
        name: 'Rolex Submariner',
        brand: 'Rolex',
        price: 250000000,
        originalPrice: 280000000,
        image: '/images/luxury-watch-hero.jpg',
        rating: 4.9,
        reviews: 128,
        colors: ['Đen', 'Xanh navy'],
        caseMaterial: 'Thép không gỉ',
        strapMaterial: 'Thép không gỉ',
        movement: 'Automatic',
        waterResistance: '300m',
        category: 'Luxury',
        gender: 'Nam',
        isNew: false,
        isBestseller: true
      },
      {
        id: 2,
        name: 'Omega Speedmaster',
        brand: 'Omega',
        price: 180000000,
        originalPrice: 200000000,
        image: '/images/luxury-watch-hero.jpg',
        rating: 4.8,
        reviews: 95,
        colors: ['Đen', 'Trắng'],
        caseMaterial: 'Thép không gỉ',
        strapMaterial: 'Da',
        movement: 'Manual',
        waterResistance: '50m',
        category: 'Sport',
        gender: 'Nam',
        isNew: true,
        isBestseller: false
      },
      {
        id: 3,
        name: 'Cartier Tank',
        brand: 'Cartier',
        price: 320000000,
        originalPrice: 350000000,
        image: '/images/luxury-watch-hero.jpg',
        rating: 4.7,
        reviews: 67,
        colors: ['Vàng', 'Bạc'],
        caseMaterial: 'Vàng 18K',
        strapMaterial: 'Da cá sấu',
        movement: 'Quartz',
        waterResistance: '30m',
        category: 'Luxury',
        gender: 'Nữ',
        isNew: false,
        isBestseller: true
      }
    ],
    []
  )

  const [brands, setBrands] = useState<string[]>(['Tất cả'])
  const [colors, setColors] = useState<string[]>(['Tất cả', 'Đen', 'Trắng', 'Bạc', 'Vàng', 'Xanh navy'])
  const [strapMaterials, setStrapMaterials] = useState<string[]>(['Tất cả'])
  const [movementTypes, setMovementTypes] = useState<string[]>(['Tất cả'])
  const [categories, setCategories] = useState<string[]>(['Tất cả'])
  const genders = ['Tất cả', 'Nam', 'Nữ']

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('newest')
  const [searchQuery, setSearchQuery] = useState('')
  const [priceRange, setPriceRange] = useState<number[]>([0, 400000000])
  const [selectedBrand, setSelectedBrand] = useState<string[]>(['Tất cả'])
  const [selectedColors, setSelectedColors] = useState<string[]>(['Tất cả'])
  const [selectedCaseMaterials, setSelectedCaseMaterials] = useState<string[]>([])
  const [selectedStrapMaterial, setSelectedStrapMaterial] = useState<string[]>(['Tất cả'])
  const [selectedMovementType, setSelectedMovementType] = useState<string[]>(['Tất cả'])
  const [selectedCategory, setSelectedCategory] = useState<string[]>(['Tất cả'])
  const [selectedGender, setSelectedGender] = useState('Tất cả')

  // Watches from API
  const [apiWatches, setApiWatches] = useState<any[]>([])
  const [totalCount, setTotalCount] = useState<number>(0)
  const [page, setPage] = useState<number>(1)
  const [apiLimit, setApiLimit] = useState<number>(10)

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)

  const filtered = useMemo(() => {
    const usingApi = apiWatches.length > 0
    const source = usingApi ? apiWatches : watches
    const result = source
      .filter(w => {
        const matchesText = usingApi
          ? true
          : w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            w.brand.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesPrice = w.price >= priceRange[0] && w.price <= priceRange[1]

        const matchesBrand = usingApi ? true : selectedBrand.includes('Tất cả') || selectedBrand.includes(w.brand)

        const matchesColors =
          selectedColors.length === 0 ||
          selectedColors.includes('Tất cả') ||
          selectedColors.some(c => w.colors.includes(c))

        const matchesCase = selectedCaseMaterials.length === 0 || selectedCaseMaterials.includes(w.caseMaterial)

        const matchesStrap = selectedStrapMaterial.includes('Tất cả') || selectedStrapMaterial.includes(w.strapMaterial)

        const matchesMovement = selectedMovementType.includes('Tất cả') || selectedMovementType.includes(w.movement)

        const matchesCategory = usingApi
          ? true
          : selectedCategory.includes('Tất cả') || selectedCategory.includes(w.category)

        const matchesGender = usingApi ? true : selectedGender === 'Tất cả' || w.gender === selectedGender

        return (
          matchesText &&
          matchesPrice &&
          matchesBrand &&
          matchesColors &&
          matchesCase &&
          matchesStrap &&
          matchesMovement &&
          matchesCategory &&
          matchesGender
        )
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'price-low':
            return a.price - b.price
          case 'price-high':
            return b.price - a.price
          case 'rating':
            return b.rating - a.rating
          case 'newest':
            return (b as any).isNew ? 1 : -1
          default:
            return a.name.localeCompare(b.name)
        }
      })

    return result
  }, [
    apiWatches,
    watches,
    searchQuery,
    priceRange,
    selectedBrand,
    selectedColors,
    selectedCaseMaterials,
    selectedStrapMaterial,
    selectedMovementType,
    selectedCategory,
    selectedGender,
    sortBy
  ])

  const clearAll = () => {
    setSearchQuery('')
    setPriceRange([0, 400000000])
    setSelectedBrand(['Tất cả'])
    setSelectedColors(['Tất cả'])
    setSelectedCaseMaterials([])
    setSelectedStrapMaterial(['Tất cả'])
    setSelectedMovementType(['Tất cả'])
    setSelectedCategory(['Tất cả'])
    setSelectedGender('Tất cả')
  }

  // Load brands and categories from API with limit=1000
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const token =
          typeof window !== 'undefined'
            ? localStorage.getItem('accessToken') || localStorage.getItem('token') || ''
            : ''
        const headers = token ? { Authorization: `Bearer ${token}` } : {}

        const [brandsRes, categoriesRes] = await Promise.all([
          fetch('http://localhost:8080/v1/brands?page=1&limit=1000', { headers }),
          fetch('http://localhost:8080/v1/categorys?page=1&limit=1000', { headers })
        ])

        if (brandsRes.ok) {
          const data = await brandsRes.json()
          const rows = data?.brands?.rows || []
          const names = rows.map((r: any) => r?.name).filter(Boolean)
          setBrands(['Tất cả', ...names])
        }

        if (categoriesRes.ok) {
          const data = await categoriesRes.json()
          const rows = data?.categorys?.rows || []
          const names = rows.map((r: any) => r?.name).filter(Boolean)
          setCategories(['Tất cả', ...names])
        }

        // load strap materials and movement types
        const [strapRes, moveRes, colorsRes] = await Promise.all([
          fetch('http://localhost:8080/v1/strap-materials?page=1&limit=1000', { headers }),
          fetch('http://localhost:8080/v1/movement-type?page=1&limit=1000', { headers }),
          fetch('http://localhost:8080/v1/colors?page=1&limit=1000', { headers })
        ])
        if (strapRes.ok) {
          const data = await strapRes.json()
          const rows = data?.strapMaterials?.rows || []
          setStrapMaterials(['Tất cả', ...rows.map((r: any) => r?.name).filter(Boolean)])
        }
        if (moveRes.ok) {
          const data = await moveRes.json()
          const rows = data?.movementTypes?.rows || []
          setMovementTypes(['Tất cả', ...rows.map((r: any) => r?.name).filter(Boolean)])
        }
        if (colorsRes.ok) {
          const data = await colorsRes.json()
          const rows = data?.colors?.rows || []
          const names = rows.map((r: any) => r?.name).filter(Boolean)
          if (names.length > 0) setColors(['Tất cả', ...names])
        }
      } catch (error) {
        // silent fail; keep defaults
        // eslint-disable-next-line no-console
        console.warn('Failed to load brands/categories', error)
      }
    }

    loadFilters()
  }, [])

  // Build API query params from filters/sort
  const buildQueryParams = () => {
    const params = new URLSearchParams()

    // Pagination: only send when user navigates pages (>1)
    if (page > 1) params.set('page', String(page))

    // Sorting
    const sortParts: string[] = []
    switch (sortBy) {
      case 'name':
        sortParts.push('name:ASC')
        break
      case 'price-low':
        sortParts.push('base_price:ASC')
        break
      case 'price-high':
        sortParts.push('base_price:DESC')
        break
      case 'rating':
        sortParts.push('rating:DESC')
        break
      case 'newest':
        sortParts.push('created_at:DESC')
        break
      default:
        break
    }
    // Only send sort when user chooses a non-default option
    if (!(sortBy === 'newest')) {
      const sortValue = sortParts.length ? sortParts.join(',') : ''
      if (sortValue) params.set('sort', sortValue)
    }

    // Root like filters
    if (searchQuery.trim()) {
      params.set('name', searchQuery.trim())
    }

    // Include filters by name
    const firstBrand = Array.isArray(selectedBrand) ? selectedBrand[0] : selectedBrand
    if (firstBrand && firstBrand !== 'Tất cả') {
      params.set('brand.name', firstBrand)
    }
    const firstCategory = Array.isArray(selectedCategory) ? selectedCategory[0] : selectedCategory
    if (firstCategory && firstCategory !== 'Tất cả') {
      params.set('category.name', firstCategory)
    }

    // Gender mapping: backend expects vi slug
    if (selectedGender && selectedGender !== 'Tất cả') {
      const genderMap: Record<string, string> = { Nam: 'nam', Nữ: 'nu', Unisex: 'unisex' }
      const g = genderMap[selectedGender] || selectedGender.toLowerCase()
      params.set('gender', g)
    }

    // Note: priceRange is handled client-side; backend does not expose base_price range in spec

    return params
  }

  // Load watches list from API with filters/sort/pagination
  useEffect(() => {
    const loadWatches = async () => {
      try {
        const token =
          typeof window !== 'undefined'
            ? localStorage.getItem('accessToken') || localStorage.getItem('token') || ''
            : ''
        const headers = token ? { Authorization: `Bearer ${token}` } : {}
        const params = buildQueryParams()
        const url = `http://localhost:8080/v1/watches?${params.toString()}`
        const res = await fetch(url, { headers })
        if (!res.ok) return
        const data = await res.json()
        const items = data?.watches?.items || []
        const mapped = items.map((r: any) => ({
          id: r.id,
          name: r.name || '—',
          brand: '—',
          price: Number(r.base_price) || 0,
          originalPrice: Number(r.base_price) || 0,
          image: r.thumbnail,
          rating: r.rating == null ? 0 : Number(r.rating),
          reviews: 0,
          colors: [] as string[],
          caseMaterial: r.case_material || '—',
          strapMaterial: '—',
          movement: '—',
          waterResistance: r.water_resistance || '—',
          category: '—',
          gender: r.gender === '1' ? 'Nam' : r.gender === '2' ? 'Nữ' : 'Unisex',
          isNew: false,
          isBestseller: false
        }))
        setApiWatches(mapped)
        setTotalCount(Number(data?.watches?.totalItems) || mapped.length)
        if (data?.watches?.limit) setApiLimit(Number(data.watches.limit))
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn('Failed to load watches', error)
      }
    }
    loadWatches()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, sortBy, searchQuery, selectedBrand, selectedCategory, selectedGender])

  // Reset to first page when filters/sort (except page) change
  useEffect(() => {
    setPage(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy, searchQuery, selectedBrand, selectedCategory, selectedGender])

  return (
    <Box
      sx={{
        mx: 'auto',
        backgroundColor: theme.palette.background.default,
        minHeight: '100vh',
        width: '90%'
      }}
    >
      <Box sx={{ py: 6, px: 2, mb: 4 }}>
        <Typography
          component='div'
          sx={{
            fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', sans-serif !important`,
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            mb: 1,
            fontSize: { xs: 28, sm: 36, md: 44 }
          }}
        >
          Bộ sưu tập đồng hồ
        </Typography>
        <Typography
          component='div'
          sx={{
            fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', sans-serif !important`,
            color: 'text.secondary',
            fontSize: { xs: 14, sm: 16, md: 18 }
          }}
        >
          Khám phá {filtered.length} sản phẩm đồng hồ cao cấp
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Box
            sx={{
              position: 'sticky',
              top: 16,
              border: '1px solid',
              borderColor: 'divider',
              p: 2,
              borderRadius: 2,
              bgcolor: 'background.paper'
            }}
          >
            <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
              <Typography fontWeight={600}>Bộ lọc</Typography>
            </Box>

            <Box mb={3}>
              <Typography variant='body2' mb={1}>
                Tìm kiếm
              </Typography>
              <TextField
                fullWidth
                size='small'
                placeholder='Tìm theo tên hoặc thương hiệu...'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </Box>

            <Box mb={3}>
              <Typography variant='body2' mb={1}>
                Khoảng giá: {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
              </Typography>
              <Slider
                value={priceRange}
                onChange={(_, v) => setPriceRange(v as number[])}
                min={0}
                max={400000000}
                step={1000000}
              />
            </Box>

            <Box mb={3}>
              <Typography variant='body2' mb={1}>
                Thương hiệu
              </Typography>
              <Autocomplete
                multiple
                options={brands}
                value={Array.isArray(selectedBrand) ? selectedBrand : [selectedBrand]}
                onChange={(_, value) => {
                  const raw = (value as string[]) || []
                  const nonEmpty = raw.filter(Boolean)
                  // If 'Tất cả' is selected alongside others, drop 'Tất cả'
                  const withoutAll =
                    nonEmpty.includes('Tất cả') && nonEmpty.length > 1 ? nonEmpty.filter(v => v !== 'Tất cả') : nonEmpty
                  // If empty after changes, default back to 'Tất cả'
                  const next = withoutAll.length === 0 ? ['Tất cả'] : withoutAll
                  setSelectedBrand(next as any)
                }}
                renderInput={params => <TextField {...params} placeholder='Chọn thương hiệu' size='small' />}
                ListboxProps={{ style: { maxHeight: 280 } }}
                clearOnEscape
              />
            </Box>

            <Box mb={3}>
              <Typography variant='body2' mb={1}>
                Danh mục
              </Typography>
              <Autocomplete
                multiple
                options={categories}
                value={Array.isArray(selectedCategory) ? selectedCategory : [selectedCategory]}
                onChange={(_, value) => setSelectedCategory(value.length === 0 ? 'Tất cả' : (value as any))}
                renderInput={params => <TextField {...params} placeholder='Chọn danh mục' size='small' />}
                ListboxProps={{ style: { maxHeight: 280 } }}
                clearOnEscape
              />
            </Box>

            <Box mb={2}>
              <Typography variant='body2' mb={1}>
                Giới tính
              </Typography>
              <Select
                fullWidth
                size='small'
                value={selectedGender}
                onChange={e => setSelectedGender(e.target.value)}
                MenuProps={{ disableScrollLock: true }}
              >
                {genders.map(g => (
                  <MenuItem key={g} value={g}>
                    {g}
                  </MenuItem>
                ))}
              </Select>
            </Box>

            <Box mb={2}>
              <Typography variant='body2' mb={1}>
                Màu sắc
              </Typography>
              <Autocomplete
                multiple
                options={colors}
                value={selectedColors}
                onChange={(_, value) => setSelectedColors(value.length === 0 ? ['Tất cả'] : value)}
                renderInput={params => <TextField {...params} placeholder='Chọn màu' size='small' />}
                ListboxProps={{ style: { maxHeight: 280 } }}
                disableCloseOnSelect
              />
            </Box>

            {/* Bỏ Vật liệu vỏ */}

            <Box mb={2}>
              <Typography variant='body2' mb={1}>
                Vật liệu dây
              </Typography>
              <Autocomplete
                multiple
                options={strapMaterials}
                value={selectedStrapMaterial}
                onChange={(_, value) =>
                  setSelectedStrapMaterial((value as string[]).length === 0 ? ['Tất cả'] : (value as string[]))
                }
                renderInput={params => <TextField {...params} placeholder='Chọn vật liệu dây' size='small' />}
                ListboxProps={{ style: { maxHeight: 280 } }}
                disableClearable={false}
                clearOnEscape
              />
            </Box>

            <Box mb={2}>
              <Typography variant='body2' mb={1}>
                Loại máy
              </Typography>
              <Autocomplete
                multiple
                options={movementTypes}
                value={selectedMovementType}
                onChange={(_, value) =>
                  setSelectedMovementType((value as string[]).length === 0 ? ['Tất cả'] : (value as string[]))
                }
                renderInput={params => <TextField {...params} placeholder='Chọn loại máy' size='small' />}
                ListboxProps={{ style: { maxHeight: 280 } }}
                disableClearable={false}
                clearOnEscape
              />
            </Box>

            <Button variant='outlined' fullWidth onClick={clearAll}>
              Xóa tất cả bộ lọc
            </Button>
          </Box>
        </Grid>

        <Grid item xs={12} md={9}>
          <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
            <ToggleButtonGroup
              size='small'
              color='primary'
              value={viewMode}
              exclusive
              onChange={(_, v) => v && setViewMode(v)}
            >
              <ToggleButton value='grid'>
                <GridView fontSize='small' />
              </ToggleButton>
              <ToggleButton value='list'>
                <ViewList fontSize='small' />
              </ToggleButton>
            </ToggleButtonGroup>

            <Box display='flex' alignItems='center' gap={1}>
              <Typography variant='body2' color='text.secondary'>
                Sắp xếp:
              </Typography>
              <Select
                size='small'
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                sx={{ minWidth: 180 }}
                MenuProps={{ disableScrollLock: true }}
              >
                <MenuItem value='name'>Tên A-Z</MenuItem>
                <MenuItem value='price-low'>Giá thấp đến cao</MenuItem>
                <MenuItem value='price-high'>Giá cao đến thấp</MenuItem>
                <MenuItem value='rating'>Đánh giá cao nhất</MenuItem>
                <MenuItem value='newest'>Mới nhất</MenuItem>
              </Select>
            </Box>
          </Box>

          {viewMode === 'grid' ? (
            <Grid container spacing={2}>
              {filtered.map(w => {
                const item: TProduct = {
                  id: String(w.id),
                  name: w.name,
                  price: Number(w.price) || 0,
                  thumbnail: w.image || '/placeholder-product.jpg',
                  sold: (w as any).sold || 0,
                  rating: Number(w.rating) || 0
                } as any
                return (
                  <Grid key={w.id} item xs={12} sm={6} md={4}>
                    <CardProduct item={item} />
                  </Grid>
                )
              })}
            </Grid>
          ) : (
            <Grid container spacing={2}>
              {filtered.map(w => {
                const item: TProduct = {
                  id: String(w.id),
                  name: w.name,
                  price: Number(w.price) || 0,
                  thumbnail: w.image || '/placeholder-product.jpg',
                  sold: (w as any).sold || 0,
                  rating: Number(w.rating) || 0
                } as any
                return (
                  <Grid key={w.id} item xs={12}>
                    <CardProduct item={item} />
                  </Grid>
                )
              })}
            </Grid>
          )}

          {/* Pagination when data from API */}
          {totalCount > apiLimit && (
            <Box display='flex' justifyContent='center' mt={3}>
              <Button
                variant='outlined'
                onClick={() => setPage(p => Math.max(1, p - 1))}
                sx={{ mr: 1 }}
                disabled={page <= 1}
              >
                Trang trước
              </Button>
              <Typography sx={{ px: 2, lineHeight: '36px' }}>
                Trang {page} / {Math.ceil(totalCount / apiLimit)}
              </Typography>
              <Button
                variant='outlined'
                onClick={() => setPage(p => p + 1)}
                disabled={page >= Math.ceil(totalCount / apiLimit)}
              >
                Trang sau
              </Button>
            </Box>
          )}

          {filtered.length === 0 && (
            <Box textAlign='center' py={8}>
              <Typography variant='h3' mb={1}>
                ⌚
              </Typography>
              <Typography variant='h6' fontWeight={700} mb={1}>
                Không tìm thấy sản phẩm
              </Typography>
              <Typography color='text.secondary' mb={2}>
                Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm
              </Typography>
              <Button variant='contained' onClick={clearAll}>
                Xóa tất cả bộ lọc
              </Button>
            </Box>
          )}
        </Grid>
      </Grid>
    </Box>
  )
}

export default LuxuryProductPage
