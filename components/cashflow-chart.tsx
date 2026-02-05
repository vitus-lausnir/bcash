'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts'
import { CashflowProjections, Scenario } from '@/lib/cashflow'
import { useState } from 'react'

interface CashflowChartProps {
  projections: CashflowProjections
}

function formatISK(amount: number): string {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}K`
  }
  return amount.toString()
}

function formatMonth(isoDate: string): string {
  const date = new Date(isoDate)
  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
}

export function CashflowChart({ projections }: CashflowChartProps) {
  const [selectedScenario, setSelectedScenario] = useState<Scenario>('realistic')

  const scenarioData = projections.scenarios[selectedScenario]

  // Prepare data for chart
  const chartData = scenarioData.monthly.map((m) => ({
    month: formatMonth(m.month),
    balance: m.balance,
    revenue: m.revenue,
    expenses: m.expenses,
  }))

  const scenarioConfig = {
    best: {
      label: 'Best',
      description: '100% conversion (all deals close)',
      color: 'bg-green-500',
      textColor: 'text-green-700',
    },
    realistic: {
      label: 'Realistic',
      description: 'Probability-weighted conversion',
      color: 'bg-blue-500',
      textColor: 'text-blue-700',
    },
    worst: {
      label: 'Worst',
      description: 'Only Very Likely + Confirmed',
      color: 'bg-orange-500',
      textColor: 'text-orange-700',
    },
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold mb-2">{payload[0].payload.month}</p>
          <p className="text-sm text-green-600">Revenue: {formatISK(payload[0].payload.revenue)} ISK</p>
          <p className="text-sm text-red-600">Expenses: {formatISK(payload[0].payload.expenses)} ISK</p>
          <p className="text-sm font-semibold mt-1 pt-1 border-t">
            Balance: {formatISK(payload[0].payload.balance)} ISK
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold">Cashflow & Runway</h2>
          <p className="text-sm text-muted-foreground">Balance projection based on pipeline</p>
        </div>

        {/* Scenario Toggle */}
        <div className="flex gap-2">
          {(['best', 'realistic', 'worst'] as Scenario[]).map((scenario) => {
            const config = scenarioConfig[scenario]
            const isSelected = selectedScenario === scenario
            return (
              <Button
                key={scenario}
                onClick={() => setSelectedScenario(scenario)}
                variant={isSelected ? 'default' : 'outline'}
                size="sm"
                className={isSelected ? config.color : ''}
              >
                {config.label}
              </Button>
            )
          })}
        </div>

        {/* Scenario Info */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium">{scenarioConfig[selectedScenario].label} Scenario</p>
          <p className="text-xs text-muted-foreground">{scenarioConfig[selectedScenario].description}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
            <div>
              <p className="text-xs text-muted-foreground">Total Revenue</p>
              <p className="text-lg font-bold">{formatISK(scenarioData.totalRevenue)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Expenses</p>
              <p className="text-lg font-bold text-red-600">{formatISK(scenarioData.totalExpenses)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Net</p>
              <p className={`text-lg font-bold ${scenarioData.totalRevenue - scenarioData.totalExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatISK(scenarioData.totalRevenue - scenarioData.totalExpenses)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Runway</p>
              <p className="text-lg font-bold">
                {scenarioData.runwayMonths === null ? '∞' : `${scenarioData.runwayMonths} mo`}
              </p>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={formatISK}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="3 3" />
              <Line 
                type="monotone" 
                dataKey="balance" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                name="Balance"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Critical Months */}
        {scenarioData.criticalMonths.length > 0 && (
          <div className="pt-4 border-t">
            <h3 className="font-semibold mb-2">🎯 Key Insights</h3>
            <div className="space-y-2">
              {scenarioData.criticalMonths.slice(0, 3).map((critical, index) => (
                <div 
                  key={index}
                  className={`p-2 rounded text-sm ${
                    critical.impact === 'high' 
                      ? 'bg-green-50 border-l-4 border-green-500' 
                      : 'bg-blue-50 border-l-4 border-blue-500'
                  }`}
                >
                  <p className="font-medium">{formatMonth(critical.month)}</p>
                  <p className="text-xs text-gray-600">{critical.reason}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Runway Warning */}
        {scenarioData.runwayMonths !== null && scenarioData.runwayMonths < 6 && (
          <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded">
            <p className="text-sm font-semibold text-red-700">⚠️ Warning: Low Runway</p>
            <p className="text-xs text-red-600">
              At current {selectedScenario} scenario, you have only {scenarioData.runwayMonths} months of runway. 
              Consider adding new deals or reducing expenses.
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}
