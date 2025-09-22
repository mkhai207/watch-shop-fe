import { Assessment, AttachMoney, CalendarToday, MoreVert, ShoppingCart } from '@mui/icons-material'
import { Box, Button, Card, CardContent, Chip, Grid, IconButton, TextField, Typography } from '@mui/material'
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useState, useEffect, useCallback } from 'react'
import { getRevenueFromTo, getDailyRevenue } from 'src/services/dashboard'

// Types for API responses
interface RevenueFromToResponse {
  status: string
  message: string
  error: null | string
  data: {
    totalRevenue: number
    orderCount: number
    avgOrderValue: number
  }
}

interface DailyRevenueItem {
  date: string
  orders: number
  revenue: number
}

interface DailyRevenueResponse {
  status: string
  message: string
  error: null | string
  data: DailyRevenueItem[]
}

interface MetricCardProps {
  title: string
  value: string
  icon: React.ReactNode
  subtitle: string
}

// Component for metric cards
const MetricCard = ({ title, value, icon, subtitle }: MetricCardProps) => {
  return (
    <Card elevation={1} sx={{ height: '100%', borderRadius: 2 }}>
      <CardContent sx={{ p: 3 }}>
        <Box display='flex' justifyContent='space-between' alignItems='flex-start' mb={2}>
          <Box display='flex' alignItems='center' gap={1}>
            <Box sx={{ color: 'text.secondary' }}>{icon}</Box>
            <Typography variant='body2' color='text.secondary' fontWeight={500}>
              {title}
            </Typography>
          </Box>
          <IconButton size='small' sx={{ color: 'text.secondary' }}>
            <MoreVert fontSize='small' />
          </IconButton>
        </Box>

        <Box mb={1}>
          <Typography variant='h4' fontWeight='bold' color='text.primary'>
            {value}
          </Typography>
        </Box>

        <Typography variant='body2' color='text.secondary'>
          {subtitle}
        </Typography>
      </CardContent>
    </Card>
  )
}

// Main Dashboard Component
const DashboardPage = () => {
  const [fromDate, setFromDate] = useState<string>('')
  const [toDate, setToDate] = useState<string>('')
  const [revenueData, setRevenueData] = useState<RevenueFromToResponse['data'] | null>(null)
  const [chartData, setChartData] = useState<DailyRevenueItem[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  // Set default dates (30 days ago to today)
  useEffect(() => {
    const today = new Date()
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(today.getDate() - 30)

    const formatDate = (date: Date) => {
      return date.toISOString().split('T')[0]
    }

    setFromDate(formatDate(thirtyDaysAgo))
    setToDate(formatDate(today))
  }, [])

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true)

      const revenueResponse = await getRevenueFromTo(fromDate, toDate)
      if (revenueResponse?.status === 'success') {
        setRevenueData(revenueResponse.data)
      }

      const dailyResponse = await getDailyRevenue(fromDate, toDate)
      if (dailyResponse?.status === 'success') {
        setChartData(dailyResponse.data)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }, [fromDate, toDate])

  useEffect(() => {
    if (fromDate && toDate) {
      fetchDashboardData()
    }
  }, [fromDate, toDate, fetchDashboardData])

  const handleDateChange = () => {
    if (fromDate && toDate) {
      fetchDashboardData()
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  return (
    <Box sx={{ p: 3, backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <Box display='flex' justifyContent='space-between' alignItems='center' mb={4}>
        <Box>
          <Typography variant='h4' fontWeight='bold' color='text.primary' mb={1}>
            Dashboard
          </Typography>
        </Box>

        <Box display='flex' gap={2} alignItems='center'>
          <TextField
            label='Từ ngày'
            type='date'
            value={fromDate}
            onChange={e => setFromDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            size='small'
            sx={{ backgroundColor: 'white', borderRadius: 1 }}
          />
          <TextField
            label='Đến ngày'
            type='date'
            value={toDate}
            onChange={e => setToDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            size='small'
            sx={{ backgroundColor: 'white', borderRadius: 1 }}
          />
          <Button variant='contained' onClick={handleDateChange} disabled={loading} startIcon={<CalendarToday />}>
            Cập nhật
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Box display='flex' justifyContent='center' alignItems='center' height='400px'>
          <Typography variant='h6' color='text.secondary'>
            Đang tải dữ liệu...
          </Typography>
        </Box>
      ) : (
        <>
          {/* Stats Grid */}
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} md={4}>
              <MetricCard
                title='Tổng đơn hàng'
                value={revenueData?.orderCount?.toLocaleString() || '0'}
                subtitle='Số lượng đơn hàng'
                icon={<ShoppingCart />}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <MetricCard
                title='Tổng doanh thu'
                value={revenueData ? formatCurrency(revenueData.totalRevenue) : '0 ₫'}
                subtitle='Tổng doanh thu'
                icon={<AttachMoney />}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <MetricCard
                title='Giá trị đơn TB'
                value={revenueData ? formatCurrency(revenueData.avgOrderValue) : '0 ₫'}
                subtitle='Giá trị trung bình mỗi đơn'
                icon={<Assessment />}
              />
            </Grid>
          </Grid>

          {/* Charts Grid */}
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card elevation={1} sx={{ borderRadius: 2 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box display='flex' justifyContent='space-between' alignItems='center' mb={3}>
                    <Typography variant='h6' fontWeight='bold'>
                      Biểu đồ doanh thu theo ngày
                    </Typography>
                  </Box>

                  <Box sx={{ height: 400, position: 'relative' }}>
                    <ResponsiveContainer width='100%' height='100%'>
                      <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <XAxis
                          dataKey='date'
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: '#64748b' }}
                          tickFormatter={value => {
                            const date = new Date(value)

                            return `${date.getDate()}/${date.getMonth() + 1}`
                          }}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: '#64748b' }}
                          tickFormatter={value => `${(value / 1000000).toFixed(1)}M`}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                          }}
                          formatter={(value, name) => [
                            name === 'revenue' ? formatCurrency(Number(value)) : value,
                            name === 'revenue' ? 'Doanh thu' : 'Số đơn hàng'
                          ]}
                          labelFormatter={label => {
                            const date = new Date(label)

                            return `Ngày ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
                          }}
                        />
                        <Line
                          type='monotone'
                          dataKey='revenue'
                          stroke='#6366f1'
                          strokeWidth={3}
                          dot={false}
                          activeDot={{ r: 6, fill: '#6366f1' }}
                        />
                        <Line
                          type='monotone'
                          dataKey='orders'
                          stroke='#10b981'
                          strokeWidth={2}
                          dot={false}
                          strokeDasharray='5 5'
                          activeDot={{ r: 4, fill: '#10b981' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  )
}

export default DashboardPage
