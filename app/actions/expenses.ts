'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import * as data from '@/lib/data'

const expenseSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  amount: z.number().positive('Amount must be positive'),
  frequency: z.enum(['one_time', 'monthly', 'quarterly', 'yearly']),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  category: z.string().optional(),
  notes: z.string().optional(),
})

export async function createExpense(input: z.infer<typeof expenseSchema>) {
  try {
    const validated = expenseSchema.parse(input)
    const expense = await data.createExpense(validated as any)
    
    revalidatePath('/dashboard')
    return { success: true, data: expense }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message }
    }
    return { success: false, error: 'Failed to create expense' }
  }
}

export async function updateExpense(expenseId: string, input: Partial<z.infer<typeof expenseSchema>>) {
  try {
    const expense = await data.updateExpense(expenseId, input as any)
    
    if (!expense) {
      return { success: false, error: 'Expense not found' }
    }
    
    revalidatePath('/dashboard')
    return { success: true, data: expense }
  } catch (error) {
    return { success: false, error: 'Failed to update expense' }
  }
}

export async function deleteExpense(expenseId: string) {
  try {
    const success = await data.deleteExpense(expenseId)
    
    if (!success) {
      return { success: false, error: 'Expense not found' }
    }
    
    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to delete expense' }
  }
}

export async function getExpenses() {
  try {
    const expenses = await data.getAllExpenses()
    return { success: true, data: expenses }
  } catch (error) {
    return { success: false, error: 'Failed to fetch expenses' }
  }
}
