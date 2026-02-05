'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { PipelineSummary } from '@/components/pipeline-summary'
import { DealList } from '@/components/deal-list'
import { AddDealModal } from '@/components/add-deal-modal'
import { TimelineChart } from '@/components/timeline-chart'
import { TimelineTable } from '@/components/timeline-table'
import { CashflowChart } from '@/components/cashflow-chart'
import { ExpenseList } from '@/components/expense-list'
import { AddExpenseModal } from '@/components/add-expense-modal'
import { getDeals, getPipelineSummary } from '@/app/actions/deals'
import { getExpenses } from '@/app/actions/expenses'
import { getCashflowProjections, getTimelineData } from '@/app/actions/cashflow'
import { Deal, Expense } from '@/lib/types'
import { CashflowProjections, TimelineData } from '@/lib/cashflow'

export function DashboardContent() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [timeline, setTimeline] = useState<TimelineData[]>([])
  const [cashflow, setCashflow] = useState<CashflowProjections | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showAddDealModal, setShowAddDealModal] = useState(false)
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [dealsResult, summaryResult, expensesResult, timelineResult, cashflowResult] = await Promise.all([
        getDeals({ includeLost: false }),
        getPipelineSummary(),
        getExpenses(),
        getTimelineData(12),
        getCashflowProjections(1000000, 12),
      ])

      if (dealsResult.success && dealsResult.data) {
        setDeals(dealsResult.data)
      }

      if (summaryResult.success && summaryResult.data) {
        setSummary(summaryResult.data)
      }

      if (expensesResult.success && expensesResult.data) {
        setExpenses(expensesResult.data)
      }

      if (timelineResult.success && timelineResult.data) {
        setTimeline(timelineResult.data)
      }

      if (cashflowResult.success && cashflowResult.data) {
        setCashflow(cashflowResult.data)
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
        <Button onClick={() => setShowAddDealModal(true)} size="lg">
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

      {/* Timeline Chart */}
      {timeline.length > 0 && (
        <TimelineChart data={timeline} />
      )}

      {/* Timeline Table */}
      {timeline.length > 0 && (
        <TimelineTable data={timeline} />
      )}

      {/* Cashflow Chart */}
      {cashflow && (
        <CashflowChart projections={cashflow} />
      )}

      {/* Expenses Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Expenses ({expenses.length})</h2>
          <Button onClick={() => setShowAddExpenseModal(true)} variant="outline">
            + Add Expense
          </Button>
        </div>
        <ExpenseList 
          expenses={expenses} 
          onEdit={(expense) => {
            setEditingExpense(expense)
            setShowAddExpenseModal(true)
          }}
          onRefresh={loadData}
        />
      </div>

      {/* Deal List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Active Deals ({deals.length})</h2>
        <DealList deals={deals} onRefresh={loadData} />
      </div>

      {/* Add Deal Modal */}
      <AddDealModal
        open={showAddDealModal}
        onOpenChange={setShowAddDealModal}
        onSuccess={() => {
          setShowAddDealModal(false)
          loadData()
        }}
      />

      {/* Add/Edit Expense Modal */}
      <AddExpenseModal
        open={showAddExpenseModal}
        onOpenChange={(open) => {
          setShowAddExpenseModal(open)
          if (!open) setEditingExpense(null)
        }}
        expense={editingExpense || undefined}
        onSuccess={() => {
          setShowAddExpenseModal(false)
          setEditingExpense(null)
          loadData()
        }}
      />
    </div>
  )
}
