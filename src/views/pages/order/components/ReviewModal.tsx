import { Close as CloseIcon, Star as StarIcon, AddPhotoAlternate as AddPhotoIcon } from '@mui/icons-material'
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
import { createReviewV1 } from 'src/services/review'
import { useAuth } from 'src/hooks/useAuth'
import { useFileUpload } from 'src/hooks/useFileUpload'

interface ReviewModalProps {
  open: boolean
  onClose: () => void
  orderId: string
  productIds: string
  productNames: string
  onSuccess?: () => void
}

const MAX_IMAGES = 5

const ReviewModal = ({ open, onClose, orderId, productIds, productNames, onSuccess }: ReviewModalProps) => {
  const { user } = useAuth()
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const { uploadFile, isUploading: uploadLoading, error: uploadError, reset } = useFileUpload()

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
      const response = await createReviewV1({
        rating,
        comment: comment.trim(),
        image_url: imageUrls.join(',') || undefined,
        user_id: Number(user?.id),
        order_id: Number(orderId)
      })

      if (response?.review) {
        toast.success('Đánh giá thành công')
        if (onSuccess) onSuccess()
        handleClose()
      } else {
        toast.error(response?.message || 'Có lỗi xảy ra khi gửi đánh giá')
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
    setImageUrls([])
    reset()
    onClose()
  }

  const handleImageUpload = async (file: File) => {
    if (!file) return

    if (imageUrls.length >= MAX_IMAGES) {
      toast.error(`Chỉ được tải tối đa ${MAX_IMAGES} ảnh`)
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File quá lớn. Vui lòng chọn file nhỏ hơn 5MB')

      return
    }
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Chỉ chấp nhận file JPG, JPEG hoặc PNG')

      return
    }
    try {
      const res = await uploadFile(file)
      const url = (res as any)?.uploadedImage?.url || (res as any)?.url
      if (url) {
        setImageUrls(prev => [...prev, url])
        toast.success('Tải ảnh thành công')
      } else {
        toast.error('Upload ảnh thất bại')
      }
    } catch (e) {
      // handled via hook error
    }
  }

  const removeImage = (index: number) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='md' fullWidth>
      <DialogTitle>
        <Box display='flex' alignItems='center' justifyContent='space-between'>
          <Typography variant='h6' fontWeight='bold' color={'primary.main'}>
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
              label='Bình luận ( tối thiểu 10 kí tự ) *'
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
                Ảnh
              </Typography>

              <Grid container spacing={2}>
                {/* Display uploaded images */}
                {imageUrls.map((url, index) => (
                  <Grid item key={index}>
                    <Box
                      sx={{
                        position: 'relative',
                        width: 100,
                        height: 100,
                        borderRadius: 2,
                        overflow: 'hidden',
                        border: '2px solid',
                        borderColor: 'primary.main',
                        boxShadow: 2
                      }}
                    >
                      <img
                        src={url}
                        alt={`Review image ${index + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <IconButton
                        size='small'
                        onClick={() => removeImage(index)}
                        sx={{
                          position: 'absolute',
                          top: 2,
                          right: 2,
                          backgroundColor: 'rgba(0,0,0,0.6)',
                          color: 'white',
                          padding: '4px',
                          '&:hover': { backgroundColor: 'rgba(0,0,0,0.8)' }
                        }}
                      >
                        <CloseIcon fontSize='small' />
                      </IconButton>
                    </Box>
                  </Grid>
                ))}

                {/* Add photo box */}
                {imageUrls.length < MAX_IMAGES && (
                  <Grid item>
                    <WrapperFileUpload
                      uploadFunc={handleImageUpload}
                      objectAcceptFile={{
                        'image/jpeg': ['.jpg', '.jpeg'],
                        'image/png': ['.png']
                      }}
                    >
                      <Box
                        sx={{
                          width: 100,
                          height: 100,
                          borderRadius: 2,
                          border: '2px dashed',
                          borderColor: uploadLoading ? 'grey.400' : 'grey.300',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: uploadLoading ? 'not-allowed' : 'pointer',
                          backgroundColor: uploadLoading ? 'grey.100' : 'grey.50',
                          pointerEvents: uploadLoading ? 'none' : 'auto',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            borderColor: uploadLoading ? 'grey.400' : 'primary.main',
                            backgroundColor: uploadLoading ? 'grey.100' : 'primary.lighter',
                            transform: uploadLoading ? 'none' : 'scale(1.02)'
                          }
                        }}
                      >
                        {uploadLoading ? (
                          <Typography variant='caption' color='text.secondary'>
                            Đang tải...
                          </Typography>
                        ) : (
                          <>
                            <AddPhotoIcon sx={{ fontSize: 32, color: 'grey.400', mb: 0.5 }} />
                            <Typography variant='caption' color='text.secondary' textAlign='center'>
                              Thêm ảnh
                            </Typography>
                          </>
                        )}
                      </Box>
                    </WrapperFileUpload>
                  </Grid>
                )}

                {/* Counter */}
                <Grid item sx={{ display: 'flex', alignItems: 'center', pl: 1 }}>
                  <Typography variant='subtitle1' fontWeight='bold' sx={{ color: 'primary.main' }}>
                    {imageUrls.length}/{MAX_IMAGES}
                  </Typography>
                </Grid>
              </Grid>

              {/* Display upload error */}
              {uploadError && (
                <Typography variant='body2' color='error' sx={{ mt: 1 }}>
                  {uploadError}
                </Typography>
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
