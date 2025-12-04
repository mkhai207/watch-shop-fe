import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Fade,
  List,
  ListItemText,
  ListItemButton,
  Container
} from '@mui/material'
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

type TBaseItem = {
  id: string | number
  name: string
  hex_code?: string
}

interface SectionListProps {
  title: string
  items: TBaseItem[]
  itemType: string
  onNavigate: (type: string, value: string) => void
  onShowMore: () => void
}

const SectionList: React.FC<SectionListProps> = ({ title, items, itemType, onNavigate, onShowMore }) => (
  <Box sx={{ width: '100%' }}>
    <Typography
      variant='subtitle1'
      sx={{
        fontWeight: 700,
        mb: 2.5,
        color: 'text.primary',
        fontSize: '1.1rem',
        textTransform: 'uppercase',
        letterSpacing: 1,
        pl: 1,
        position: 'relative',
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: -8,
          left: 4,
          width: 30,
          height: 2,
          backgroundColor: 'primary.main',
          borderRadius: 1
        }
      }}
    >
      {title}
    </Typography>

    <List dense sx={{ p: 0, width: '100%' }}>
      {items.map(item => (
        <ListItemButton
          key={item.id}
          onClick={() => onNavigate(itemType, item.id.toString())}
          sx={{
            borderRadius: 2,
            mb: 0.5,
            px: 2,
            py: 1,
            width: '100%',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden',
            '&:hover': {
              backgroundColor: 'rgba(25, 118, 210, 0.08)',
              transform: 'translateX(8px)',
              '&::before': {
                transform: 'scaleX(1)'
              }
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: 3,
              backgroundColor: 'primary.main',
              transform: 'scaleX(0)',
              transformOrigin: 'left center',
              transition: 'transform 0.3s ease'
            }
          }}
        >
          {itemType === 'colorId' && (
            <Box
              sx={{
                width: 14,
                height: 14,
                borderRadius: '50%',
                backgroundColor: item.hex_code || '#ccc',
                border: '2px solid #fff',
                boxShadow: '0 0 0 1px rgba(0,0,0,0.1)',
                mr: 2,
                flexShrink: 0,
                transition: 'transform 0.3s ease'
              }}
            />
          )}
          <ListItemText
            primary={item.name}
            primaryTypographyProps={{
              fontSize: '0.9rem',
              color: 'text.secondary',
              fontWeight: 500,
              noWrap: true,
              sx: {
                transition: 'all 0.3s ease',
                '.MuiListItemButton-root:hover &': {
                  color: 'primary.main',
                  fontWeight: 600
                }
              }
            }}
          />
        </ListItemButton>
      ))}

      {items.length >= 8 && (
        <ListItemButton onClick={onShowMore} sx={{ borderRadius: 1, px: 1, py: 0.5, mt: 1 }}>
          <ListItemText
            primary='Xem thêm...'
            primaryTypographyProps={{
              fontSize: '0.8rem',
              fontWeight: 500,
              color: 'primary.main',
              fontStyle: 'italic'
            }}
          />
        </ListItemButton>
      )}
    </List>
  </Box>
)

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
        // Lấy nhiều bản ghi hơn cho mega menu
        getBrands({ page: 1, limit: 1000 }),
        getCategories({ page: 1, limit: 1000 }),
        getMovementTypes({ page: 1, limit: 1000 }),
        getColors({ page: 1, limit: 1000 }),
        getStrapMaterials({ page: 1, limit: 1000 })
      ])
      const filterDeleted = (item: any) => item.del_flag !== '1'
      if (brandsRes?.brands?.items) setBrands(brandsRes.brands.items.filter(filterDeleted))
      if (categoriesRes?.categorys?.items) setCategories(categoriesRes.categorys.items.filter(filterDeleted))
      if (movementTypesRes?.movementTypes?.items)
        setMovementTypes(movementTypesRes.movementTypes.items.filter(filterDeleted))
      if (colorsRes?.colors?.items) setColors(colorsRes.colors.items.filter(filterDeleted))
      if (strapMaterialsRes?.strapMaterials?.items)
        setStrapMaterials(strapMaterialsRes.strapMaterials.items.filter(filterDeleted))
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

  const handleShowMore = () => {
    router.push(ROUTE_CONFIG.PRODUCT)
    onClose()
  }

  if (!show) return null

  return (
    <Fade in={show} timeout={400}>
      <Paper
        elevation={20}
        onMouseLeave={onClose}
        sx={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          zIndex: 1300,
          borderRadius: '0 0 16px 16px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 8px 20px rgba(0,0,0,0.1)',
          bgcolor: 'background.paper',
          minHeight: 350,
          backdropFilter: 'blur(10px)',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
          border: '1px solid rgba(255,255,255,0.2)',
          animation: 'slideDown 0.4s ease-out',
          '@keyframes slideDown': {
            '0%': {
              opacity: 0,
              transform: 'translateY(-20px)'
            },
            '100%': {
              opacity: 1,
              transform: 'translateY(0)'
            }
          }
        }}
      >
        {loading ? (
          <Box display='flex' alignItems='center' justifyContent='center' minHeight={350}>
            <CircularProgress size={40} thickness={4} sx={{ color: 'primary.main' }} />
          </Box>
        ) : (
          <Container maxWidth='lg' sx={{ py: 5, px: 4 }}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    height: '100%',
                    animation: 'fadeInUp 0.6s ease-out',
                    animationDelay: '0.1s',
                    animationFillMode: 'both',
                    '@keyframes fadeInUp': {
                      '0%': {
                        opacity: 0,
                        transform: 'translateY(30px)'
                      },
                      '100%': {
                        opacity: 1,
                        transform: 'translateY(0)'
                      }
                    }
                  }}
                >
                  <SectionList
                    title='Thương hiệu'
                    items={brands.slice(0, 8)}
                    itemType='brandId'
                    onNavigate={handleNavigate}
                    onShowMore={handleShowMore}
                  />
                  <Box sx={{ mt: 4 }} />
                  <SectionList
                    title='Danh mục'
                    items={categories.slice(0, 8)}
                    itemType='categoryId'
                    onNavigate={handleNavigate}
                    onShowMore={handleShowMore}
                  />
                </Box>
              </Grid>

              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    height: '100%',
                    animation: 'fadeInUp 0.6s ease-out',
                    animationDelay: '0.2s',
                    animationFillMode: 'both'
                  }}
                >
                  <SectionList
                    title='Bộ máy'
                    items={movementTypes.slice(0, 8)}
                    itemType='movementTypeId'
                    onNavigate={handleNavigate}
                    onShowMore={handleShowMore}
                  />
                  <Box sx={{ mt: 4 }} />
                  <SectionList
                    title='Chất liệu dây'
                    items={strapMaterials.slice(0, 8)}
                    itemType='strapMaterialId'
                    onNavigate={handleNavigate}
                    onShowMore={handleShowMore}
                  />
                </Box>
              </Grid>

              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    height: '100%',
                    animation: 'fadeInUp 0.6s ease-out',
                    animationDelay: '0.3s',
                    animationFillMode: 'both'
                  }}
                >
                  <SectionList
                    title='Màu sắc'
                    items={colors.slice(0, 8)}
                    itemType='colorId'
                    onNavigate={handleNavigate}
                    onShowMore={handleShowMore}
                  />
                </Box>
              </Grid>
            </Grid>
          </Container>
        )}
      </Paper>
    </Fade>
  )
}

export default MegaMenu
