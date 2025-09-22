// src/views/pages/product/components/FilterAccordion.tsx
import React from 'react'
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  FormControlLabel,
  Checkbox,
  Rating,
  Stack,
  useTheme,
  Paper
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { useFilter } from 'src/contexts/FilterContext'

const FilterAccordion: React.FC = () => {
  const theme = useTheme()
  const { filters, updatePriceRanges, updateRatings } = useFilter()

  const handlePriceRangeChange = (priceRange: string) => {
    const updatedRanges = filters.priceRanges.includes(priceRange)
      ? filters.priceRanges.filter(r => r !== priceRange)
      : [...filters.priceRanges, priceRange]

    updatePriceRanges(updatedRanges)
  }

  const handleRatingChange = (rating: number) => {
    const updatedRatings = filters.ratings.includes(rating)
      ? filters.ratings.filter(r => r !== rating)
      : [...filters.ratings, rating]

    updateRatings(updatedRatings)
  }

  const priceOptions = [
    { label: 'Dưới 50,000đ', value: 'under-50k' },
    { label: '50,000đ - 200,000đ', value: '50k-200k' },
    { label: '200,000đ - 400,000đ', value: '200k-400k' },
    { label: '400,000đ - 1,000,000đ', value: '400k-1m' },
    { label: 'Trên 1,000,000đ', value: 'over-1m' }
  ]

  return (
    <Paper
      elevation={1}
      sx={{
        width: '100%',
        backgroundColor: theme.palette.background.paper,
        borderRadius: 2,
        overflow: 'hidden'
      }}
    >
      {/* Giá */}
      <Accordion defaultExpanded>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls='price-content'
          id='price-header'
          sx={{
            '& .MuiAccordionSummary-content': {
              margin: '12px 0'
            }
          }}
        >
          <Typography variant='h6' sx={{ fontWeight: 500 }}>
            Giá
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={1}>
            {priceOptions.map(priceOption => (
              <FormControlLabel
                key={priceOption.value}
                control={
                  <Checkbox
                    checked={filters.priceRanges.includes(priceOption.value)}
                    onChange={() => handlePriceRangeChange(priceOption.value)}
                    sx={{
                      color: theme.palette.success.main,
                      '&.Mui-checked': {
                        color: theme.palette.success.main
                      }
                    }}
                  />
                }
                label={<Typography variant='body2'>{priceOption.label}</Typography>}
              />
            ))}
          </Stack>
        </AccordionDetails>
      </Accordion>

      {/* Lọc theo rating */}
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls='rating-content'
          id='rating-header'
          sx={{
            '& .MuiAccordionSummary-content': {
              margin: '12px 0'
            }
          }}
        >
          <Typography variant='h6' sx={{ fontWeight: 500 }}>
            Lọc theo rating
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={1}>
            {[5, 4, 3, 2, 1].map(rating => (
              <FormControlLabel
                key={rating}
                control={
                  <Checkbox
                    checked={filters.ratings.includes(rating)}
                    onChange={() => handleRatingChange(rating)}
                    sx={{
                      color: theme.palette.warning.main,
                      '&.Mui-checked': {
                        color: theme.palette.warning.main
                      }
                    }}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Rating value={rating} readOnly size='small' sx={{ color: theme.palette.warning.main }} />
                    <Typography variant='body2'>{rating} sao trở lên</Typography>
                  </Box>
                }
              />
            ))}
          </Stack>
        </AccordionDetails>
      </Accordion>
    </Paper>
  )
}

export default FilterAccordion
