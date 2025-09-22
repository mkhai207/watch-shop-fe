import React, { useState, useEffect } from 'react'
import {
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  SelectChangeEvent,
  Rating,
  Chip,
  Typography,
  InputAdornment,
  IconButton
} from '@mui/material'
import { Search as SearchIcon } from '@mui/icons-material'
import { NextPage } from 'next'
import CustomPagination from 'src/components/custom-pagination'
import { PAGE_SIZE_OPTION } from 'src/configs/gridConfig'
import { reviewService } from 'src/services/review'
import { TReview } from 'src/types/review'
import PermissionGuard from 'src/components/auth/PermissionGuard'

// Types

type TProps = {}

const ManageReviewPage: NextPage<TProps> = () => {
  // State declarations
  const [reviews, setReviews] = useState<TReview[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [searchTerm, setSearchTerm] = useState('')
  const [productIdSearch, setProductIdSearch] = useState('')
  const [filterRating, setFilterRating] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTION[0])
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const itemsPerPage = pageSize

  useEffect(() => {
    setCurrentPage(1)
  }, [filterRating, productIdSearch])

  const handleOnchangePagination = (page: number, pageSize: number) => {
    setCurrentPage(page)
    setPageSize(pageSize)
  }

  const handleSearch = () => {
    setProductIdSearch(searchTerm.trim())
    setCurrentPage(1)
  }

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearch()
    }
  }

  useEffect(() => {
    const loadReviews = async () => {
      console.log('🔄 Loading reviews from API...')
      console.log('📊 Request params:', {
        page: currentPage,
        limit: itemsPerPage,
        product_id: productIdSearch || 'none',
        rating: filterRating || 'all'
      })

      setLoading(true)
      setError('')

      try {
        // Call API without authentication requirement
        const queryParams: any = {
          page: currentPage,
          limit: itemsPerPage
        }

        // Add optional parameters only if they have values
        if (productIdSearch && productIdSearch.trim()) {
          queryParams.product_id = productIdSearch.trim()
        }

        if (filterRating) {
          queryParams.rating = Number(filterRating)
        }

        console.log('Calling API with params:', queryParams)
        const response = await reviewService.getReviews(queryParams)

        console.log('API Response received:', {
          status: response.status,
          statusCode: response.statusCode,
          message: response.message,
          dataLength: response.data?.length || 0,
          meta: response.meta,
          hasData: !!response.data,
          hasMeta: !!response.meta
        })

        // Handle successful response
        if (response.status === 'success' || response.statusCode === 200) {
          const reviewData = response.data || []
          const metaData = response.meta || { totalItems: 0, totalPages: 1, currentPage: 1 }

          setReviews(reviewData)
          setTotalItems(metaData.totalItems || 0)
          setTotalPages(metaData.totalPages || 1)

          console.log('Reviews state updated:', {
            reviewsCount: reviewData.length,
            totalItems: metaData.totalItems || 0,
            totalPages: metaData.totalPages || 1,
            currentPage: metaData.currentPage || currentPage
          })
        } else {
          // Handle API error response
          console.warn(' API returned error:', response.message)
          setError(response.message || 'API returned an error')
          setReviews([])
          setTotalItems(0)
          setTotalPages(0)
        }
      } catch (err: any) {
        console.error('API call failed:', {
          message: err.message,
          status: err.status,
          response: err.response?.data
        })

        setError(`Lỗi kết nối API: ${err.message || 'Unknown error'}`)
        setReviews([])
        setTotalItems(0)
        setTotalPages(0)
      } finally {
        setLoading(false)
        console.log(' Loading completed')
      }
    }

    loadReviews()
  }, [currentPage, filterRating, itemsPerPage, productIdSearch])

  // Debug render
  useEffect(() => {
    console.log('Render debug - Loading:', loading, 'Reviews count:', reviews.length, 'Error:', error)
  }, [loading, reviews.length, error])

  // Handlers
  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xoá đánh giá này?')) {
      return
    }

    setDeletingId(id)
    try {
      console.log('Deleting review with id:', id)
      await reviewService.deleteReview(id)
      console.log('Review deleted successfully')

      // Refresh the reviews list after successful deletion
      const queryParams: any = {
        page: currentPage,
        limit: itemsPerPage
      }

      if (productIdSearch && productIdSearch.trim()) {
        queryParams.product_id = productIdSearch.trim()
      }

      if (filterRating) {
        queryParams.rating = Number(filterRating)
      }

      const response = await reviewService.getReviews(queryParams)

      // Handle refresh response
      if (response.status === 'success' || response.statusCode === 200) {
        const reviewData = response.data || []
        const metaData = response.meta || { totalItems: 0, totalPages: 1, currentPage: 1 }

        setReviews(reviewData)
        setTotalItems(metaData.totalItems || 0)
        setTotalPages(metaData.totalPages || 1)

        console.log(' Reviews refreshed after delete:', {
          remainingReviews: reviewData.length,
          totalItems: metaData.totalItems || 0
        })
      }

      // Show success message
      alert('Xóa đánh giá thành công!')
    } catch (error: any) {
      console.error('Failed to delete review:', error)

      // Handle specific error cases
      if (error.response?.status === 401) {
        alert('Lỗi xác thực: Vui lòng đăng nhập lại với quyền admin')
      } else if (error.response?.status === 403) {
        alert('Lỗi quyền truy cập: Bạn không có quyền xóa đánh giá này')
      } else if (error.response?.status === 404) {
        alert('Lỗi: Không tìm thấy đánh giá cần xóa')
      } else {
        alert('Lỗi khi xóa đánh giá: ' + (error.message || 'Unknown error'))
      }
    } finally {
      setDeletingId(null)
    }
  }

  // Filtering and pagination
  const ratings = [1, 2, 3, 4, 5]

  // Styles
  const ellipsisStyle: React.CSSProperties = {
    maxWidth: 150,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    display: 'inline-block',
    verticalAlign: 'middle'
  }

  const formatDate = (dateString: string) => {
    console.log('📅 Formatting date:', dateString)

    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        minHeight: '100vh',
        maxWidth: '100vw',
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        overflowX: 'hidden'
      }}
    >
      <Typography variant='h5' fontWeight='bold' mb={3}>
        Quản lý đánh giá
      </Typography>

      {error && (
        <Box
          sx={{
            mb: 2,
            p: 2,
            borderRadius: 1,
            backgroundColor: '#FDE4D5',
            border: '1px solid #EA5455',
            color: '#EA5455',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <Typography variant='body2' sx={{ fontWeight: 500 }}>
            {error}
          </Typography>
        </Box>
      )}

      <Box sx={{ display: 'flex', mb: 3, gap: 2, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
          <TextField
            size='small'
            sx={{ width: 200, minWidth: 150 }}
            placeholder='Tìm kiếm theo Product ID'
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setSearchTerm(e.target.value)
            }}
            onKeyPress={handleKeyPress}
            InputProps={{
              endAdornment: (
                <InputAdornment position='end'>
                  <IconButton aria-label='search' onClick={handleSearch} edge='end' size='small'>
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </Box>
        <Box>
          <label style={{ marginRight: '0.5rem' }}>Đánh giá:</label>
          <Select
            size='small'
            sx={{ width: 120, minWidth: 100 }}
            value={filterRating}
            onChange={(e: SelectChangeEvent) => {
              setFilterRating(e.target.value)
            }}
          >
            <MenuItem value=''>Tất cả</MenuItem>
            {ratings.map(rating => (
              <MenuItem key={rating} value={rating}>
                {rating} sao
              </MenuItem>
            ))}
          </Select>
        </Box>
      </Box>

      {loading ? (
        <Box display='flex' justifyContent='center' alignItems='center' minHeight='200px'>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer
            component={Paper}
            sx={{
              width: '100%',
              overflowX: 'auto',
              maxWidth: '100%'
            }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  {[
                    'ID',
                    'Đánh giá',
                    'Nội dung',
                    'Hình ảnh',
                    'Ngày tạo',
                    'Người tạo',
                    'Ngày cập nhật',
                    'Người cập nhật',
                    'Order ID',
                    'Product ID',
                    'Hành động'
                  ].map(header => (
                    <TableCell
                      key={header}
                      sx={{
                        textAlign: 'center',
                        fontWeight: 'bold',
                        whiteSpace: 'nowrap',
                        padding: '8px'
                      }}
                    >
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {reviews.length > 0 ? (
                  reviews.map((review: TReview) => (
                    <TableRow key={review.id}>
                      <TableCell sx={{ textAlign: 'center' }}>{review.id}</TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Tooltip title={`${review.rating} sao`}>
                          <Rating value={review.rating} readOnly size='small' />
                        </Tooltip>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Tooltip title={review.comment}>
                          <span style={{ ...ellipsisStyle, cursor: 'pointer' }}>{review.comment}</span>
                        </Tooltip>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                          {review.images ? (
                            (() => {
                              const imageArray = review.images.split(',').filter(img => img.trim() !== '')

                              return imageArray.length > 0 ? (
                                <>
                                  {imageArray.slice(0, 3).map((image, index) => (
                                    <Tooltip key={index} title={`Hình ảnh ${index + 1}`}>
                                      <img
                                        src={image.trim()}
                                        alt={`Review image ${index + 1}`}
                                        width={30}
                                        height={30}
                                        style={{ objectFit: 'cover', borderRadius: 4, cursor: 'pointer' }}
                                      />
                                    </Tooltip>
                                  ))}
                                  {imageArray.length > 3 && (
                                    <Tooltip title={`Và ${imageArray.length - 3} hình khác`}>
                                      <Chip label={`+${imageArray.length - 3}`} size='small' />
                                    </Tooltip>
                                  )}
                                </>
                              ) : (
                                <span style={{ color: 'gray', fontSize: '0.8rem' }}>Không có</span>
                              )
                            })()
                          ) : (
                            <span style={{ color: 'gray', fontSize: '0.8rem' }}>Không có</span>
                          )}
                        </Box>
                      </TableCell>

                      <TableCell sx={{ textAlign: 'center' }}>{formatDate(review.created_at)}</TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Tooltip title={review.created_by}>
                          <span style={ellipsisStyle}>{review.created_by}</span>
                        </Tooltip>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>{formatDate(review.updated_at)}</TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Tooltip title={review.updated_by}>
                          <span style={ellipsisStyle}>{review.updated_by}</span>
                        </Tooltip>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>{review.order_id || review.user_id || 'N/A'}</TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>{review.product_id}</TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <PermissionGuard apiPath='/api/v0/reviews/delete-review' method='DELETE'>
                          <Button
                            variant='outlined'
                            color='error'
                            size='small'
                            onClick={() => handleDelete(review.id)}
                            disabled={deletingId === review.id}
                          >
                            {deletingId === review.id ? 'Đang xóa...' : 'Xóa'}
                          </Button>
                        </PermissionGuard>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={11} sx={{ textAlign: 'center' }}>
                      Không có đánh giá nào
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <Box sx={{ mt: 4, mb: 4 }}>
            <CustomPagination
              onChangePagination={handleOnchangePagination}
              pageSizeOptions={PAGE_SIZE_OPTION}
              pageSize={pageSize}
              totalPages={totalPages}
              page={currentPage}
              rowLength={totalItems}
              isHideShowed
            />
          </Box>
        </>
      )}
    </Box>
  )
}

export default ManageReviewPage
