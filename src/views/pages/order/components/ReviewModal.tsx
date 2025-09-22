import { Close as CloseIcon, Star as StarIcon } from '@mui/icons-material'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Rating,
  TextField,
  Typography
} from '@mui/material'
import { useState } from 'react'
import toast from 'react-hot-toast'
import IconifyIcon from 'src/components/Icon'
import WrapperFileUpload from 'src/components/wrapper-file-upload'
import { createReview } from 'src/services/review'
import { useFileUpload } from 'src/hooks/useFileUpload'

interface ReviewModalProps {
  open: boolean
  onClose: () => void
  orderId: string
  productIds: string
  productNames: string
}

const ReviewModal = ({ open, onClose, orderId, productIds, productNames }: ReviewModalProps) => {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const { uploadMultipleFiles, isUploading: uploadLoading, error: uploadError } = useFileUpload()

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Vui lòng chọn số sao')

      return
    }

    if (comment.trim().length < 10) {
      toast.error('Bình luận phải có ít nhất 10 ký tự')

      return
    }

    setLoading(true)
    try {
      let imageUrls = ''

      // Upload images if any
      if (selectedFiles.length > 0) {
        try {
          const uploadResponse = await uploadMultipleFiles(selectedFiles)
          if (uploadResponse.status === 'success') {
            imageUrls = uploadResponse.data.urls.join(',')
          } else {
            toast.error('Có lỗi xảy ra khi upload ảnh')

            return
          }
        } catch (uploadError) {
          toast.error('Có lỗi xảy ra khi upload ảnh')

          return
        }
      }

      const reviewData = {
        product_id: productIds,
        rating: rating,
        comment: comment.trim(),
        images: imageUrls,
        order_id: orderId
      }

      const response = await createReview(reviewData)

      if (response.status === 'success') {
        toast.success('Đánh giá thành công')
        handleClose()
      } else {
        toast.error(response.message || 'Có lỗi xảy ra khi gửi đánh giá')
      }
    } catch (error) {
      console.error('Error submitting review:', error)
      toast.error('Có lỗi xảy ra khi gửi đánh giá')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setRating(0)
    setComment('')
    setImages([])
    setSelectedFiles([])
    onClose()
  }

  const handleImageUpload = (file: File) => {
    if (file) {
      // Kiểm tra kích thước file (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File quá lớn. Vui lòng chọn file nhỏ hơn 5MB')

        return
      }

      // Kiểm tra định dạng file
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
      if (!allowedTypes.includes(file.type)) {
        toast.error('Chỉ chấp nhận file JPG, JPEG hoặc PNG')

        return
      }

      const url = URL.createObjectURL(file)
      setImages(prev => [...prev, url])
      setSelectedFiles(prev => [...prev, file])
      toast.success('Ảnh đã được thêm')
    }
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='md' fullWidth>
      <DialogTitle>
        <Box display='flex' alignItems='center' justifyContent='space-between'>
          <Typography variant='h6' fontWeight='bold'>
            Đánh giá đơn hàng
          </Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box mb={3}>
          <Typography variant='subtitle1' color='text.secondary' mb={1}>
            Đánh giá cho đơn hàng: #{orderId}
          </Typography>
          <Typography variant='body2' color='text.secondary' mb={1}>
            Sản phẩm trong đơn hàng:
          </Typography>
          <Box sx={{ pl: 2 }}>
            {productNames.split(', ').map((productName, index) => (
              <Typography key={index} variant='body2' color='text.secondary' sx={{ mb: 0.5 }}>
                • {productName.trim()}
              </Typography>
            ))}
          </Box>
        </Box>

        <Grid container spacing={3}>
          {/* Rating */}
          <Grid item xs={12}>
            <Box>
              <Typography variant='subtitle1' fontWeight='medium' mb={1}>
                Đánh giá của bạn *
              </Typography>
              <Rating
                value={rating}
                onChange={(event, newValue) => setRating(newValue || 0)}
                size='large'
                icon={<StarIcon sx={{ fontSize: 32 }} />}
                emptyIcon={<StarIcon sx={{ fontSize: 32, opacity: 0.3 }} />}
              />
              <Typography variant='body2' color='text.secondary' mt={1}>
                {rating > 0 ? `${rating} sao` : 'Vui lòng chọn số sao'}
              </Typography>
            </Box>
          </Grid>

          {/* Comment */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label='Bình luận *'
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder='Chia sẻ cảm nhận của bạn về các sản phẩm trong đơn hàng...'
              helperText={`${comment.length}/500 ký tự`}
              inputProps={{ maxLength: 500 }}
            />
          </Grid>

          {/* Image Upload */}
          <Grid item xs={12}>
            <Box>
              <Typography variant='subtitle1' fontWeight='medium' mb={1}>
                Thêm ảnh (tùy chọn)
              </Typography>
              <WrapperFileUpload
                uploadFunc={handleImageUpload}
                objectAcceptFile={{
                  'image/jpeg': ['.jpg', '.jpeg'],
                  'image/png': ['.png']
                }}
              >
                <Button variant='outlined' startIcon={<IconifyIcon icon='mdi:camera' />} sx={{ mb: 2 }}>
                  Thêm ảnh
                </Button>
              </WrapperFileUpload>

              {/* Display upload error */}
              {uploadError && (
                <Typography variant='body2' color='error' sx={{ mt: 1 }}>
                  {uploadError}
                </Typography>
              )}

              {/* Display uploaded images */}
              {images.length > 0 && (
                <Box mt={2}>
                  <Typography variant='body2' color='text.secondary' mb={1}>
                    Ảnh đã chọn ({images.length}/5):
                  </Typography>
                  <Grid container spacing={1}>
                    {images.map((image, index) => (
                      <Grid item key={index}>
                        <Box
                          sx={{
                            position: 'relative',
                            width: 80,
                            height: 80,
                            borderRadius: 1,
                            overflow: 'hidden',
                            border: '1px solid',
                            borderColor: 'grey.300'
                          }}
                        >
                          <img
                            src={image}
                            alt={`Review image ${index + 1}`}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                          <IconButton
                            size='small'
                            onClick={() => removeImage(index)}
                            sx={{
                              position: 'absolute',
                              top: 4,
                              right: 4,
                              backgroundColor: 'rgba(0,0,0,0.5)',
                              color: 'white',
                              '&:hover': {
                                backgroundColor: 'rgba(0,0,0,0.7)'
                              }
                            }}
                          >
                            <CloseIcon fontSize='small' />
                          </IconButton>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={handleClose} disabled={loading || uploadLoading}>
          Hủy
        </Button>
        <Button
          variant='contained'
          onClick={handleSubmit}
          disabled={loading || uploadLoading || rating === 0 || comment.trim().length < 10}
          startIcon={<StarIcon />}
        >
          {loading || uploadLoading ? 'Đang gửi...' : 'Gửi đánh giá'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ReviewModal
