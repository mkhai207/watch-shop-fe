import React, { useState, useEffect } from 'react'
import { Box, Typography, Grid, Paper, CircularProgress, Fade, List, ListItem, ListItemText } from '@mui/material'
import { useRouter } from 'next/router'
import { ROUTE_CONFIG } from 'src/configs/route'
import { useFilter } from 'src/contexts/FilterContext'
import { getBrands } from 'src/services/brand'
import { getCategories } from 'src/services/category'
import { getMovementTypes } from 'src/services/movementType'
import { getColors } from 'src/services/color'
import { getStrapMaterials } from 'src/services/strapMaterial'
import { TBrand } from 'src/types/brand'
import { TCategory } from 'src/types/category'
import { TMovementType } from 'src/types/movementType'
import { TColor } from 'src/types/color'
import { TStrapMaterial } from 'src/types/strapMaterial'

interface MegaMenuProps {
  show: boolean
  onClose: () => void
}

const MegaMenu: React.FC<MegaMenuProps> = ({ show, onClose }) => {
  const router = useRouter()
  const { updateSingleFilter, resetAllFilters } = useFilter()

  const [loading, setLoading] = useState(false)
  const [brands, setBrands] = useState<TBrand[]>([])
  const [categories, setCategories] = useState<TCategory[]>([])
  const [movementTypes, setMovementTypes] = useState<TMovementType[]>([])
  const [colors, setColors] = useState<TColor[]>([])
  const [strapMaterials, setStrapMaterials] = useState<TStrapMaterial[]>([])

  useEffect(() => {
    if (show) fetchData()
  }, [show])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [brandsRes, categoriesRes, movementTypesRes, colorsRes, strapMaterialsRes] = await Promise.all([
        getBrands(),
        getCategories(),
        getMovementTypes(),
        getColors(),
        getStrapMaterials()
      ])

      if (brandsRes?.brands?.items) {
        setBrands(brandsRes.brands.items.filter((item: any) => item.del_flag !== '1'))
      }

      if (categoriesRes?.categorys?.items) {
        setCategories(categoriesRes.categorys.items.filter((item: any) => item.del_flag !== '1'))
      }

      if (movementTypesRes?.movementTypes?.items) {
        setMovementTypes(movementTypesRes.movementTypes.items.filter((item: any) => item.del_flag !== '1'))
      }

      if (colorsRes?.colors?.items) {
        setColors(colorsRes.colors.items.filter((item: any) => item.del_flag !== '1'))
      }

      if (strapMaterialsRes?.strapMaterials?.rows) {
        setStrapMaterials(strapMaterialsRes.strapMaterials.rows.filter((item: any) => item.del_flag !== '1'))
      }
    } catch (error) {
      console.error('Error fetching mega menu data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleNavigate = (type: string, value: string) => {
    resetAllFilters()
    updateSingleFilter(type as any, value)
    router.push(ROUTE_CONFIG.PRODUCT)
    onClose()
  }

  if (!show) return null

  const sections = [
    { title: 'Thương hiệu', data: brands.slice(0, 8), type: 'brandId' },
    { title: 'Danh mục', data: categories.slice(0, 8), type: 'categoryId' },
    { title: 'Bộ máy', data: movementTypes.slice(0, 8), type: 'movementTypeId' },
    { title: 'Màu sắc', data: colors.slice(0, 8), type: 'colorId' }
  ]

  return (
    <Fade in={show} timeout={250}>
      <Paper
        elevation={12}
        onMouseLeave={onClose}
        sx={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          zIndex: 1300,
          borderRadius: '0 0 16px 16px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.1)',
          bgcolor: 'background.paper',
          minWidth: 600,
          maxWidth: 800,
          minHeight: 300
        }}
      >
        {loading ? (
          <Box display='flex' alignItems='center' justifyContent='center' height={200}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container>
            {sections.map((section, sectionIndex) => (
              <Grid item xs={6} md={3} key={section.title}>
                <Box
                  sx={{
                    p: 3,
                    borderRight: sectionIndex < sections.length - 1 ? '1px solid' : 'none',
                    borderColor: 'divider',
                    height: '100%'
                  }}
                >
                  <Typography
                    variant='subtitle2'
                    sx={{
                      fontWeight: 600,
                      mb: 2,
                      color: 'text.secondary',
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: 0.5
                    }}
                  >
                    {section.title}
                  </Typography>

                  <List dense sx={{ p: 0 }}>
                    {section.data.map((item, index) => (
                      <ListItem
                        key={index}
                        onClick={() => handleNavigate(section.type, item.id.toString())}
                        sx={{
                          px: 0,
                          py: 0.5,
                          cursor: 'pointer',
                          borderRadius: 1,
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            backgroundColor: 'action.hover',
                            color: 'primary.main'
                          }
                        }}
                      >
                        {section.type === 'colorId' && (
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              backgroundColor: (item as any).hex_code || '#ccc',
                              border: '1px solid #ddd',
                              mr: 1,
                              flexShrink: 0
                            }}
                          />
                        )}
                        <ListItemText
                          primary={item.name}
                          primaryTypographyProps={{
                            fontSize: '0.875rem',
                            fontWeight: 400,
                            color: 'text.primary'
                          }}
                        />
                      </ListItem>
                    ))}

                    {section.data.length >= 8 && (
                      <ListItem
                        onClick={() => router.push(ROUTE_CONFIG.PRODUCT)}
                        sx={{
                          px: 0,
                          py: 0.5,
                          cursor: 'pointer',
                          borderRadius: 1,
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            color: 'primary.main'
                          }
                        }}
                      >
                        <ListItemText
                          primary='Xem thêm...'
                          primaryTypographyProps={{
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            color: 'primary.main',
                            fontStyle: 'italic'
                          }}
                        />
                      </ListItem>
                    )}
                  </List>
                </Box>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
    </Fade>
  )
}

export default MegaMenu
