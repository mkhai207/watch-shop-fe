import React from 'react'
import { NextPage } from 'next'
import { Box, Button, Chip, Grid, Paper, Typography } from '@mui/material'
import IconifyIcon from 'src/components/Icon'
import Link from 'next/link'
import ManageSystemLayout from 'src/views/layouts/ManageSystemLayout'

const StatCard = ({
  title,
  value,
  subtitle,
  color
}: {
  title: string
  value: string
  subtitle?: string
  color?: string
}) => (
  <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: theme => `1px solid ${theme.palette.divider}` }}>
    <Typography variant='body2' color='text.secondary'>
      {title}
    </Typography>
    <Typography variant='h5' fontWeight={700} sx={{ my: 1 }}>
      {value}
    </Typography>
    {subtitle ? (
      <Typography variant='caption' sx={{ color: color || 'success.main', fontWeight: 600 }}>
        {subtitle}
      </Typography>
    ) : null}
  </Paper>
)

const DashboardPage: NextPage = () => {
  return (
    <>
      <Typography variant='h5' fontWeight={700} sx={{ mb: 3 }}>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={3}>
          <StatCard
            title='Tổng doanh thu'
            value='2.4 tỷ VNĐ'
            subtitle='+12.5% So với tháng trước'
            color='success.main'
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <StatCard title='Đơn hàng' value='1,234' subtitle='+8.2% Đơn hàng trong tháng' color='success.main' />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <StatCard title='Sản phẩm' value='456' subtitle='-2.1% Tổng sản phẩm' color='error.main' />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <StatCard title='Khách hàng' value='2,890' subtitle='+15.3% Khách hàng hoạt động' color='success.main' />
        </Grid>
      </Grid>

      <Box sx={{ mt: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={3}>
            <StatCard title='Thương hiệu' value='24' subtitle='18 hoạt động' />
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <StatCard title='Danh mục' value='12' subtitle='10 hoạt động' />
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <StatCard title='Khuyến mãi' value='8' subtitle='5 đang chạy' />
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <StatCard title='Đánh giá' value='1,456' subtitle='23 chờ duyệt' />
          </Grid>
        </Grid>
      </Box>

      <Grid container spacing={3} sx={{ mt: 3, alignItems: 'stretch' }}>
        <Grid item xs={12} lg={8} sx={{ display: 'flex' }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              border: theme => `1px solid ${theme.palette.divider}`,
              flex: 1,
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box>
                <Typography variant='h6' fontWeight={700}>
                  Đơn hàng gần đây
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Các đơn hàng mới nhất trong hệ thống
                </Typography>
              </Box>
              <Link href='/manage-system/order' passHref>
                <Button variant='outlined' size='small' startIcon={<IconifyIcon icon='mdi:eye-outline' />}>
                  Xem tất cả
                </Button>
              </Link>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {[
                {
                  id: '#1234',
                  customer: 'Nguyễn Văn A',
                  product: 'Rolex Submariner',
                  amount: '450,000,000 VNĐ',
                  status: 'completed',
                  time: '2 phút trước'
                },
                {
                  id: '#1235',
                  customer: 'Trần Thị B',
                  product: 'Omega Speedmaster',
                  amount: '180,000,000 VNĐ',
                  status: 'processing',
                  time: '15 phút trước'
                },
                {
                  id: '#1236',
                  customer: 'Lê Văn C',
                  product: 'TAG Heuer Carrera',
                  amount: '95,000,000 VNĐ',
                  status: 'pending',
                  time: '1 giờ trước'
                }
              ].map(order => (
                <Box
                  key={order.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 1.5,
                    borderRadius: 1.5,
                    bgcolor: 'action.hover'
                  }}
                >
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography fontWeight={600}>{order.id}</Typography>
                      <Chip
                        size='small'
                        label={
                          order.status === 'completed'
                            ? 'Hoàn thành'
                            : order.status === 'processing'
                              ? 'Đang xử lý'
                              : 'Chờ xử lý'
                        }
                        color={
                          order.status === 'completed' ? 'success' : order.status === 'processing' ? 'info' : 'default'
                        }
                        variant={order.status === 'pending' ? 'outlined' : 'filled'}
                      />
                    </Box>
                    <Typography variant='body2' color='text.secondary'>
                      {order.customer} • {order.product}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      {order.time}
                    </Typography>
                  </Box>
                  <Typography fontWeight={600}>{order.amount}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={4} sx={{ display: 'flex' }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              border: theme => `1px solid ${theme.palette.divider}`,
              flex: 1,
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Typography variant='h6' fontWeight={700} sx={{ mb: 0.5 }}>
              Hoạt động gần đây
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
              Các thay đổi mới nhất trong hệ thống
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {[
                { icon: 'mdi:message-text-outline', text: 'Đánh giá mới cho Rolex Submariner', time: '5 phút trước' },
                { icon: 'mdi:gift-outline', text: 'Khuyến mãi SUMMER2024 đã được kích hoạt', time: '1 giờ trước' },
                { icon: 'mdi:office-building-outline', text: 'Thương hiệu Citizen đã được thêm', time: '2 giờ trước' },
                { icon: 'mdi:tag-outline', text: 'Danh mục Đồng hồ thông minh đã được cập nhật', time: '3 giờ trước' }
              ].map((activity, idx) => (
                <Box key={idx} sx={{ display: 'flex', gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      bgcolor: 'action.hover',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'text.secondary',
                      flexShrink: 0
                    }}
                  >
                    <IconifyIcon icon={activity.icon as any} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant='body2'>{activity.text}</Typography>
                    <Typography variant='caption' color='text.secondary'>
                      {activity.time}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: theme => `1px solid ${theme.palette.divider}`, mt: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant='h6' fontWeight={700}>
              Sản phẩm bán chạy
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Top sản phẩm có doanh số cao nhất trong tháng
            </Typography>
          </Box>
          <Link href='/manage-system/product' passHref>
            <Button variant='outlined' size='small' startIcon={<IconifyIcon icon='mdi:plus' />}>
              Thêm mới
            </Button>
          </Link>
        </Box>
        <Grid container spacing={2}>
          {[
            { name: 'Rolex Submariner', sales: 45, revenue: '2.025 tỷ VNĐ', image: '/images/product-banner.jpg' },
            { name: 'Omega Speedmaster', sales: 32, revenue: '576 triệu VNĐ', image: '/images/home-banner.png' },
            { name: 'TAG Heuer Carrera', sales: 28, revenue: '266 triệu VNĐ', image: '/images/fashion-shop-logo.jpg' }
          ].map(p => (
            <Grid key={p.name} item xs={12} md={4}>
              <Box
                sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'action.hover', borderRadius: 2 }}
              >
                <Box sx={{ width: 48, height: 48, borderRadius: 1, overflow: 'hidden', flexShrink: 0 }}>
                  <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant='body2' fontWeight={600}>
                    {p.name}
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    {p.sales} đã bán
                  </Typography>
                  <Typography variant='body2' fontWeight={600}>
                    {p.revenue}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>

      <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: theme => `1px solid ${theme.palette.divider}`, mt: 3 }}>
        <Typography variant='h6' fontWeight={700} sx={{ mb: 2 }}>
          Thao tác nhanh
        </Typography>
        <Grid container spacing={2}>
          {[
            {
              href: '/manage-system/product',
              icon: 'mdi:package-variant',
              label: 'Thêm sản phẩm'
            },
            { href: '/manage-system/discount', icon: 'mdi:percent-outline', label: 'Tạo khuyến mãi' },
            { href: '/manage-system/brand', icon: 'mdi:office-building-outline', label: 'Quản lý thương hiệu' },
            { href: '/manage-system/review', icon: 'mdi:star-outline', label: 'Duyệt đánh giá' }
          ].map(action => (
            <Grid key={action.label} item xs={6} md={3}>
              <Link href={action.href} passHref>
                <Button fullWidth variant='outlined' sx={{ height: 80, flexDirection: 'column', gap: 1 }}>
                  <IconifyIcon icon={action.icon as any} />
                  <Typography variant='body2'>{action.label}</Typography>
                </Button>
              </Link>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </>
  )
}

// Use a dedicated layout for manage-system to avoid the public navbar
// eslint-disable-next-line react/display-name
;(DashboardPage as any).getLayout = (page: React.ReactNode) => <ManageSystemLayout>{page}</ManageSystemLayout>

export default DashboardPage
