import { Box, Container, Grid, Paper, Typography } from '@mui/material'
import { NextPage } from 'next'
import { useEffect, useState } from 'react'
import Spinner from 'src/components/spinner'
import CardProduct from 'src/components/card-product/CardProduct'
import { useAuth } from 'src/hooks/useAuth'
import { getRecommendationsByUser } from 'src/services/recommendation'

const WishlistPage: NextPage = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<any[]>([])

  useEffect(() => {
    const fetchRecs = async () => {
      if (!user?.id) return
      try {
        setLoading(true)
        const res = await getRecommendationsByUser(Number(user.id), { type: 'hybrid', limit: 10 })
        const raw = (res?.data || res?.recommendations?.items || res?.recommendations || res?.items || res) as any[]
        const normalized = Array.isArray(raw) ? raw.map((it: any) => it?.watch || it) : []
        setItems(normalized)
      } catch (e) {
        setItems([])
      } finally {
        setLoading(false)
      }
    }
    fetchRecs()
  }, [user?.id])

  return (
    <Container maxWidth='lg' sx={{ py: 4, mt: 4 }}>
      {loading && <Spinner />}
      <Box sx={{ mb: 3 }}>
        <Typography variant='h4' fontWeight={800} letterSpacing='-0.02em'>
          Gợi ý dành cho bạn
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          Danh sách gợi ý dựa trên hành vi xem, thêm giỏ và mua hàng
        </Typography>
      </Box>
      {items.length === 0 ? (
        <Paper variant='outlined' sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant='body1' color='text.secondary'>
            Chưa có gợi ý nào. Hãy xem và mua một vài sản phẩm!
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {items.map((product: any) => (
            <Grid key={product.id} item xs={12} sm={6} md={4} lg={3}>
              <CardProduct item={product} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  )
}

export default WishlistPage
