import { Gavel, LocalShipping, Policy, Replay, VerifiedUser } from '@mui/icons-material'
import { Box, Card, CardActionArea, CardContent, Container, Grid, Typography } from '@mui/material'
import Head from 'next/head'
import Link from 'next/link'

const LegalHubPage = () => {
  const items = [
    { href: '/legal/terms', title: 'Điều khoản sử dụng', icon: <Gavel color='primary' /> },
    { href: '/legal/privacy', title: 'Chính sách bảo mật', icon: <Policy color='primary' /> },
    { href: '/legal/shipping', title: 'Chính sách vận chuyển', icon: <LocalShipping color='primary' /> },
    { href: '/legal/returns', title: 'Chính sách đổi trả', icon: <Replay color='primary' /> },
    { href: '/legal/warranty', title: 'Chính sách bảo hành', icon: <VerifiedUser color='primary' /> }
  ]

  return (
    <>
      <Head>
        <title>Điều khoản & Chính sách | CHRONOS</title>
      </Head>
      <Box sx={{ backgroundColor: 'background.default', px: { xs: 2, sm: 3, lg: 4 }, py: { xs: 6, md: 10 } }}>
        <Container maxWidth='lg'>
          <Typography variant='h3' fontWeight={800} sx={{ mb: 4 }}>
            Điều khoản & Chính sách
          </Typography>
          <Grid container spacing={3}>
            {items.map((item, idx) => (
              <Grid item xs={12} md={6} key={idx}>
                <Link href={item.href} style={{ textDecoration: 'none' }}>
                  <Card sx={{ borderRadius: 3 }}>
                    <CardActionArea>
                      <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'center', p: 3 }}>
                        {item.icon}
                        <Typography variant='h6' fontWeight={700} color='text.primary'>
                          {item.title}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Link>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </>
  )
}

export default LegalHubPage
