'use client'

import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { TimelineData } from '@/lib/cashflow'

interface TimelineTableProps {
  data: TimelineData[]
}

function formatISK(amount: number): string {
  return new Intl.NumberFormat('is-IS', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

const stageLabels: Record<string, string> = {
  confirmed: 'Confirmed',
  very_likely: 'Very Likely',
  hot: 'Hot',
  medium: 'Medium',
  long_shot: 'Long Shot',
}

export function TimelineTable({ data }: TimelineTableProps) {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold">Revenue Timeline Table</h2>
          <p className="text-sm text-muted-foreground">
            Monthly revenue breakdown with deal details
          </p>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Month</TableHead>
                <TableHead className="text-right">Total Revenue</TableHead>
                <TableHead>Deals</TableHead>
                <TableHead>Breakdown by Stage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((monthData) => {
                // Skip months with no revenue
                if (monthData.total === 0) return null

                // Group deals by stage
                const dealsByStage: Record<string, Array<{ name: string; amount: number }>> = {}
                monthData.deals.forEach((deal) => {
                  if (!dealsByStage[deal.stage]) {
                    dealsByStage[deal.stage] = []
                  }
                  dealsByStage[deal.stage].push({
                    name: deal.name,
                    amount: deal.amount,
                  })
                })

                return (
                  <TableRow key={monthData.month}>
                    <TableCell className="font-medium">
                      {monthData.monthLabel}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatISK(monthData.total)} ISK
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {monthData.deals.map((deal, idx) => (
                          <div key={idx} className="text-sm">
                            <span className="font-medium">{deal.name}</span>
                            <span className="text-muted-foreground ml-2">
                              ({formatISK(deal.amount)} ISK)
                            </span>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {Object.entries(dealsByStage).map(([stage, deals]) => {
                          const stageTotal = deals.reduce((sum, d) => sum + d.amount, 0)
                          return (
                            <div key={stage} className="text-sm">
                              <span className="font-medium text-xs uppercase text-muted-foreground">
                                {stageLabels[stage] || stage}:
                              </span>
                              <span className="ml-2">{formatISK(stageTotal)} ISK</span>
                            </div>
                          )
                        })}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>

        {data.filter(d => d.total > 0).length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No revenue projected for the next {data.length} months
          </div>
        )}
      </div>
    </Card>
  )
}
