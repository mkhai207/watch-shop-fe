import { Add as AddIcon } from '@mui/icons-material'
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
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
import React, { useEffect, useState } from 'react'
import CustomPagination from 'src/components/custom-pagination'
import { PAGE_SIZE_OPTION } from 'src/configs/gridConfig'
import { deleteProduct, getAllProductsPublic, getDetailsProductPublic, updateProduct } from 'src/services/product'
import { TBrand, TCategory, TProduct } from 'src/types/product'
import qs from 'qs'
import AddProductModal from './components/add-product-modal'
import DeleteConfirmationModal from './components/delete-confirmation-modal'
import EditProductModal from './components/edit-product-modal'
import { getCategories } from 'src/services/category'
import { getBrands } from 'src/services/brand'

const ManageProductPage = () => {
  const error = ''
  const [addModal, setAddModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTION[0])
  const [page, setPage] = useState(1)
  const [editModal, setEditModal] = useState(false)
  const [editProduct, setEditProduct] = useState<TProduct | null>(null)
  const [editVariants, setEditVariants] = useState<any[]>([])
  const [deleteModal, setDeleteModal] = useState(false)
  const [productToDelete, setProductToDelete] = useState<TProduct | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [productsPublic, setProductsPublic] = useState<{
    data: TProduct[]
    total: number
    totalPages: number
    currentPage: number
  }>({
    data: [],
    total: 0,
    totalPages: 0,
    currentPage: 1
  })
  const [searchBy, setSearchBy] = useState('')
  const [filters, setFilters] = useState<{
    brand_id: number
    category_id: number
  }>({ brand_id: 0, category_id: 0 })

  const [categories, setCategories] = useState<TCategory[]>([])
  const [brands, setBrands] = useState<TBrand[]>([])

  const [editLoading, setEditLoading] = useState(false)

  const handleEdit = async (product: TProduct) => {
    try {
      setEditLoading(true)
      setEditProduct(product)

      // Call API để lấy thông tin chi tiết sản phẩm trước khi hiển thị modal
      const response = await getDetailsProductPublic(product.id)
      if (response.status === 'success') {
        const detail = response.data
        setEditProduct({
          ...product,
          name: detail.name,
          description: detail.description,
          price: detail.price,
          gender: detail.gender,
          sold: detail.sold,
          status: detail.status,
          thumbnail: detail.thumbnail,
          slider: detail.slider ? detail.slider.split(',') : [],
          brand_id: detail.brand.id,
          category_id: detail.category.id
        })

        // Xử lý variants từ API response
        if (detail.variants && detail.variants.length > 0) {
          const variantMap = new Map<string, any>()

          detail.variants.forEach((variant: any) => {
            const colorKey = variant.color.hex_code
            if (!variantMap.has(colorKey)) {
              variantMap.set(colorKey, {
                hex_code: variant.color.hex_code,
                inventory: []
              })
            }

            const existingVariant = variantMap.get(colorKey)!
            existingVariant.inventory.push({
              size: variant.size.name,
              quantity: variant.stock
            })
          })

          setEditVariants(Array.from(variantMap.values()))
        } else {
          setEditVariants([
            {
              hex_code: '#000000',
              inventory: [
                { size: 'S', quantity: 0 },
                { size: 'M', quantity: 0 },
                { size: 'L', quantity: 0 }
              ]
            }
          ])
        }

        setEditModal(true)
      }
    } catch (error) {
      console.error('Error fetching product detail:', error)
    } finally {
      setEditLoading(false)
    }
  }

  const formatFiltersForAPI = () => {
    const params: Record<string, any> = {
      page: page || 1,
      limit: pageSize || 10,
      sort: 'created_at:desc'
    }

    if (searchBy?.trim()) {
      params.name = `like:${searchBy.trim()}`
    }

    if (filters.brand_id) {
      params.brand_id = filters.brand_id
    }

    if (filters.category_id) {
      params.category_id = filters.category_id
    }

    Object.keys(params).forEach(key => {
      if (
        params[key] === undefined ||
        params[key] === null ||
        (Array.isArray(params[key]) && params[key].length === 0)
      ) {
        delete params[key]
      }
    })

    return params
  }

  const handleGetListProducts = async () => {
    try {
      setLoading(true)

      const queryParams = formatFiltersForAPI()

      const response = await getAllProductsPublic({
        params: queryParams,
        paramsSerializer: params => qs.stringify(params, { arrayFormat: 'repeat', encode: false })
      })

      if (response.status === 'success') {
        setProductsPublic({
          data: response.data || [],
          total: response.meta?.totalItems || 0,
          totalPages: response.meta?.totalPages || 0,
          currentPage: response.meta?.currentPage || 1
        })
      }
    } catch (error: any) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const ellipsisStyle: React.CSSProperties = {
    maxWidth: 120,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    display: 'inline-block',
    verticalAlign: 'middle'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  const getGenderLabel = (gender: string) => {
    switch (gender) {
      case 'MALE':
        return 'Nam'
      case 'FEMALE':
        return 'Nữ'
      case 'UNISEX':
        return 'Unisex'
      default:
        return gender
    }
  }

  const fetchGetCategories = async () => {
    const response = await getCategories()
    if (response.status === 'success') {
      setCategories(response.data)
    }
  }

  const fetchGetBrands = async () => {
    const response = await getBrands()
    if (response.status === 'success') {
      setBrands(response.data)
    }
  }

  const handleOnchangePagination = (page: number, pageSize: number) => {
    setPage(page)
    setPageSize(pageSize)
  }

  const handleDeleteProduct = async (productId: string) => {
    try {
      setDeleteLoading(true)
      const response = await deleteProduct(productId)
      if (response.status === 'success') {
        handleGetListProducts()
        setDeleteModal(false)
        setProductToDelete(null)
      }
    } catch (error) {
      console.error('Error deleting product:', error)
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleShowDeleteModal = (product: TProduct) => {
    setProductToDelete(product)
    setDeleteModal(true)
  }

  // Function để tạo body dữ liệu cho API update product
  const createUpdateProductBody = (product: TProduct, variants: any[]) => {
    // Chuyển đổi variants từ format component sang format API
    const apiVariants = variants.flatMap(variant =>
      variant.inventory.map((item: any) => ({
        colorId: variant.hex_code, // Sử dụng hex_code làm colorId
        sizeId: item.size, // Sử dụng size name làm sizeId
        stock: item.quantity
      }))
    )

    return {
      name: product.name,
      description: product.description,
      price: product.price,
      gender: product.gender,
      sold: product.sold,
      status: product.status,
      thumbnail: product.thumbnail,
      slider: Array.isArray(product.slider) ? product.slider.join(',') : product.slider,
      brand_id: product.brand_id,
      category_id: product.category_id,
      variants: apiVariants
    }
  }

  // Function để handle save product
  const handleSaveProduct = async () => {
    if (!editProduct) return

    try {
      const updateBody = createUpdateProductBody(editProduct, editVariants)
      console.log('Update Product Body:', updateBody)

      // Gọi API update product
      const response = await updateProduct(editProduct.id, updateBody)
      if (response.status === 'success') {
        handleGetListProducts() // Refresh danh sách
        setEditModal(false)
        setEditProduct(null)
        setEditVariants([])
      }
    } catch (error) {
      console.error('Error updating product:', error)
    }
  }

  useEffect(() => {
    handleGetListProducts()
  }, [page, pageSize, searchBy, filters, addModal])

  useEffect(() => {
    fetchGetCategories()
  }, [])

  useEffect(() => {
    fetchGetBrands()
  }, [])

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        overflow: 'auto'
      }}
    >
      <Typography variant='h4' component='h1' gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
        Quản lý sản phẩm
      </Typography>

      <Box
        sx={{
          display: 'flex',
          mb: 3,
          gap: 2,
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          width: '100%'
        }}
      >
        <Button
          variant='contained'
          color='primary'
          onClick={() => {
            setAddModal(true)
          }}
          startIcon={<AddIcon />}
          sx={{ minWidth: 160 }}
        >
          Thêm sản phẩm
        </Button>

        <TextField
          size='small'
          sx={{ minWidth: 200, flex: 1, maxWidth: 300 }}
          placeholder='Nhập tên sản phẩm'
          value={searchBy}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setSearchBy(e.target.value)
          }}
          label='Tìm kiếm'
        />

        <FormControl size='small' sx={{ minWidth: 180 }}>
          <InputLabel>Danh mục</InputLabel>
          <Select
            value={filters.category_id.toString()}
            label='Danh mục'
            onChange={(e: SelectChangeEvent) => {
              setFilters({ ...filters, category_id: Number(e.target.value) })
            }}
          >
            <MenuItem value=''>Tất cả</MenuItem>
            {categories.map(category => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size='small' sx={{ minWidth: 180 }}>
          <InputLabel>Thương hiệu</InputLabel>
          <Select
            value={filters.brand_id.toString()}
            label='Thương hiệu'
            onChange={(e: SelectChangeEvent) => {
              setFilters({ ...filters, brand_id: Number(e.target.value) })
            }}
          >
            <MenuItem value=''>Tất cả</MenuItem>
            {brands.map(brand => (
              <MenuItem key={brand.id} value={brand.id}>
                {brand.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ color: 'error.main', textAlign: 'center', py: 4 }}>
          <Typography>{error}</Typography>
        </Box>
      ) : (
        <TableContainer
          component={Paper}
          sx={{
            width: '100%',
            overflowX: 'auto',
            boxShadow: 2,
            borderRadius: 2,
            '& .MuiTable-root': {
              width: '100%'
            }
          }}
        >
          <Table sx={{ width: '100%' }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                {[
                  'ID',
                  'Ảnh',
                  'Tên sản phẩm',
                  'Mô tả',
                  'Giá',
                  'Thương hiệu',
                  'Danh mục',
                  'Giới tính',
                  'Trạng thái',
                  'Đánh giá',
                  'Đã bán',
                  'Ngày tạo',
                  'Người tạo',
                  'Hành động'
                ].map(header => (
                  <TableCell
                    key={header}
                    sx={{
                      textAlign: 'center',
                      fontWeight: 'bold',
                      whiteSpace: 'nowrap',
                      padding: '12px 8px',
                      fontSize: '0.875rem',
                      minWidth: header === 'ID' ? 60 : header === 'Ảnh' ? 80 : header === 'Hành động' ? 120 : 'auto'
                    }}
                  >
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {productsPublic.data.map((product: TProduct) => (
                <TableRow
                  key={product.id}
                  sx={{
                    '&:hover': { backgroundColor: '#f9f9f9' },
                    '&:nth-of-type(odd)': { backgroundColor: '#fafafa' }
                  }}
                >
                  <TableCell sx={{ textAlign: 'center', fontSize: '0.875rem' }}>
                    <Chip label={product.id} size='small' />
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    <Tooltip title='Ảnh sản phẩm'>
                      <Box
                        component='img'
                        src={product.thumbnail}
                        alt={product.name}
                        sx={{
                          width: 50,
                          height: 50,
                          objectFit: 'cover',
                          borderRadius: 1,
                          cursor: 'pointer',
                          border: '1px solid #e0e0e0'
                        }}
                      />
                    </Tooltip>
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    <Tooltip title={product.name}>
                      <Typography
                        variant='body2'
                        sx={{
                          ...ellipsisStyle,
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          color: 'primary.main',
                          fontWeight: 500
                        }}
                      >
                        {product.name}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    <Tooltip title={product.description}>
                      <Typography variant='body2' sx={{ ...ellipsisStyle, cursor: 'pointer' }}>
                        {product.description}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    <Tooltip title='Giá bán'>
                      <Typography variant='body2' sx={{ cursor: 'pointer', fontWeight: 600, color: 'success.main' }}>
                        {formatPrice(product.price)}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    <Chip label={product.brand.name} size='small' color='primary' variant='outlined' />
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    <Chip label={product.category.name} size='small' color='secondary' variant='outlined' />
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    <Tooltip title={`Dành cho: ${getGenderLabel(product.gender)}`}>
                      <Typography variant='body2' sx={{ cursor: 'pointer' }}>
                        {getGenderLabel(product.gender)}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    <Chip
                      label={product.status ? 'Đang bán' : 'Ngừng bán'}
                      size='small'
                      color={product.status ? 'success' : 'default'}
                      variant={product.status ? 'filled' : 'outlined'}
                    />
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    <Tooltip title={`Đánh giá trung bình: ${product.rating}★`}>
                      <Typography variant='body2' sx={{ cursor: 'pointer' }}>
                        {product.rating} ★
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    <Tooltip title='Số lượng đã bán'>
                      <Typography variant='body2' sx={{ cursor: 'pointer', fontWeight: 600 }}>
                        {product.sold}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    <Typography variant='body2'>{formatDate(product.created_at)}</Typography>
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    <Tooltip title={product.created_by}>
                      <Typography variant='body2' sx={ellipsisStyle}>
                        {product.created_by}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                      <Button
                        variant='outlined'
                        color='warning'
                        size='small'
                        onClick={() => handleEdit(product)}
                        disabled={editLoading}
                        startIcon={editLoading ? <CircularProgress size={16} /> : undefined}
                      >
                        {editLoading ? 'Đang tải...' : 'Sửa'}
                      </Button>
                      <Button
                        variant='outlined'
                        color='error'
                        size='small'
                        onClick={() => {
                          handleShowDeleteModal(product)
                        }}
                      >
                        Xoá
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {/* Pagination */}
      <Box sx={{ mt: 4, mb: 4 }}>
        <CustomPagination
          onChangePagination={handleOnchangePagination}
          pageSizeOptions={PAGE_SIZE_OPTION}
          pageSize={pageSize}
          totalPages={productsPublic?.totalPages}
          page={page}
          rowLength={10}
          isHideShowed
        />
      </Box>

      <AddProductModal open={addModal} onClose={() => setAddModal(false)} />

      {/* Edit Product Modal */}
      <EditProductModal
        open={editModal}
        onClose={() => setEditModal(false)}
        product={editProduct}
        variants={editVariants}
        onProductChange={setEditProduct}
        onVariantsChange={setEditVariants}
        onSave={handleSaveProduct}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        open={deleteModal}
        onClose={() => {
          setDeleteModal(false)
          setProductToDelete(null)
        }}
        product={productToDelete}
        onConfirm={handleDeleteProduct}
        loading={deleteLoading}
      />
    </Box>
  )
}

export default ManageProductPage
