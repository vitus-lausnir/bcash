'use client'

import { Card } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TimelineData } from '@/lib/cashflow'
import { useState } from 'react'

interface TimelineChartProps {
  data: TimelineData[]
}

function formatISK(amount: number): string {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}K`
  }
  return amount.toString()
}

const stageColors = {
  confirmed: '#10b981', // green
  veryLikely: '#3b82f6', // blue
  hot: '#f59e0b', // orange
  medium: '#8b5cf6', // purple
  longShot: '#6b7280', // gray
}

export function TimelineChart({ data }: TimelineChartProps) {
  const [selectedMonth, setSelectedMonth] = useState<TimelineData | null>(null)

  // Prepare data for Recharts
  const chartData = data.map((d) => ({
    month: d.monthLabel,
    Confirmed: d.confirmed,
    'Very Likely': d.veryLikely,
    Hot: d.hot,
    Medium: d.medium,
    'Long Shot': d.longShot,
    _raw: d, // Keep raw data for click handling
  }))

  const handleBarClick = (data: any) => {
    if (data && data._raw) {
      setSelectedMonth(data._raw)
    }
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum: number, entry: any) => sum + entry.value, 0)
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold mb-2">{payload[0].payload.month}</p>
          {payload.map((entry: any, index: number) => (
            entry.value > 0 && (
              <p key={index} style={{ color: entry.color }} className="text-sm">
                {entry.name}: {formatISK(entry.value)} ISK
              </p>
            )
          ))}
          <p className="font-semibold text-sm mt-1 pt-1 border-t">
            Total: {formatISK(total)} ISK
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold">Revenue Timeline</h2>
          <p className="text-sm text-muted-foreground">Expected revenue by month (next 12 months)</p>
        </div>

        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} onClick={handleBarClick}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={formatISK}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ fontSize: '12px' }}
                iconType="square"
              />
              <Bar dataKey="Confirmed" stackId="a" fill={stageColors.confirmed} />
              <Bar dataKey="Very Likely" stackId="a" fill={stageColors.veryLikely} />
              <Bar dataKey="Hot" stackId="a" fill={stageColors.hot} />
              <Bar dataKey="Medium" stackId="a" fill={stageColors.medium} />
              <Bar dataKey="Long Shot" stackId="a" fill={stageColors.longShot} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Deal Details on Click */}
        {selectedMonth && selectedMonth.deals.length > 0 && (
          <div className="pt-4 border-t">
            <h3 className="font-semibold mb-2">
              {selectedMonth.monthLabel} - {selectedMonth.deals.length} deal{selectedMonth.deals.length > 1 ? 's' : ''}
            </h3>
            <div className="space-y-2">
              {selectedMonth.deals.map((deal) => (
                <div key={deal.id} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                  <span className="font-medium">{deal.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-600 capitalize">{deal.stage.replace('_', ' ')}</span>
                    <span className="font-semibold">{formatISK(deal.amount)} ISK</span>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setSelectedMonth(null)}
              className="text-sm text-gray-600 hover:text-gray-900 mt-2 underline"
            >
              Clear selection
            </button>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          💡 Click on any bar to see which deals close that month
        </div>
      </div>
    </Card>
  )
}
