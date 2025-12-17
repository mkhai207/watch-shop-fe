import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import VisibilityIcon from '@mui/icons-material/Visibility'
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
  Typography
} from '@mui/material'
import Avatar from '@mui/material/Avatar'
import Chip from '@mui/material/Chip'
import type { NextPage } from 'next'
import React, { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import AdvancedFilter, { FilterConfig, useAdvancedFilter, buildBackendQuery } from 'src/components/advanced-filter'
import CustomPagination from 'src/components/custom-pagination'
import Spinner from 'src/components/spinner'
import { PAGE_SIZE_OPTION } from 'src/configs/gridConfig'
import { useDebounce } from 'src/hooks/useDebounce'
import { deleteCategory, getCategories, getCategoryById } from 'src/services/category'
import type {
  GetCategoryResponse,
  GetCategorysResponse,
  TCategory
} from 'src/types/category/manage'
import { formatCompactVN } from 'src/utils/date'
import ManageSystemLayout from 'src/views/layouts/ManageSystemLayout'
import CreateCategoryDialog from './CreateCategoryDialog'

const CategoryPage: NextPage = () => {
  const [categories, setCategories] = useState<TCategory[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [actionLoading, setActionLoading] = useState<boolean>(false)
  const [totalCount, setTotalCount] = useState(0)
  const [openCreate, setOpenCreate] = useState<boolean>(false)
  const [openEdit, setOpenEdit] = useState<boolean>(false)
  const [selected, setSelected] = useState<TCategory | null>(null)

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
        { value: 'name:asc', label: 'Tên A-Z' },
        { value: 'name:desc', label: 'Tên Z-A' },
        { value: 'created_at:desc', label: 'Mới nhất' },
        { value: 'created_at:asc', label: 'Cũ nhất' }
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
      sort: 'created_at:desc'
    }
  })

  const handleFilterChange = useCallback(
    (newValues: typeof filterValues) => {
      setFilterValues(newValues)
    },
    [setFilterValues]
  )

  const handleFilterReset = useCallback(() => {
    resetFilter()
  }, [resetFilter])

  const debouncedSearchValue = useDebounce(filterValues.search || '', 300)

  const debouncedFilterValues = React.useMemo(
    () => ({
      search: debouncedSearchValue,
      filters: filterValues.filters,
      sort: filterValues.sort,
      dateRange: filterValues.dateRange
    }),
    [debouncedSearchValue, filterValues.filters, filterValues.sort, filterValues.dateRange]
  )

  const fetchData = useCallback(
    async (queryParams?: any) => {
      try {
        setLoading(true)

        const backendParams: Record<string, any> = {
          page: page.toString(),
          limit: pageSize.toString()
        }

        if (queryParams) {
          Object.entries(queryParams).forEach(([key, value]) => {
            if (value !== undefined && value !== '' && value !== null) {
              backendParams[key] = String(value)
            }
          })
        }

        const res = await getCategories(backendParams)
        const data = res as GetCategorysResponse
        let categoriesData = []
        let totalItems = 0

        if (data?.categorys?.items) {
          categoriesData = data.categorys.items
          totalItems = data.categorys.totalItems || 0
        } else if (Array.isArray(data?.categorys)) {
          const allCategories = data.categorys

          let filteredCategories = [...allCategories]

          if (queryParams?.name) {
            const searchLower = queryParams.name.toLowerCase().trim()
            filteredCategories = filteredCategories.filter((c: TCategory) => c.name.toLowerCase().includes(searchLower))
          }

          if (queryParams?.del_flag !== undefined) {
            filteredCategories = filteredCategories.filter((c: TCategory) => c.del_flag === queryParams.del_flag)
          }

          if (queryParams?.sort) {
            const [field, direction] = queryParams.sort.split(':')
            filteredCategories.sort((a: TCategory, b: TCategory) => {
              let aValue: any
              let bValue: any

              switch (field) {
                case 'name':
                  aValue = a.name?.toLowerCase() || ''
                  bValue = b.name?.toLowerCase() || ''
                  break
                case 'created_at':
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

          totalItems = filteredCategories.length
          const startIndex = (page - 1) * pageSize
          const endIndex = startIndex + pageSize
          categoriesData = filteredCategories.slice(startIndex, endIndex)
        } else if (data?.categorys) {
          categoriesData = [data.categorys]
          totalItems = 1
        } else {
          console.log('Unknown response format:', data)
        }

        setCategories(categoriesData)
        setTotalCount(totalItems)
      } catch (err: any) {
        toast.error(err?.message || 'Lỗi tải dữ liệu')
        setCategories([])
        setTotalCount(0)
      } finally {
        setLoading(false)
      }
    },
    [page, pageSize]
  )

  useEffect(() => {
    const queryParams = buildBackendQuery(debouncedFilterValues, filterConfig)
    fetchData(queryParams)
  }, [debouncedFilterValues, page, pageSize, filterConfig, fetchData])

  // Reset to page 1 when filter changes
  React.useEffect(() => {
    setPage(1)
  }, [filterValues])

  const paginatedData = categories

  const handleOnchangePagination = (newPage: number, newPageSize: number) => {
    if (newPageSize !== pageSize) {
      setPage(1)
      setPageSize(newPageSize)
    } else {
      setPage(newPage)
    }
  }

  const handleCreateSuccess = () => {
    const queryParams = buildBackendQuery(debouncedFilterValues, filterConfig)
    fetchData(queryParams)
  }

  const handleOpenEdit = async (category: TCategory) => {
    try {
      setActionLoading(true)
      const res = (await getCategoryById(category.id)) as GetCategoryResponse
      const full = res?.category || category
      setSelected(full)
      setOpenEdit(true)
    } catch (e) {
      toast.error('Không tải được chi tiết phân loại')
    } finally {
      setActionLoading(false)
    }
  }

  const handleEditSuccess = () => {
    const queryParams = buildBackendQuery(debouncedFilterValues, filterConfig)
    fetchData(queryParams)
    setSelected(null)
  }

  const handleDelete = (category: TCategory) => {
    setDeletingItem(category)
    setDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (!deletingItem) return

    try {
      setActionLoading(true)
      const res = await deleteCategory(deletingItem.id)
      if ((res as any)?.category || (res as any)?.success) {
        toast.success('Xóa phân loại thành công')

        // Refresh data with current filters
        const queryParams = buildBackendQuery(debouncedFilterValues, filterConfig)
        fetchData(queryParams)
      } else {
        throw new Error('Xóa thất bại')
      }
    } catch (err: any) {
      toast.error(err?.message || 'Xóa thất bại')
    } finally {
      setActionLoading(false)
      setDeleteDialog(false)
      setDeletingItem(null)
    }
  }

  const [deleteDialog, setDeleteDialog] = useState(false)
  const [deletingItem, setDeletingItem] = useState<TCategory | null>(null)

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
        <Button variant='contained' startIcon={<AddIcon />} onClick={() => setOpenCreate(true)}>
          Thêm phân loại
        </Button>
      </Stack>

      {/* <Grid container spacing={3} sx={{ mb: 3 }}>
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
      </Grid> */}

      {/* Advanced Filter */}
      <AdvancedFilter
        config={filterConfig}
        values={filterValues}
        onChange={handleFilterChange}
        onReset={handleFilterReset}
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
              <TableCell width={80}>Ảnh</TableCell>
              <TableCell>Tên phân loại</TableCell>
              <TableCell>Mô tả</TableCell>              <TableCell sx={{ whiteSpace: 'nowrap' }}>Ngày tạo</TableCell>              <TableCell width={120} align='right'>
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
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatCompactVN(category.created_at)}</TableCell>
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
                <TableCell colSpan={7} align='center'>
                  {loading ? 'Đang tải...' : 'Không có dữ liệu'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <Box sx={{ mt: 3, mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <CustomPagination
            onChangePagination={handleOnchangePagination}
            pageSizeOptions={PAGE_SIZE_OPTION}
            pageSize={pageSize}
            totalPages={Math.ceil(totalCount / pageSize)}
            page={page}
            rowLength={totalCount}
            isHideShowed={false}
          />
        </Box>
      </TableContainer>

      {/* Create Dialog */}
      <CreateCategoryDialog open={openCreate} onClose={() => setOpenCreate(false)} onSuccess={handleCreateSuccess} />

      {/* Edit Dialog */}
      <CreateCategoryDialog
        open={openEdit}
        onClose={() => {
          setOpenEdit(false)
          setSelected(null)
        }}
        onSuccess={handleEditSuccess}
        editData={selected}
      />

      {/* View Dialog */}
      <Dialog open={openView} onClose={() => setOpenView(false)} fullWidth maxWidth='sm'>
        <DialogTitle
          sx={{
            color: 'primary.main',
            fontWeight: 700,
            borderBottom: theme => `1px solid ${theme.palette.divider}`
          }}
        >
          Thông tin phân loại
        </DialogTitle>
        <DialogContent>
          {viewing ? (
            <Stack spacing={2} sx={{ mt: 2 }}>
              {/* Ảnh và Tên */}
              <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Stack direction='row' spacing={2} alignItems='center'>
                  <Avatar src={viewing.image_url || undefined} variant='rounded' sx={{ width: 72, height: 72 }} />
                  <Box>
                    <Typography variant='caption' color='text.secondary'>
                      Tên phân loại
                    </Typography>
                    <Typography variant='body2' sx={{ mt: 0.5, fontWeight: 500 }}>
                      {viewing.name}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>

              {/* Mô tả */}
              <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography variant='caption' color='text.secondary'>
                  Mô tả
                </Typography>
                <Typography variant='body2' sx={{ mt: 0.5 }}>
                  {viewing.description || '-'}
                </Typography>
              </Paper>

              {/* Thông tin hệ thống */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', height: '100%', width: '100%' }}>
                    <Typography variant='caption' color='text.secondary'>
                      Ngày tạo
                    </Typography>
                    <Typography variant='body2' sx={{ mt: 0.5 }}>
                      {formatCompactVN(viewing.created_at) || '-'}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', height: '100%', width: '100%' }}>
                    <Typography variant='caption' color='text.secondary'>
                      Ngày cập nhật
                    </Typography>
                    <Typography variant='body2' sx={{ mt: 0.5 }}>
                      {formatCompactVN(viewing.updated_at) || '-'}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenView(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onClose={() => !actionLoading && setDeleteDialog(false)} maxWidth='xs'>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa danh mục <strong>"{deletingItem?.name}"</strong> không?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)} disabled={actionLoading}>
            Hủy
          </Button>
          <Button onClick={confirmDelete} color='error' variant='contained' disabled={actionLoading}>
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

;(CategoryPage as any).getLayout = (page: React.ReactNode) => <ManageSystemLayout>{page}</ManageSystemLayout>

export default CategoryPage
