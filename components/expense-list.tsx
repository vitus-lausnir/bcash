'use client'

import { Expense } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2 } from 'lucide-react'
import { deleteExpense } from '@/app/actions/expenses'
import { useState } from 'react'

interface ExpenseListProps {
  expenses: Expense[]
  onEdit: (expense: Expense) => void
  onRefresh: () => void
}

function formatISK(amount: number): string {
  return new Intl.NumberFormat('is-IS', {
    style: 'decimal',
    minimumFractionDigits: 0,
  }).format(amount)
}

function formatDate(isoDate: string): string {
  const date = new Date(isoDate)
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

const frequencyLabels = {
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  yearly: 'Yearly',
  one_time: 'One Time',
}

export function ExpenseList({ expenses, onEdit, onRefresh }: ExpenseListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return

    setDeletingId(id)
    try {
      const result = await deleteExpense(id)
      if (result.success) {
        onRefresh()
      } else {
        alert(result.error || 'Failed to delete expense')
      }
    } catch (error) {
      alert('Failed to delete expense')
    } finally {
      setDeletingId(null)
    }
  }

  if (expenses.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No expenses yet</p>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {expenses.map((expense) => (
        <Card key={expense.id} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold">{expense.name}</h3>
                <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                  {frequencyLabels[expense.frequency]}
                </span>
                {expense.category && (
                  <span className="text-xs text-muted-foreground">
                    {expense.category}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                <span>{formatISK(expense.amount)} ISK</span>
                <span>
                  {formatDate(expense.startDate)}
                  {expense.endDate && ` - ${formatDate(expense.endDate)}`}
                  {!expense.endDate && ' - Ongoing'}
                </span>
              </div>
              {expense.notes && (
                <p className="text-sm text-muted-foreground mt-2">{expense.notes}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(expense)}
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(expense.id)}
                disabled={deletingId === expense.id}
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
