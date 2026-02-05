'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { PipelineSummary } from '@/components/pipeline-summary'
import { DealList } from '@/components/deal-list'
import { AddDealModal } from '@/components/add-deal-modal'
import { getDeals, getPipelineSummary } from '@/app/actions/deals'
import { Deal } from '@/lib/types'

export function DashboardContent() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [dealsResult, summaryResult] = await Promise.all([
        getDeals({ includeLost: false }),
        getPipelineSummary(),
      ])

      if (dealsResult.success && dealsResult.data) {
        setDeals(dealsResult.data)
      }

      if (summaryResult.success && summaryResult.data) {
        setSummary(summaryResult.data)
      }
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  if (isLoading) {
    return (
      <div className="container mx-auto p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">BCash</h1>
          <p className="text-muted-foreground mt-1">
            Sales Pipeline & Cashflow Management
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)} size="lg">
          + Add Deal
        </Button>
      </div>

      {/* Pipeline Summary */}
      {summary && (
        <PipelineSummary
          summary={summary.summary}
          totalWeighted={summary.totalWeighted}
        />
      )}

      {/* Deal List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Active Deals ({deals.length})</h2>
        <DealList deals={deals} onRefresh={loadData} />
      </div>

      {/* Add Deal Modal */}
      <AddDealModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onSuccess={() => {
          setShowAddModal(false)
          loadData()
        }}
      />
    </div>
  )
}
