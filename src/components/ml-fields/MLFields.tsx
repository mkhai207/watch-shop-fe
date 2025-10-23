import {
  Autocomplete,
  Box,
  Chip,
  Grid,
  MenuItem,
  Select,
  TextField,
  Typography
} from '@mui/material'
import React from 'react'

// Predefined options for ML fields
const PRICE_TIER_OPTIONS = [
  { value: 'budget', label: 'Budget' },
  { value: 'mid_range', label: 'Mid Range' },
  { value: 'premium', label: 'Premium' },
  { value: 'luxury', label: 'Luxury' }
]

const GENDER_TARGET_OPTIONS = [
  { value: 'M', label: 'Nam' },
  { value: 'F', label: 'Nữ' },
  { value: 'U', label: 'Unisex' }
]

const SIZE_CATEGORY_OPTIONS = [
  { value: 'small', label: 'Nhỏ (< 38mm)' },
  { value: 'medium', label: 'Trung bình (38-42mm)' },
  { value: 'large', label: 'Lớn (> 42mm)' }
]

const STYLE_TAG_OPTIONS = [
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
]

const MATERIAL_TAG_OPTIONS = [
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
]

const COLOR_TAG_OPTIONS = [
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
]

const MOVEMENT_TYPE_TAG_OPTIONS = [
  'mechanical',
  'automatic',
  'manual_wind',
  'quartz',
  'solar',
  'kinetic',
  'spring_drive',
  'tourbillon',
  'chronometer'
]

interface MLFieldsProps {
  values: {
    price_tier?: string
    gender_target?: string
    size_category?: string
    style_tags?: string[]
    material_tags?: string[]
    color_tags?: string[]
    movement_type_tags?: string[]
  }
  onChange: (field: string, value: any) => void
  disabled?: boolean
}

