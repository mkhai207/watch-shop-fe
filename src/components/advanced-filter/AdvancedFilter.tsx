import ClearIcon from '@mui/icons-material/Clear'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import FilterListIcon from '@mui/icons-material/FilterList'
import SearchIcon from '@mui/icons-material/Search'
import {
  Box,
  Button,
  Chip,
  Collapse,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
  Divider,
  Stack
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import React, { useState, useEffect } from 'react'
import { AdvancedFilterProps, FilterField } from './types'
import styles from './AdvancedFilter.module.scss'

const AdvancedFilter: React.FC<AdvancedFilterProps> = React.memo(
  ({ config, values, onChange, onReset, loading = false }) => {
    const [expanded, setExpanded] = useState(false)
    const [activeFilters, setActiveFilters] = useState<string[]>([])

    const [localSearchValue, setLocalSearchValue] = useState(values.search || '')

    useEffect(() => {
      setLocalSearchValue(values.search || '')
    }, [values.search])

    const handleSearchChange = React.useCallback((search: string) => {
      setLocalSearchValue(search)
    }, [])

    const handleSearchSubmit = React.useCallback(() => {
      const newValues = {
        search: localSearchValue,
        filters: values.filters,
        sort: values.sort,
        dateRange: values.dateRange
      }
      onChange(newValues)
    }, [onChange, localSearchValue, values.filters, values.sort, values.dateRange])

    const handleSearchKeyDown = React.useCallback(
      (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
          event.preventDefault()
          handleSearchSubmit()
        }
      },
      [handleSearchSubmit]
    )

    const handleFilterChange = React.useCallback(
      (key: string, value: any) => {
        const newFilters = { ...values.filters }

        if (value === '' || value === null || value === undefined) {
          delete newFilters[key]
          setActiveFilters(prev => prev.filter(f => f !== key))
        } else {
          newFilters[key] = value
          if (!activeFilters.includes(key)) {
            setActiveFilters(prev => [...prev, key])
          }
        }

        onChange({
          search: values.search,
          filters: newFilters,
          sort: values.sort,
          dateRange: values.dateRange
        })
      },
      [onChange, values.filters, values.search, values.sort, values.dateRange, activeFilters]
    )

    const handleSortChange = React.useCallback(
      (sort: string) => {
        onChange({
          search: values.search,
          filters: values.filters,
          sort,
          dateRange: values.dateRange
        })
      },
      [onChange, values.search, values.filters, values.dateRange]
    )

    const handleDateRangeChange = React.useCallback(
      (field: string, type: 'from' | 'to', value: string) => {
        const dateStr = value || undefined

        onChange({
          search: values.search,
          filters: values.filters,
          sort: values.sort,
          dateRange: {
            ...values.dateRange,
            field,
            [type]: dateStr
          }
        })
      },
      [onChange, values.search, values.filters, values.sort, values.dateRange]
    )

    const handleReset = React.useCallback(() => {
      setActiveFilters([])
      setLocalSearchValue('')
      if (onReset) {
        onReset()
      } else {
        onChange({
          search: '',
          filters: {},
          sort: config.sortOptions[0]?.value || '',
          dateRange: undefined
        })
      }
    }, [onReset, onChange, config.sortOptions])

    const renderFilterField = (field: FilterField) => {
      const currentValue = values.filters[field.key]

      const commonSx = {
        '& .MuiOutlinedInput-root': {
          borderRadius: 2,
          '&:hover': {
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: (theme: any) => alpha(theme.palette.primary.main, 0.4)
            }
          },
          '&.Mui-focused': {
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'primary.main'
            }
          }
        },
        '& .MuiInputLabel-root': {
          fontSize: '0.875rem',
          '&.Mui-focused': {
            color: 'primary.main'
          }
        }
      }

      const commonProps = {
        className: styles.filterField
      }

      switch (field.type) {
        case 'select':
          return (
            <FormControl fullWidth size='small' key={field.key} sx={commonSx} {...commonProps}>
              <InputLabel>{field.label}</InputLabel>
              <Select
                value={currentValue || ''}
                onChange={e => handleFilterChange(field.key, e.target.value)}
                label={field.label}
              >
                <MenuItem value=''>
                  <em style={{ color: '#999' }}>Tất cả</em>
                </MenuItem>
                {field.options?.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )

        case 'multiselect':
          return (
            <FormControl fullWidth size='small' key={field.key} sx={commonSx} {...commonProps}>
              <InputLabel>{field.label}</InputLabel>
              <Select
                multiple
                value={Array.isArray(currentValue) ? currentValue : []}
                onChange={e => handleFilterChange(field.key, e.target.value)}
                label={field.label}
                disableCloseOnSelect
                sx={{
                  height: '40px',
                  minHeight: '40px',
                  '& .MuiSelect-select': {
                    height: '40px !important',
                    minHeight: '40px !important',
                    display: 'flex',
                    alignItems: 'center'
                  }
                }}
                renderValue={selected => (
                  <Box
                    sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 0.5,
                      maxHeight: '32px',
                      overflow: 'hidden'
                    }}
                  >
                    {selected.map(value => (
                      <Chip
                        key={value}
                        label={value}
                        size='small'
                        sx={{
                          height: '20px',
                          fontSize: '0.7rem',
                          '& .MuiChip-deleteIcon': {
                            fontSize: '14px'
                          }
                        }}
                      />
                    ))}
                  </Box>
                )}
              >
                {field.options?.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )

        case 'number':
          return (
            <TextField
              key={field.key}
              label={field.label}
              type='number'
              size='small'
              fullWidth
              value={currentValue || ''}
              onChange={e => handleFilterChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              sx={commonSx}
              {...commonProps}
            />
          )

        case 'date':
          return (
            <TextField
              key={field.key}
              label={field.label}
              type='date'
              size='small'
              fullWidth
              value={currentValue || ''}
              onChange={e => handleFilterChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              InputLabelProps={{ shrink: true }}
              sx={commonSx}
              {...commonProps}
            />
          )

        case 'boolean':
          return (
            <FormControl fullWidth size='small' key={field.key} sx={commonSx} {...commonProps}>
              <InputLabel>{field.label}</InputLabel>
              <Select
                value={currentValue !== undefined ? String(currentValue) : ''}
                onChange={e => {
                  const val = e.target.value
                  handleFilterChange(field.key, val === '' ? undefined : val === 'true')
                }}
                label={field.label}
              >
                <MenuItem value=''>
                  <em style={{ color: '#999' }}>Tất cả</em>
                </MenuItem>
                <MenuItem value='true'>Có</MenuItem>
                <MenuItem value='false'>Không</MenuItem>
              </Select>
            </FormControl>
          )

        default:
          return (
            <TextField
              key={field.key}
              label={field.label}
              size='small'
              fullWidth
              value={currentValue || ''}
              onChange={e => handleFilterChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              sx={commonSx}
              {...commonProps}
            />
          )
      }
    }

    const getActiveFilterCount = () => {
      let count = 0
      if (values.search) count++
      count += Object.keys(values.filters).length
      if (values.dateRange?.from || values.dateRange?.to) count++

      return count
    }

    return (
      <Box className={styles.filterContainer}>
        <Paper
          elevation={0}
          className={styles.filterPaper}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 1,
            background: (theme: any) => theme.palette.background.paper,
            border: (theme: any) => `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              border: (theme: any) => `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
              boxShadow: (theme: any) => `0 2px 8px ${alpha(theme.palette.primary.main, 0.08)}`
            }
          }}
        >
          {/* Header Section */}
          <Stack direction='row' spacing={2} alignItems='stretch' sx={{ mb: expanded ? 3 : 0 }}>
            {/* Search Field */}
            <TextField
              placeholder='Tìm kiếm sản phẩm... (nhấn Enter để lọc)'
              value={localSearchValue}
              onChange={e => handleSearchChange(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              size='small'
              className={styles.searchField}
              sx={{
                flex: 1,
                maxWidth: 400,
                '& .MuiOutlinedInput-root': {
                  height: '42px',
                  borderRadius: 2,
                  backgroundColor: (theme: any) => alpha(theme.palette.grey[50], 0.5),
                  '&:hover': {
                    backgroundColor: (theme: any) => alpha(theme.palette.grey[50], 0.8)
                  },
                  '&.Mui-focused': {
                    backgroundColor: (theme: any) => theme.palette.background.paper
                  }
                }
              }}
              InputProps={{
                startAdornment: (
                  <SearchIcon
                    sx={{
                      mr: 1,
                      color: 'text.secondary',
                      fontSize: '1.1rem'
                    }}
                  />
                ),
                endAdornment: (
                  <IconButton
                    onClick={handleSearchSubmit}
                    disabled={loading}
                    size='small'
                    sx={{
                      color: 'primary.main',
                      '&:hover': {
                        backgroundColor: (theme: any) => alpha(theme.palette.primary.main, 0.08)
                      }
                    }}
                  >
                    <SearchIcon fontSize='small' />
                  </IconButton>
                )
              }}
              disabled={loading}
            />

            {/* Actions */}
            <Stack direction='row' spacing={1} alignItems='stretch'>
              {/* Sort Dropdown */}
              <FormControl
                size='small'
                sx={{
                  minWidth: 180,
                  '& .MuiOutlinedInput-root': {
                    height: '42px',
                    borderRadius: 2
                  }
                }}
              >
                <InputLabel sx={{ fontSize: '0.875rem' }}>Sắp xếp</InputLabel>
                <Select
                  value={values.sort || ''}
                  onChange={e => handleSortChange(e.target.value)}
                  label='Sắp xếp'
                  disabled={loading}
                >
                  {config.sortOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Filter Toggle Button */}
              <Button
                variant='outlined'
                startIcon={<FilterListIcon />}
                endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                onClick={() => setExpanded(!expanded)}
                disabled={loading}
                className={styles.filterButton}
                sx={{
                  height: '42px',
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 500,
                  px: 2,
                  minWidth: 'auto',
                  borderColor: (theme: any) => alpha(theme.palette.primary.main, 0.3),
                  color: 'primary.main',
                  '&:hover': {
                    borderColor: 'primary.main',
                    backgroundColor: (theme: any) => alpha(theme.palette.primary.main, 0.04)
                  }
                }}
              >
                Bộ lọc{' '}
                {getActiveFilterCount() > 0 && (
                  <Chip
                    label={getActiveFilterCount()}
                    size='small'
                    sx={{
                      ml: 1,
                      height: 20,
                      fontSize: '0.75rem',
                      backgroundColor: 'primary.main',
                      color: 'white'
                    }}
                  />
                )}
              </Button>

              {/* Reset Button */}
              {getActiveFilterCount() > 0 && (
                <IconButton
                  onClick={handleReset}
                  disabled={loading}
                  sx={{
                    height: '42px',
                    width: '42px',
                    borderRadius: 2,
                    color: 'text.secondary',
                    backgroundColor: 'transparent',
                    '&:hover': {
                      backgroundColor: (theme: any) => alpha(theme.palette.error.main, 0.1),
                      color: 'error.main'
                    }
                  }}
                >
                  <ClearIcon fontSize='small' />
                </IconButton>
              )}
            </Stack>
          </Stack>

          {/* Advanced Filters Section */}
          <Collapse in={expanded} timeout={300} className={styles.collapseSection}>
            <Box>
              <Divider sx={{ mb: 3, opacity: 0.6 }} />

              {/* Filter Fields */}
              {config.filterFields.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant='subtitle2'
                    sx={{
                      mb: 2,
                      color: 'text.primary',
                      fontWeight: 600,
                      fontSize: '0.9rem'
                    }}
                  >
                    Bộ lọc chi tiết
                  </Typography>
                  <Grid container spacing={2.5}>
                    {config.filterFields.map(field => (
                      <Grid item xs={12} sm={6} md={4} lg={3} key={field.key}>
                        {renderFilterField(field)}
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {/* Date Range Section */}
              {config.dateRangeFields && config.dateRangeFields.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant='subtitle2'
                    sx={{
                      mb: 2,
                      color: 'text.primary',
                      fontWeight: 600,
                      fontSize: '0.9rem'
                    }}
                  >
                    Lọc theo thời gian
                  </Typography>
                  <Grid container spacing={2.5} alignItems='center'>
                    <Grid item xs={12} sm={6} md={3}>
                      <FormControl fullWidth size='small'>
                        <InputLabel>Trường thời gian</InputLabel>
                        <Select
                          value={values.dateRange?.field || ''}
                          onChange={e =>
                            onChange({
                              ...values,
                              dateRange: {
                                ...values.dateRange,
                                field: e.target.value
                              }
                            })
                          }
                          label='Trường thời gian'
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2
                            }
                          }}
                        >
                          {config.dateRangeFields.map(field => (
                            <MenuItem key={field.key} value={field.key}>
                              {field.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        label='Từ ngày'
                        type='date'
                        size='small'
                        fullWidth
                        value={values.dateRange?.from || ''}
                        onChange={e => handleDateRangeChange(values.dateRange?.field || '', 'from', e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        disabled={!values.dateRange?.field}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        label='Đến ngày'
                        type='date'
                        size='small'
                        fullWidth
                        value={values.dateRange?.to || ''}
                        onChange={e => handleDateRangeChange(values.dateRange?.field || '', 'to', e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        disabled={!values.dateRange?.field}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2
                          }
                        }}
                      />
                    </Grid>
                  </Grid>
                </Box>
              )}

              {/* Active Filters Display */}
              {getActiveFilterCount() > 0 && (
                <Box
                  className={styles.activeFiltersBox}
                  sx={{
                    p: 2.5,
                    backgroundColor: (theme: any) => alpha(theme.palette.primary.main, 0.02),
                    borderRadius: 2,
                    border: (theme: any) => `1px dashed ${alpha(theme.palette.primary.main, 0.15)}`
                  }}
                >
                  <Typography
                    variant='subtitle2'
                    sx={{
                      mb: 1.5,
                      color: 'text.primary',
                      fontWeight: 600,
                      fontSize: '0.85rem'
                    }}
                  >
                    Bộ lọc đang áp dụng ({getActiveFilterCount()})
                  </Typography>
                  <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap className={styles.chipContainer}>
                    {values.search && (
                      <Chip
                        label={`Tìm kiếm: "${values.search}"`}
                        onDelete={() => handleSearchChange('')}
                        size='small'
                        variant='outlined'
                        sx={{
                          borderColor: 'primary.main',
                          color: 'primary.main',
                          backgroundColor: (theme: any) => alpha(theme.palette.primary.main, 0.08),
                          '& .MuiChip-deleteIcon': {
                            color: 'primary.main',
                            '&:hover': {
                              color: 'primary.dark'
                            }
                          }
                        }}
                      />
                    )}
                    {Object.entries(values.filters).map(([key, value]) => {
                      const field = config.filterFields.find(f => f.key === key)
                      const label = field?.label || key
                      let displayValue = value

                      if (field?.type === 'select') {
                        const option = field.options?.find(opt => opt.value === value)
                        displayValue = option?.label || value
                      }

                      return (
                        <Chip
                          key={key}
                          label={`${label}: ${displayValue}`}
                          onDelete={() => handleFilterChange(key, '')}
                          size='small'
                          variant='outlined'
                          sx={{
                            borderColor: 'primary.main',
                            color: 'primary.main',
                            backgroundColor: (theme: any) => alpha(theme.palette.primary.main, 0.08),
                            '& .MuiChip-deleteIcon': {
                              color: 'primary.main',
                              '&:hover': {
                                color: 'primary.dark'
                              }
                            }
                          }}
                        />
                      )
                    })}
                    {(values.dateRange?.from || values.dateRange?.to) && (
                      <Chip
                        label={`${
                          config.dateRangeFields?.find(f => f.key === values.dateRange?.field)?.label ||
                          values.dateRange.field
                        }: ${values.dateRange.from || ''} - ${values.dateRange.to || ''}`}
                        onDelete={() => onChange({ ...values, dateRange: undefined })}
                        size='small'
                        variant='outlined'
                        sx={{
                          borderColor: 'primary.main',
                          color: 'primary.main',
                          backgroundColor: (theme: any) => alpha(theme.palette.primary.main, 0.08),
                          '& .MuiChip-deleteIcon': {
                            color: 'primary.main',
                            '&:hover': {
                              color: 'primary.dark'
                            }
                          }
                        }}
                      />
                    )}
                  </Stack>
                </Box>
              )}
            </Box>
          </Collapse>
        </Paper>
      </Box>
    )
  }
)

export default AdvancedFilter
