import React, { useCallback, useEffect, useState } from 'react'
import { NextPage } from 'next'
import { Box, Button, Chip, Grid, Paper, TextField, Typography } from '@mui/material'
import dayjs, { Dayjs } from 'dayjs'
import IconifyIcon from 'src/components/Icon'
import Link from 'next/link'
import ManageSystemLayout from 'src/views/layouts/ManageSystemLayout'
import { getReportDashboard } from 'src/services/report'
import qs from 'qs'
import 'dayjs/locale/vi'
import { DashboardData } from 'src/types/report'

dayjs.locale('vi')

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount)
}

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('vi-VN').format(num)
}

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
  const [startDate, setStartDate] = useState<Dayjs>(dayjs().subtract(1, 'month'))
  const [endDate, setEndDate] = useState<Dayjs>(dayjs())
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchDashboardData = useCallback(async () => {
    setLoading(true)
    try {
      const response = await getReportDashboard({
        params: {
          startDate: startDate.format('YYYYMMDDHHmmss'),
          endDate: endDate.format('YYYYMMDDHHmmss')
        },
        paramsSerializer: params => qs.stringify(params, { encode: false })
      })

      if (response && !response.message) {
        setDashboardData(response)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }, [startDate, endDate])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  const handleDateChange = () => {
    fetchDashboardData()
  }

  const handleStartDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(dayjs(event.target.value))
  }

  const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(dayjs(event.target.value))
  }

  return (
    <Box>
      <Typography variant='h5' fontWeight={700} sx={{ mb: 3 }}>
        Dashboard
      </Typography>

      {/* Date Filter */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: theme => `1px solid ${theme.palette.divider}`, mb: 3 }}>
        <Typography variant='h6' fontWeight={600} sx={{ mb: 2 }}>
          Bộ lọc
        </Typography>
        <Grid container spacing={2} alignItems='center'>
          <Grid item xs={12} sm={4}>
            <TextField
              label='Từ ngày'
              type='date'
              value={startDate.format('YYYY-MM-DD')}
              onChange={handleStartDateChange}
              size='small'
              fullWidth
              InputLabelProps={{
                shrink: true
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label='Đến ngày'
              type='date'
              value={endDate.format('YYYY-MM-DD')}
              onChange={handleEndDateChange}
              size='small'
              fullWidth
              InputLabelProps={{
                shrink: true
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              variant='contained'
              onClick={handleDateChange}
              startIcon={<IconifyIcon icon='mdi:filter' />}
              disabled={loading}
            >
              Lọc dữ liệu
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={3}>
          <StatCard
            title='Tổng doanh thu'
            value={dashboardData ? formatCurrency(dashboardData.totalRevenue) : 'Đang tải...'}
            subtitle={`Từ ${startDate.format('DD/MM/YYYY')} đến ${endDate.format('DD/MM/YYYY')}`}
            color='success.main'
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <StatCard
            title='Đơn hàng'
            value={dashboardData ? formatNumber(dashboardData.countOrder) : 'Đang tải...'}
            subtitle='Tổng số đơn hàng'
            color='info.main'
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <StatCard
            title='Sản phẩm'
            value={dashboardData ? formatNumber(dashboardData.countWatch) : 'Đang tải...'}
            subtitle='Tổng sản phẩm đồng hồ'
            color='primary.main'
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <StatCard
            title='Khách hàng'
            value={dashboardData ? formatNumber(dashboardData.countUser) : 'Đang tải...'}
            subtitle='Tổng số người dùng'
            color='success.main'
          />
        </Grid>
      </Grid>

      <Box sx={{ mt: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={3}>
            <StatCard
              title='Thương hiệu'
              value={dashboardData ? formatNumber(dashboardData.countBrand) : 'Đang tải...'}
              subtitle='Tổng số thương hiệu'
            />
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <StatCard
              title='Danh mục'
              value={dashboardData ? formatNumber(dashboardData.countCategory) : 'Đang tải...'}
              subtitle='Tổng số danh mục'
            />
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <StatCard
              title='Khuyến mãi'
              value={dashboardData ? formatNumber(dashboardData.countDiscount) : 'Đang tải...'}
              subtitle='Tổng số khuyến mãi'
            />
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <StatCard
              title='Đánh giá'
              value={dashboardData ? formatNumber(dashboardData.countReview) : 'Đang tải...'}
              subtitle='Tổng số đánh giá'
            />
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
              {dashboardData?.orderRecently && dashboardData.orderRecently.length > 0 ? (
                dashboardData.orderRecently.map(order => (
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
                        <Typography fontWeight={600}>#{order.code}</Typography>
                        <Chip
                          size='small'
                          label={
                            order.current_status_id === '1'
                              ? 'Chờ xử lý'
                              : order.current_status_id === '2'
                                ? 'Đã xác nhận'
                                : order.current_status_id === '3'
                                  ? 'Đã giao'
                                  : 'Đã hủy'
                          }
                          color={
                            order.current_status_id === '1'
                              ? 'warning'
                              : order.current_status_id === '2'
                                ? 'info'
                                : order.current_status_id === '3'
                                  ? 'success'
                                  : 'error'
                          }
                          variant='filled'
                        />
                      </Box>
                      <Typography variant='body2' color='text.secondary'>
                        {order.guess_name || 'Khách hàng'} • {order.guess_phone}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {dayjs(order.created_at, 'YYYYMMDDHHmmss').format('DD/MM/YYYY HH:mm')}
                      </Typography>
                    </Box>
                    <Typography fontWeight={600}>{formatCurrency(order.final_amount)}</Typography>
                  </Box>
                ))
              ) : (
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant='body2' color='text.secondary'>
                    Không có đơn hàng nào
                  </Typography>
                </Box>
              )}
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
          <Link href='/manage-system/watch' passHref>
            <Button variant='outlined' size='small' startIcon={<IconifyIcon icon='mdi:plus' />}>
              Thêm mới
            </Button>
          </Link>
        </Box>
        <Grid container spacing={2}>
          {dashboardData?.topWatches && dashboardData.topWatches.length > 0 ? (
            dashboardData.topWatches.map(watch => (
              <Grid key={watch.id} item xs={12} md={4}>
                <Box
                  sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'action.hover', borderRadius: 2 }}
                >
                  <Box sx={{ width: 48, height: 48, borderRadius: 1, overflow: 'hidden', flexShrink: 0 }}>
                    <img
                      src={watch.thumbnail || '/images/product-banner.jpg'}
                      alt={watch.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant='body2' fontWeight={600}>
                      {watch.name}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      {watch.sold} đã bán • ⭐ {watch.rating}
                    </Typography>
                    <Typography variant='body2' fontWeight={600}>
                      {formatCurrency(watch.base_price)}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant='body2' color='text.secondary'>
                  Không có dữ liệu sản phẩm
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </Paper>

      <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: theme => `1px solid ${theme.palette.divider}`, mt: 3 }}>
        <Typography variant='h6' fontWeight={700} sx={{ mb: 2 }}>
          Thao tác nhanh
        </Typography>
        <Grid container spacing={2}>
          {[
            {
              href: '/manage-system/watch',
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
    </Box>
  )
}

;(DashboardPage as any).getLayout = (page: React.ReactNode) => <ManageSystemLayout>{page}</ManageSystemLayout>

export default DashboardPage
