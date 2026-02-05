'use server'

import * as data from '@/lib/data'
import { calculateCashflowProjections, calculateTimelineData } from '@/lib/cashflow'

export async function getCashflowProjections(
  startingBalance: number = 1000000,
  monthsToProject: number = 12
) {
  try {
    // Load deals and expenses
    const deals = await data.getAllDeals()
    const expenses = await data.getAllExpenses()

    // Load timeline and history for each deal if not already present
    for (const deal of deals) {
      // Only load from separate file if not already embedded
      if (!deal.timeline || deal.timeline.length === 0) {
        deal.timeline = await data.getDealTimeline(deal.id)
      }
      if (!deal.history || deal.history.length === 0) {
        deal.history = await data.getDealHistory(deal.id)
      }
    }

    // Calculate projections
    const projections = await calculateCashflowProjections(
      deals,
      expenses,
      startingBalance,
      monthsToProject
    )

    return { success: true, data: projections }
  } catch (error) {
    console.error('Failed to calculate cashflow projections:', error)
    return { success: false, error: 'Failed to calculate cashflow projections' }
  }
}

export async function getTimelineData(monthsToProject: number = 12) {
  try {
    // Load deals
    const deals = await data.getAllDeals()

    // Load timeline for each deal if not already present
    for (const deal of deals) {
      // Only load from separate file if not already embedded
      if (!deal.timeline || deal.timeline.length === 0) {
        deal.timeline = await data.getDealTimeline(deal.id)
      }
    }

    // Calculate timeline data
    const timeline = await calculateTimelineData(deals, monthsToProject)

    return { success: true, data: timeline }
  } catch (error) {
    console.error('Failed to calculate timeline data:', error)
    return { success: false, error: 'Failed to calculate timeline data' }
  }
}
