'use client'

import { Card } from '@/components/ui/card'
import { Stage } from '@/lib/types'

interface PipelineSummaryProps {
  summary: Record<string, { count: number; total: number; weighted: number }>
  totalWeighted: number
}

const stageConfig: Record<Stage, { label: string; color: string }> = {
  confirmed: { label: 'Confirmed', color: 'text-green-600' },
  very_likely: { label: 'Very Likely', color: 'text-blue-600' },
  hot: { label: 'Hot', color: 'text-orange-600' },
  medium: { label: 'Medium', color: 'text-purple-600' },
  long_shot: { label: 'Long Shot', color: 'text-gray-600' },
  lost: { label: 'Lost', color: 'text-red-600' },
}

function formatISK(amount: number): string {
  return new Intl.NumberFormat('is-IS', {
    style: 'decimal',
    minimumFractionDigits: 0,
  }).format(amount)
}

function formatMillions(amount: number): string {
  const millions = amount / 1000000
  return millions >= 1 
    ? `${millions.toFixed(1)}M`
    : `${(amount / 1000).toFixed(0)}K`
}

export function PipelineSummary({ summary, totalWeighted }: PipelineSummaryProps) {
  const stages: Stage[] = ['confirmed', 'very_likely', 'hot', 'medium', 'long_shot']
  
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold">Pipeline Summary</h2>
          <p className="text-3xl font-bold text-primary mt-2">
            {formatISK(totalWeighted)} ISK
          </p>
          <p className="text-sm text-muted-foreground mt-1">Total Weighted Value</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 pt-4 border-t">
          {stages.map((stage) => {
            const data = summary[stage] || { count: 0, total: 0, weighted: 0 }
            const config = stageConfig[stage]
            
            return (
              <div key={stage} className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${config.color.replace('text-', 'bg-')}`} />
                  <p className="text-sm font-medium">{config.label}</p>
                </div>
                <p className={`text-2xl font-bold ${config.color}`}>
                  {formatMillions(data.weighted)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {data.count} deal{data.count !== 1 ? 's' : ''}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}
