'use client'

import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface MonthlyData {
  month: string
  revenue: number
  orderCount: number
}

interface RevenueOrdersChartProps {
  data: MonthlyData[]
}

const formatCurrency = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(0)}tr`
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}k`
  }

  return value.toLocaleString('vi-VN')
}

export default function RevenueOrdersChart({ data }: RevenueOrdersChartProps) {
  if (!data || data.length === 0) {
    return (
      <div style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Không có dữ liệu để hiển thị.
      </div>
    )
  }

  return (
    <ResponsiveContainer width='100%' height={400}>
      <ComposedChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5
        }}
      >
        <CartesianGrid stroke='#f5f5f5' />
        <XAxis dataKey='month' />

        {/* Trục Y bên trái (Doanh thu) */}
        <YAxis yAxisId='left' stroke='#8884d8' tickFormatter={formatCurrency} />

        {/* Trục Y bên phải (Số đơn hàng) */}
        <YAxis yAxisId='right' orientation='right' stroke='#82ca9d' />

        <Tooltip
          formatter={(value: number, name: string) => {
            if (name === 'Doanh thu') {
              return [`${value.toLocaleString('vi-VN')} VNĐ`, name]
            }
            if (name === 'Số đơn hàng') {
              return [`${value} đơn`, name]
            }

            return [value.toString(), name]
          }}
        />
        <Legend />

        {/* Cột Doanh thu */}
        <Bar dataKey='revenue' yAxisId='left' name='Doanh thu' fill='#8884d8' />

        {/* Đường Số đơn hàng */}
        <Line
          type='monotone'
          dataKey='orderCount'
          yAxisId='right'
          name='Số đơn hàng'
          stroke='#82ca9d'
          strokeWidth={2}
          dot={{ r: 4 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
