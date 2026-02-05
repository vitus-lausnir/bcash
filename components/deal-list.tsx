'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Deal, Stage } from '@/lib/types'
import { AddDealModal } from './add-deal-modal'
import { deleteDeal } from '@/app/actions/deals'

interface DealListProps {
  deals: Deal[]
  onRefresh?: () => void
}

const stageConfig: Record<Stage, { label: string; color: string; bgColor: string }> = {
  confirmed: { label: 'Confirmed', color: 'text-green-700', bgColor: 'bg-green-100' },
  very_likely: { label: 'Very Likely', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  hot: { label: 'Hot', color: 'text-orange-700', bgColor: 'bg-orange-100' },
  medium: { label: 'Medium', color: 'text-purple-700', bgColor: 'bg-purple-100' },
  long_shot: { label: 'Long Shot', color: 'text-gray-700', bgColor: 'bg-gray-100' },
  lost: { label: 'Lost', color: 'text-red-700', bgColor: 'bg-red-100' },
}

function formatISK(amount: number): string {
  return new Intl.NumberFormat('is-IS', {
    style: 'decimal',
    minimumFractionDigits: 0,
  }).format(amount) + ' ISK'
}

export function DealList({ deals, onRefresh }: DealListProps) {
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const handleDelete = async (dealId: string) => {
    if (!confirm('Are you sure you want to delete this deal?')) {
      return
    }

    setIsDeleting(dealId)
    try {
      const result = await deleteDeal(dealId)
      if (result.success) {
        onRefresh?.()
      } else {
        alert(result.error || 'Failed to delete deal')
      }
    } catch (error) {
      alert('Failed to delete deal')
    } finally {
      setIsDeleting(null)
    }
  }

  if (deals.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">No deals yet. Click "Add Deal" to get started!</p>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {deals.map((deal) => {
          const stageInfo = stageConfig[deal.stage]
          return (
            <Card
              key={deal.id}
              className="p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setEditingDeal(deal)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg truncate">{deal.name}</h3>
                    <Badge className={`${stageInfo.bgColor} ${stageInfo.color}`}>
                      {stageInfo.label}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {formatISK(deal.amount)}
                    </span>
                    <span>•</span>
                    <span>{deal.probability}% probability</span>
                    {deal.expectedCloseDate && (
                      <>
                        <span>•</span>
                        <span>{format(new Date(deal.expectedCloseDate), 'MMM yyyy')}</span>
                      </>
                    )}
                  </div>

                  {deal.contactPerson && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      Contact: {deal.contactPerson}
                    </div>
                  )}

                  {deal.notes && (
                    <div className="mt-2 text-sm text-muted-foreground line-clamp-2">
                      {deal.notes}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingDeal(deal)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(deal.id)}
                    disabled={isDeleting === deal.id}
                  >
                    {isDeleting === deal.id ? 'Deleting...' : 'Delete'}
                  </Button>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {editingDeal && (
        <AddDealModal
          open={!!editingDeal}
          onOpenChange={(open) => !open && setEditingDeal(null)}
          deal={editingDeal}
          onSuccess={() => {
            setEditingDeal(null)
            onRefresh?.()
          }}
        />
      )}
    </>
  )
}
