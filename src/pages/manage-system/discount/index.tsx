import React, { useCallback, useEffect, useState } from 'react'
import type { NextPage } from 'next'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import VisibilityIcon from '@mui/icons-material/Visibility'
import ManageSystemLayout from 'src/views/layouts/ManageSystemLayout'
import Spinner from 'src/components/spinner'
import DiscountDetailDialog from './DiscountDetailDialog'
import DiscountEditDialog from './DiscountEditDialog'
import toast from 'react-hot-toast'
import { formatCompactVN } from 'src/utils/date'
import AdvancedFilter, { FilterConfig, useAdvancedFilter, buildBackendQuery } from 'src/components/advanced-filter'
import CustomPagination from 'src/components/custom-pagination'
import { PAGE_SIZE_OPTION } from 'src/configs/gridConfig'
import { useDebounce } from 'src/hooks/useDebounce'
import {
  v1CreateDiscount,
  v1DeleteDiscount,
  v1GetDiscountById,
  v1GetDiscounts,
  v1UpdateDiscount,
  type TV1Discount
} from 'src/services/discount'

const DiscountPage: NextPage = () => {
  const dateStrToCompact = (dateStr?: string): string => {
    if (!dateStr) return ''
    const s = dateStr.replaceAll('-', '')
    if (s.length !== 8) return ''

    return `${s}000000`
  }
  const [items, setItems] = useState<TV1Discount[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [actionLoading, setActionLoading] = useState<boolean>(false)
  const [totalCount, setTotalCount] = useState(0)

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTION[0])

  const filterConfig: FilterConfig = React.useMemo(() => {
    return {
      searchFields: [
        { key: 'name', label: 'Tên khuyến mãi', type: 'string' },
        { key: 'code', label: 'Mã khuyến mãi', type: 'string' }
      ],
      filterFields: [
        {
          key: 'discount_type',
          label: 'Loại khuyến mãi',
          type: 'select',
          operator: 'eq',
          options: [
            { value: '0', label: 'Cố định' },
            { value: '1', label: 'Phần trăm' }
          ]
        },
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
        { value: 'code:asc', label: 'Mã A-Z' },
        { value: 'code:desc', label: 'Mã Z-A' },
        { value: 'created_at:desc', label: 'Mới nhất' },
        { value: 'created_at:asc', label: 'Cũ nhất' }
      ],
      dateRangeFields: [
        { key: 'created_at', label: 'Ngày tạo' },
        { key: 'updated_at', label: 'Ngày cập nhật' },
        { key: 'effective_date', label: 'Ngày bắt đầu' },
        { key: 'valid_until', label: 'Ngày kết thúc' }
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

  // Fetch discounts with pagination and filtering
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

        const response = await v1GetDiscounts(backendParams)
        let discountsData = []
        let totalItems = 0

        if (response?.discounts?.items) {
          discountsData = response.discounts.items
          totalItems = response.discounts.totalItems || 0
        } else if (Array.isArray(response?.discounts)) {
          // If backend doesn't support pagination yet, simulate it
          const allDiscounts = response.discounts

          // Apply client-side filtering for now
          let filteredDiscounts = [...allDiscounts]

          if (queryParams?.name) {
            const searchLower = queryParams.name.toLowerCase().trim()
            filteredDiscounts = filteredDiscounts.filter(
              (d: TV1Discount) =>
                (d.name && d.name.toLowerCase().includes(searchLower)) || d.code.toLowerCase().includes(searchLower)
            )
          }

          if (queryParams?.code) {
            const searchLower = queryParams.code.toLowerCase().trim()
            filteredDiscounts = filteredDiscounts.filter((d: TV1Discount) => d.code.toLowerCase().includes(searchLower))
          }

          if (queryParams?.discount_type !== undefined) {
            filteredDiscounts = filteredDiscounts.filter(
              (d: TV1Discount) => d.discount_type === queryParams.discount_type
            )
          }

          if (queryParams?.del_flag !== undefined) {
            filteredDiscounts = filteredDiscounts.filter((d: TV1Discount) => d.del_flag === queryParams.del_flag)
          }

          if (queryParams?.sort) {
            const [field, direction] = queryParams.sort.split(':')
            filteredDiscounts.sort((a: TV1Discount, b: TV1Discount) => {
              let aValue: any
              let bValue: any

              switch (field) {
                case 'name':
                  aValue = (a.name || '').toLowerCase()
                  bValue = (b.name || '').toLowerCase()
                  break
                case 'code':
                  aValue = a.code.toLowerCase()
                  bValue = b.code.toLowerCase()
                  break
                case 'created_at':
                  aValue = new Date(a.created_at || 0)
                  bValue = new Date(b.created_at || 0)
                  break
                default:
                  aValue = (a.name || '').toLowerCase()
                  bValue = (b.name || '').toLowerCase()
              }

              if (direction === 'desc') {
                return aValue < bValue ? 1 : -1
              }

              return aValue > bValue ? 1 : -1
            })
          }

          // Apply client-side pagination
          totalItems = filteredDiscounts.length
          const startIndex = (page - 1) * pageSize
          const endIndex = startIndex + pageSize
          discountsData = filteredDiscounts.slice(startIndex, endIndex)
        } else {
          console.log('Unknown response format:', response)
        }

        setItems(discountsData)
        setTotalCount(totalItems)
      } catch (err: any) {
        toast.error(err?.message || 'Lỗi tải dữ liệu')
        setItems([])
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

  const paginatedData = items

  const handleOnchangePagination = (newPage: number, newPageSize: number) => {
    if (newPageSize !== pageSize) {
      setPage(1)
      setPageSize(newPageSize)
    } else {
      setPage(newPage)
    }
  }

  const [openCreate, setOpenCreate] = useState<boolean>(false)

  const handleOpenCreate = () => {
    setOpenCreate(true)
  }

  const [openEdit, setOpenEdit] = useState<boolean>(false)
  const [selected, setSelected] = useState<any>(null)

  const handleOpenEdit = async (item: any) => {
    try {
      setActionLoading(true)
      const res = await v1GetDiscountById(item.id)
      const full = res?.discount || item
      setSelected(full)
      setOpenEdit(true)
    } catch (e) {
      toast.error('Không tải được chi tiết khuyến mãi')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = (item: any) => {
    setDeletingItem(item)
    setDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (!deletingItem) return

    try {
      setActionLoading(true)
      const res = await v1DeleteDiscount(deletingItem.id)
      if ((res as any)?.success) {
        toast.success('Xóa khuyến mãi thành công')

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
  const [deletingItem, setDeletingItem] = useState<any>(null)

  const [openView, setOpenView] = useState<boolean>(false)
  const [viewing, setViewing] = useState<any>(null)
  const handleOpenView = async (item: any) => {
    try {
      setActionLoading(true)
      const res = await v1GetDiscountById(item.id)
      setViewing(res?.discount || item)
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
          Quản lý khuyến mãi
        </Typography>
        <Button variant='contained' startIcon={<AddIcon />} onClick={handleOpenCreate}>
          Thêm khuyến mãi
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
              <TableCell width={160}>Mã</TableCell>
              <TableCell>Tên</TableCell>
              <TableCell>Mô tả</TableCell>
              <TableCell align='right' width={120}>
                Loại
              </TableCell>
              <TableCell align='right' width={140}>
                Giá trị
              </TableCell>
              <TableCell align='right' width={160}>
                ĐH tối thiểu
              </TableCell>
              <TableCell align='center' width={250}>
                Hiệu lực
              </TableCell>
              <TableCell align='center' width={140}>
                Ngày tạo
              </TableCell>
              <TableCell align='right' width={120}>
                Thao tác
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((item, index) => {
              const parseCompactDate = (compactDate: string) => {
                if (!compactDate || compactDate.length < 8) return null
                const year = compactDate.substring(0, 4)
                const month = compactDate.substring(4, 6)
                const day = compactDate.substring(6, 8)

                return new Date(`${year}-${month}-${day}`)
              }

              const validUntilDate = parseCompactDate((item as any).valid_until)
              const now = new Date()
              now.setHours(0, 0, 0, 0)
              const isExpired = validUntilDate ? validUntilDate < now : false

              return (
                <TableRow
                  key={item.id}
                  hover
                  sx={{
                    opacity: (item as any).del_flag === '1' ? 0.6 : 1,
                    bgcolor: isExpired ? theme => (theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100') : 'inherit'
                  }}
                >
                  <TableCell
                    sx={{
                      position: 'sticky',
                      left: 0,
                      zIndex: 1,
                      backgroundColor: isExpired
                        ? theme => (theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100')
                        : 'background.paper',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {(page - 1) * pageSize + index + 1}
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{item.code}</TableCell>
                  <TableCell sx={{ textDecoration: (item as any).del_flag === '1' ? 'line-through' : 'none' }}>
                    {item.name}
                  </TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>{item.description || '-'}</TableCell>
                  <TableCell align='right'>{item.discount_type === '1' ? 'Phần trăm' : 'Cố định'}</TableCell>
                  <TableCell align='right'>
                    {item.discount_type === '1'
                      ? `${item.discount_value}%`
                      : Number(item.discount_value).toLocaleString('vi-VN')}
                  </TableCell>
                  <TableCell align='right'>{item.min_order_value?.toLocaleString('vi-VN')}</TableCell>
                  <TableCell align='center'>
                    <Typography
                      variant='body2'
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: 230
                      }}
                    >
                      {formatCompactVN(item.effective_date)} - {formatCompactVN(item.valid_until)}
                    </Typography>
                  </TableCell>
                  <TableCell align='center'>
                    <Typography variant='body2' sx={{ whiteSpace: 'nowrap' }}>
                      {formatCompactVN(item.created_at)}
                    </Typography>
                  </TableCell>
                  <TableCell align='right'>
                    <Stack direction='row' spacing={1} justifyContent='flex-end'>
                      <IconButton size='small' onClick={() => handleOpenView(item)}>
                        <VisibilityIcon fontSize='small' />
                      </IconButton>
                      <IconButton
                        size='small'
                        disabled={(item as any).del_flag === '1'}
                        onClick={() => handleOpenEdit(item)}
                      >
                        <EditIcon fontSize='small' />
                      </IconButton>
                      <IconButton
                        size='small'
                        color='error'
                        disabled={(item as any).del_flag === '1'}
                        onClick={() => handleDelete(item)}
                      >
                        <DeleteIcon fontSize='small' />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              )
            })}
            {paginatedData.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} align='center'>
                  {loading ? 'Đang tải...' : 'Không có dữ liệu'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <Box sx={{ mt: 2, mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
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
      <DiscountEditDialog
        open={openCreate}
        discount={null}
        onClose={() => setOpenCreate(false)}
        onSubmit={async data => {
          try {
            const res = await v1CreateDiscount(data)
            if ((res as any)?.discount) {
              toast.success('Tạo khuyến mãi thành công')
              setOpenCreate(false)
              const queryParams = buildBackendQuery(debouncedFilterValues, filterConfig)
              fetchData(queryParams)
            } else {
              toast.error('Tạo khuyến mãi thất bại')
              throw new Error('Tạo khuyến mãi thất bại')
            }
          } catch (error: any) {
            const errorMsg = error?.response?.data?.message || error?.message || 'Lỗi không xác định'
            toast.error(`Tạo khuyến mãi thất bại: ${errorMsg}`)
            throw error
          }
        }}
      />

      {/* Edit Dialog */}
      <DiscountEditDialog
        open={openEdit}
        discount={selected}
        onClose={() => {
          setOpenEdit(false)
          setSelected(null)
        }}
        onSubmit={async data => {
          if (!selected) return
          if (!data.name.trim()) {
            toast.error('Tên khuyến mãi không được để trống')
            throw new Error('Tên không được để trống')
          }
          const res = await v1UpdateDiscount(selected.id, data)
          if ((res as any)?.success) {
            toast.success('Cập nhật khuyến mãi thành công')
            setOpenEdit(false)
            setSelected(null)
            const queryParams = buildBackendQuery(debouncedFilterValues, filterConfig)
            fetchData(queryParams)
          } else {
            throw new Error('Cập nhật thất bại')
          }
        }}
      />

      {/* View Dialog */}
      <DiscountDetailDialog open={openView} discount={viewing} onClose={() => setOpenView(false)} />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onClose={() => !actionLoading && setDeleteDialog(false)} maxWidth='xs'>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa khuyến mãi <strong>"{deletingItem?.name}"</strong> không?
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

;(DiscountPage as any).getLayout = (page: React.ReactNode) => <ManageSystemLayout>{page}</ManageSystemLayout>

export default DiscountPage
