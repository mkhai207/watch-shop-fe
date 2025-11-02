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
        mb: 2,
        color: 'text.primary',
        fontSize: '1rem',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        pl: 1
      }}
    >
      {title}
    </Typography>

    <List dense sx={{ p: 0, width: '100%' }}>
      {items.map(item => (
        <ListItemButton
          key={item.id}
          onClick={() => onNavigate(itemType, item.id.toString())}
          sx={{ borderRadius: 1, mb: 0.5, px: 1, py: 0.5, width: '100%' }}
        >
          {itemType === 'colorId' && (
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: item.hex_code || '#ccc',
                border: '1px solid #ddd',
                mr: 1.5,
                flexShrink: 0
              }}
            />
          )}
          <ListItemText
            primary={item.name}
            primaryTypographyProps={{
              fontSize: '0.875rem',
              color: 'text.secondary',
              fontWeight: 400,
              noWrap: true,
              sx: {
                transition: 'color 0.2s ease',
                '&:hover': {
                  color: 'primary.main'
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
        getBrands(),
        getCategories(),
        getMovementTypes(),
        getColors(),
        getStrapMaterials()
      ])
      const filterDeleted = (item: any) => item.del_flag !== '1'
      if (brandsRes?.brands?.items) setBrands(brandsRes.brands.items.filter(filterDeleted))
      if (categoriesRes?.categorys?.items) setCategories(categoriesRes.categorys.items.filter(filterDeleted))
      if (movementTypesRes?.movementTypes?.items)
        setMovementTypes(movementTypesRes.movementTypes.items.filter(filterDeleted))
      if (colorsRes?.colors?.items) setColors(colorsRes.colors.items.filter(filterDeleted))
      if (strapMaterialsRes?.strapMaterials?.rows)
        setStrapMaterials(strapMaterialsRes.strapMaterials.rows.filter(filterDeleted))
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
          borderRadius: 0,
          boxShadow: '0 8px 40px rgba(0,0,0,0.1)',
          bgcolor: 'background.paper',
          minHeight: 300
        }}
      >
        {loading ? (
          <Box display='flex' alignItems='center' justifyContent='center' minHeight={300}>
            <CircularProgress />
          </Box>
        ) : (
          <Container maxWidth='lg' sx={{ py: 4 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Box sx={{ height: '100%' }}>
                  <SectionList
                    title='Thương hiệu'
                    items={brands.slice(0, 8)}
                    itemType='brandId'
                    onNavigate={handleNavigate}
                    onShowMore={handleShowMore}
                  />
                  <Box sx={{ mt: 3 }} />
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
                <Box sx={{ height: '100%' }}>
                  <SectionList
                    title='Bộ máy'
                    items={movementTypes.slice(0, 8)}
                    itemType='movementTypeId'
                    onNavigate={handleNavigate}
                    onShowMore={handleShowMore}
                  />
                  <Box sx={{ mt: 3 }} />
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
                <Box sx={{ height: '100%' }}>
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