const MLFields: React.FC<MLFieldsProps> = ({ values, onChange, disabled = false }) => {
  const handleTagChange = (field: string, newValue: string[]) => {
    onChange(field, newValue)
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant='h6' sx={{ mb: 2, color: 'primary.main' }}>
        🎯 Thông tin ML (Machine Learning)
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
        Các thông tin này sẽ được sử dụng để cải thiện thuật toán gợi ý và tìm kiếm sản phẩm
      </Typography>

      <Grid container spacing={2}>
        {/* Price Tier */}
        <Grid item xs={12} md={4}>
          <Select
            fullWidth
            displayEmpty
            value={values.price_tier || ''}
            onChange={e => onChange('price_tier', e.target.value)}
            disabled={disabled}
          >
            <MenuItem value=''>Phân khúc giá</MenuItem>
            {PRICE_TIER_OPTIONS.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </Grid>

        {/* Gender Target */}
        <Grid item xs={12} md={4}>
          <Select
            fullWidth
            displayEmpty
            value={values.gender_target || ''}
            onChange={e => onChange('gender_target', e.target.value)}
            disabled={disabled}
          >
            <MenuItem value=''>Đối tượng giới tính</MenuItem>
            {GENDER_TARGET_OPTIONS.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </Grid>

        {/* Size Category */}
        <Grid item xs={12} md={4}>
          <Select
            fullWidth
            displayEmpty
            value={values.size_category || ''}
            onChange={e => onChange('size_category', e.target.value)}
            disabled={disabled}
          >
            <MenuItem value=''>Phân loại kích thước</MenuItem>
            {SIZE_CATEGORY_OPTIONS.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </Grid>

        {/* Style Tags */}
        <Grid item xs={12} md={6}>
          <Autocomplete
            multiple
            options={STYLE_TAG_OPTIONS}
            value={values.style_tags || []}
            onChange={(_, newValue) => handleTagChange('style_tags', newValue)}
            disabled={disabled}
            disableCloseOnSelect
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  variant='outlined'
                  label={option}
                  size='small'
                  {...getTagProps({ index })}
                  key={option}
                  sx={{
                    height: '24px',
                    fontSize: '0.75rem',
                    margin: '2px',
                    '& .MuiChip-deleteIcon': {
                      fontSize: '16px'
                    }
                  }}
                />
              ))
            }
            renderInput={params => (
              <TextField
                {...params}
                label='Thẻ phong cách'
                placeholder='Chọn thẻ phong cách...'
                size='small'
                sx={{
                  '& .MuiInputBase-root': {
                    minHeight: '40px',
                    padding: '4px 8px',
                    flexWrap: 'wrap',
                    alignItems: 'flex-start',
                    '& .MuiAutocomplete-input': {
                      padding: '0 !important',
                      minHeight: '32px'
                    }
                  }
                }}
              />
            )}
          />
        </Grid>

        {/* Material Tags */}
        <Grid item xs={12} md={6}>
          <Autocomplete
            multiple
            options={MATERIAL_TAG_OPTIONS}
            value={values.material_tags || []}
            onChange={(_, newValue) => handleTagChange('material_tags', newValue)}
            disabled={disabled}
            disableCloseOnSelect
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  variant='outlined'
                  label={option}
                  size='small'
                  {...getTagProps({ index })}
                  key={option}
                  sx={{
                    height: '24px',
                    fontSize: '0.75rem',
                    margin: '2px',
                    '& .MuiChip-deleteIcon': {
                      fontSize: '16px'
                    }
                  }}
                />
              ))
            }
            renderInput={params => (
              <TextField
                {...params}
                label='Thẻ vật liệu'
                placeholder='Chọn thẻ vật liệu...'
                size='small'
                sx={{
                  '& .MuiInputBase-root': {
                    minHeight: '40px',
                    padding: '4px 8px',
                    flexWrap: 'wrap',
                    alignItems: 'flex-start',
                    '& .MuiAutocomplete-input': {
                      padding: '0 !important',
                      minHeight: '32px'
                    }
                  }
                }}
              />
            )}
          />
        </Grid>

        {/* Color Tags */}
        <Grid item xs={12} md={6}>
          <Autocomplete
            multiple
            options={COLOR_TAG_OPTIONS}
            value={values.color_tags || []}
            onChange={(_, newValue) => handleTagChange('color_tags', newValue)}
            disabled={disabled}
            disableCloseOnSelect
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  variant='outlined'
                  label={option}
                  size='small'
                  {...getTagProps({ index })}
                  key={option}
                  sx={{
                    height: '24px',
                    fontSize: '0.75rem',
                    margin: '2px',
                    '& .MuiChip-deleteIcon': {
                      fontSize: '16px'
                    }
                  }}
                />
              ))
            }
            renderInput={params => (
              <TextField
                {...params}
                label='Thẻ màu sắc'
                placeholder='Chọn thẻ màu sắc...'
                size='small'
                sx={{
                  '& .MuiInputBase-root': {
                    minHeight: '40px',
                    padding: '4px 8px',
                    flexWrap: 'wrap',
                    alignItems: 'flex-start',
                    '& .MuiAutocomplete-input': {
                      padding: '0 !important',
                      minHeight: '32px'
                    }
                  }
                }}
              />
            )}
          />
        </Grid>

        {/* Movement Type Tags */}
        <Grid item xs={12} md={6}>
          <Autocomplete
            multiple
            options={MOVEMENT_TYPE_TAG_OPTIONS}
            value={values.movement_type_tags || []}
            onChange={(_, newValue) => handleTagChange('movement_type_tags', newValue)}
            disabled={disabled}
            disableCloseOnSelect
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  variant='outlined'
                  label={option}
                  size='small'
                  {...getTagProps({ index })}
                  key={option}
                  sx={{
                    height: '24px',
                    fontSize: '0.75rem',
                    margin: '2px',
                    '& .MuiChip-deleteIcon': {
                      fontSize: '16px'
                    }
                  }}
                />
              ))
            }
            renderInput={params => (
              <TextField
                {...params}
                label='Thẻ loại máy'
                placeholder='Chọn thẻ loại máy...'
                size='small'
                sx={{
                  '& .MuiInputBase-root': {
                    minHeight: '40px',
                    padding: '4px 8px',
                    flexWrap: 'wrap',
                    alignItems: 'flex-start',
                    '& .MuiAutocomplete-input': {
                      padding: '0 !important',
                      minHeight: '32px'
                    }
                  }
                }}
              />
            )}
          />
        </Grid>
      </Grid>

      {/* Preview Tags */}
      {((values.style_tags && values.style_tags.length > 0) ||
        (values.material_tags && values.material_tags.length > 0) ||
        (values.color_tags && values.color_tags.length > 0) ||
        (values.movement_type_tags && values.movement_type_tags.length > 0)) && (
        <Box sx={{ mt: 2 }}>
          <Typography variant='subtitle2' sx={{ mb: 1 }}>
            Xem trước thẻ:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {values.style_tags?.map(tag => <Chip key={`style-${tag}`} label={tag} color='primary' size='small' />)}
            {values.material_tags?.map(tag => (
              <Chip key={`material-${tag}`} label={tag} color='secondary' size='small' />
            ))}
            {values.color_tags?.map(tag => <Chip key={`color-${tag}`} label={tag} color='success' size='small' />)}
            {values.movement_type_tags?.map(tag => (
              <Chip key={`movement-${tag}`} label={tag} color='warning' size='small' />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  )
}

export default MLFields
