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
import type { NextPage } from 'next'
import React, { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import AdvancedFilter, { FilterConfig, useAdvancedFilter, buildBackendQuery } from 'src/components/advanced-filter'
import CustomPagination from 'src/components/custom-pagination'
import Spinner from 'src/components/spinner'
import { PAGE_SIZE_OPTION } from 'src/configs/gridConfig'
import { useDebounce } from 'src/hooks/useDebounce'
import { deleteBrand, getBrandById, getBrands } from 'src/services/brand'
import type { GetBrandResponse, GetBrandsResponse, TBrand } from 'src/types/brand'
import { formatCompactVN } from 'src/utils/date'
import ManageSystemLayout from 'src/views/layouts/ManageSystemLayout'
import CreateBrandDialog from './CreateBrandDialog'

const BrandPage: NextPage = () => {
  const [brands, setBrands] = useState<TBrand[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [actionLoading, setActionLoading] = useState<boolean>(false)
  const [totalCount, setTotalCount] = useState(0)
  const [openCreate, setOpenCreate] = useState<boolean>(false)
  const [openEdit, setOpenEdit] = useState<boolean>(false)
  const [selected, setSelected] = useState<TBrand | null>(null)

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTION[0])

  const filterConfig: FilterConfig = React.useMemo(() => {
    return {
      searchFields: [{ key: 'name', label: 'Tên thương hiệu', type: 'string' }],
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

  // Fetch brands with pagination and filtering
  const fetchData = useCallback(
    async (queryParams?: any) => {
      try {
        setLoading(true)

        // Prepare query parameters for backend API
        const backendParams: Record<string, any> = {
          page: page.toString(),
          limit: pageSize.toString()
        }

        // Add filter parameters
        if (queryParams) {
          Object.entries(queryParams).forEach(([key, value]) => {
            if (value !== undefined && value !== '' && value !== null) {
              backendParams[key] = String(value)
            }
          })
        }

        const res = await getBrands(backendParams)
        const data = res as GetBrandsResponse
        let brandsData = []
        let totalItems = 0

        if (data?.brands?.items) {
          brandsData = data.brands.items
          totalItems = data.brands.totalItems || 0
        } else if (Array.isArray(data?.brands)) {
          // If backend doesn't support pagination yet, simulate it
          const allBrands = data.brands

          // Apply client-side filtering for now
          let filteredBrands = [...allBrands]

          if (queryParams?.name) {
            const searchLower = queryParams.name.toLowerCase().trim()
            filteredBrands = filteredBrands.filter((b: TBrand) => b.name.toLowerCase().includes(searchLower))
          }

          if (queryParams?.del_flag !== undefined) {
            filteredBrands = filteredBrands.filter((b: TBrand) => b.del_flag === queryParams.del_flag)
          }

          if (queryParams?.sort) {
            const [field, direction] = queryParams.sort.split(':')
            filteredBrands.sort((a: TBrand, b: TBrand) => {
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

          // Apply client-side pagination
          totalItems = filteredBrands.length
          const startIndex = (page - 1) * pageSize
          const endIndex = startIndex + pageSize
          brandsData = filteredBrands.slice(startIndex, endIndex)
        } else if (data?.brands) {
          brandsData = [data.brands]
          totalItems = 1
        } else {
          console.log('Unknown response format:', data)
        }

        setBrands(brandsData)
        setTotalCount(totalItems)
      } catch (err: any) {
        toast.error(err?.message || 'Lỗi tải dữ liệu')
        setBrands([])
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

  const paginatedData = brands

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

  const handleOpenEdit = async (brand: TBrand) => {
    try {
      setActionLoading(true)
      const res = (await getBrandById(brand.id)) as GetBrandResponse
      const full = res?.brand || brand
      setSelected(full)
      setOpenEdit(true)
    } catch (e) {
      toast.error('Không tải được chi tiết thương hiệu')
    } finally {
      setActionLoading(false)
    }
  }

  const handleEditSuccess = () => {
    const queryParams = buildBackendQuery(debouncedFilterValues, filterConfig)
    fetchData(queryParams)
    setSelected(null)
  }

  const handleDelete = (brand: TBrand) => {
    setDeletingItem(brand)
    setDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (!deletingItem) return

    try {
      setActionLoading(true)
      const res = await deleteBrand(deletingItem.id)
      if ((res as any)?.brand || (res as any)?.success) {
        toast.success('Xóa thương hiệu thành công')

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
  const [deletingItem, setDeletingItem] = useState<TBrand | null>(null)

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
        <Button variant='contained' startIcon={<AddIcon />} onClick={() => setOpenCreate(true)}>
          Thêm thương hiệu
        </Button>
      </Stack>

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
              <TableCell width={80}>Logo</TableCell>
              <TableCell>Tên thương hiệu</TableCell>
              <TableCell>Mô tả</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>Ngày tạo</TableCell>
              <TableCell width={120} align='right'>
                Thao tác
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align='center' sx={{ py: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                    Đang tải dữ liệu...
                  </Box>
                </TableCell>
              </TableRow>
            ) : paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align='center' sx={{ py: 4 }}>
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((brand, index) => (
                <TableRow key={brand.id} hover sx={{ opacity: brand.del_flag === '1' ? 0.6 : 1 }}>
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
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatCompactVN(brand.created_at)}</TableCell>
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
              ))
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
      <CreateBrandDialog open={openCreate} onClose={() => setOpenCreate(false)} onSuccess={handleCreateSuccess} />

      {/* Edit Dialog */}
      <CreateBrandDialog
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
          Thông tin thương hiệu
        </DialogTitle>
        <DialogContent>
          {viewing ? (
            <Stack spacing={2} sx={{ mt: 2 }}>
              {/* Logo và Tên */}
              <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Stack direction='row' spacing={2} alignItems='center'>
                  <Avatar src={viewing.logo_url || undefined} variant='rounded' sx={{ width: 72, height: 72 }} />
                  <Box>
                    <Typography variant='caption' color='text.secondary'>
                      Tên thương hiệu
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
            Bạn có chắc chắn muốn xóa thương hiệu <strong>"{deletingItem?.name}"</strong> không?
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

;(BrandPage as any).getLayout = (page: React.ReactNode) => <ManageSystemLayout>{page}</ManageSystemLayout>

export default BrandPage
