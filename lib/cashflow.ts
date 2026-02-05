// Cashflow projection calculations

import { Deal, Expense } from './types'
import { addMonths, startOfMonth, format, parseISO, isAfter, isBefore } from 'date-fns'

export type Scenario = 'best' | 'realistic' | 'worst'

export interface MonthlyProjection {
  month: string // ISO date string (first day of month)
  revenue: number
  expenses: number
  net: number
  balance: number
  deals: Array<{ id: string; name: string; amount: number }>
}

export interface ScenarioProjection {
  scenario: Scenario
  monthly: MonthlyProjection[]
  totalRevenue: number
  totalExpenses: number
  runwayMonths: number | null // null = infinite (never hits zero)
  criticalMonths: Array<{ month: string; reason: string; impact: 'high' | 'medium' | 'low' }>
}

export interface CashflowProjections {
  scenarios: {
    best: ScenarioProjection
    realistic: ScenarioProjection
    worst: ScenarioProjection
  }
  startingBalance: number
}

/**
 * Calculate probability multiplier for a scenario
 */
function getProbabilityMultiplier(scenario: Scenario, dealProbability: number): number {
  switch (scenario) {
    case 'best':
      return 1.0 // 100% conversion
    case 'realistic':
      return dealProbability / 100 // Use deal's probability
    case 'worst':
      return dealProbability >= 80 ? 1.0 : 0 // Only Very Likely (80%+) and Confirmed (100%)
    default:
      return 0
  }
}

/**
 * Calculate monthly expenses for a given month
 */
function calculateMonthlyExpenses(expenses: Expense[], month: Date): number {
  let total = 0

  for (const expense of expenses) {
    const startDate = parseISO(expense.startDate)
    const endDate = expense.endDate ? parseISO(expense.endDate) : null

    // Check if expense is active in this month
    if (isBefore(month, startDate)) continue
    if (endDate && isAfter(month, endDate)) continue

    // Calculate amount based on frequency
    switch (expense.frequency) {
      case 'monthly':
        total += expense.amount
        break
      case 'quarterly':
        // Only add if this month is a quarter boundary (Jan, Apr, Jul, Oct)
        if ([0, 3, 6, 9].includes(month.getMonth())) {
          total += expense.amount
        }
        break
      case 'yearly':
        // Only add if this month is January
        if (month.getMonth() === 0) {
          total += expense.amount
        }
        break
      case 'one_time':
        // Only add if this is the exact month
        if (format(month, 'yyyy-MM') === format(startDate, 'yyyy-MM')) {
          total += expense.amount
        }
        break
    }
  }

  return total
}

/**
 * Get revenue for a specific month across all deals
 */
function getMonthlyRevenue(
  deals: Deal[],
  month: Date,
  scenario: Scenario
): { revenue: number; deals: Array<{ id: string; name: string; amount: number }> } {
  const monthStr = format(month, 'yyyy-MM')
  let revenue = 0
  const contributingDeals: Array<{ id: string; name: string; amount: number }> = []

  for (const deal of deals) {
    // Skip lost deals
    if (deal.stage === 'lost') continue

    // Check if deal has timeline entries
    if (deal.timeline && deal.timeline.length > 0) {
      // Use timeline for monthly breakdown
      for (const entry of deal.timeline) {
        const entryMonth = format(parseISO(entry.month), 'yyyy-MM')
        if (entryMonth === monthStr) {
          const multiplier = getProbabilityMultiplier(scenario, deal.probability)
          const amount = entry.amount * multiplier
          if (amount > 0) {
            revenue += amount
            contributingDeals.push({ id: deal.id, name: deal.name, amount })
          }
        }
      }
    } else if (deal.expectedCloseDate) {
      // No timeline - use expectedCloseDate
      const closeMonth = format(parseISO(deal.expectedCloseDate), 'yyyy-MM')
      if (closeMonth === monthStr) {
        const multiplier = getProbabilityMultiplier(scenario, deal.probability)
        const amount = deal.amount * multiplier
        if (amount > 0) {
          revenue += amount
          contributingDeals.push({ id: deal.id, name: deal.name, amount })
        }
      }
    }
  }

  return { revenue, deals: contributingDeals }
}

/**
 * Calculate runway (months until balance hits zero)
 */
function calculateRunway(monthly: MonthlyProjection[]): number | null {
  for (let i = 0; i < monthly.length; i++) {
    if (monthly[i].balance <= 0) {
      return i
    }
  }
  // If balance never hits zero, return null (infinite runway)
  return null
}

/**
 * Identify critical months (high revenue expected)
 */
function identifyCriticalMonths(
  monthly: MonthlyProjection[],
  threshold: number = 500000 // ISK
): Array<{ month: string; reason: string; impact: 'high' | 'medium' | 'low' }> {
  const critical: Array<{ month: string; reason: string; impact: 'high' | 'medium' | 'low' }> = []

  for (const projection of monthly) {
    if (projection.revenue >= threshold) {
      const dealNames = projection.deals.map(d => d.name).join(', ')
      const impact = projection.revenue >= 1000000 ? 'high' : projection.revenue >= 500000 ? 'medium' : 'low'
      
      critical.push({
        month: projection.month,
        reason: `${projection.deals.length} deal${projection.deals.length > 1 ? 's' : ''}: ${dealNames}`,
        impact,
      })
    }
  }

  return critical
}

/**
 * Calculate cashflow projections for all scenarios
 */
export async function calculateCashflowProjections(
  deals: Deal[],
  expenses: Expense[],
  startingBalance: number = 1000000, // Default 1M ISK starting balance
  monthsToProject: number = 12
): Promise<CashflowProjections> {
  const scenarios: Scenario[] = ['best', 'realistic', 'worst']
  const projections: any = { scenarios: {} }

  for (const scenario of scenarios) {
    const monthly: MonthlyProjection[] = []
    let balance = startingBalance

    // Project for next N months
    for (let i = 0; i < monthsToProject; i++) {
      const month = startOfMonth(addMonths(new Date(), i))
      const monthStr = month.toISOString()

      // Calculate revenue and expenses
      const { revenue, deals: contributingDeals } = getMonthlyRevenue(deals, month, scenario)
      const expenseAmount = calculateMonthlyExpenses(expenses, month)
      const net = revenue - expenseAmount
      balance += net

      monthly.push({
        month: monthStr,
        revenue,
        expenses: expenseAmount,
        net,
        balance,
        deals: contributingDeals,
      })
    }

    // Calculate totals and runway
    const totalRevenue = monthly.reduce((sum, m) => sum + m.revenue, 0)
    const totalExpenses = monthly.reduce((sum, m) => sum + m.expenses, 0)
    const runwayMonths = calculateRunway(monthly)
    const criticalMonths = identifyCriticalMonths(monthly)

    projections.scenarios[scenario] = {
      scenario,
      monthly,
      totalRevenue,
      totalExpenses,
      runwayMonths,
      criticalMonths,
    }
  }

  projections.startingBalance = startingBalance

  return projections as CashflowProjections
}

/**
 * Get timeline data for chart (monthly revenue by stage)
 */
export interface TimelineData {
  month: string
  monthLabel: string
  confirmed: number
  veryLikely: number
  hot: number
  medium: number
  longShot: number
  total: number
  deals: Array<{ id: string; name: string; amount: number; stage: string }>
}

export async function calculateTimelineData(
  deals: Deal[],
  monthsToProject: number = 12
): Promise<TimelineData[]> {
  const timeline: TimelineData[] = []

  for (let i = 0; i < monthsToProject; i++) {
    const month = startOfMonth(addMonths(new Date(), i))
    const monthStr = month.toISOString()
    const monthLabel = format(month, 'MMM yyyy')

    const data: TimelineData = {
      month: monthStr,
      monthLabel,
      confirmed: 0,
      veryLikely: 0,
      hot: 0,
      medium: 0,
      longShot: 0,
      total: 0,
      deals: [],
    }

    // Calculate revenue by stage for this month
    for (const deal of deals) {
      if (deal.stage === 'lost') continue

      let dealAmount = 0

      // Check timeline entries
      if (deal.timeline && deal.timeline.length > 0) {
        for (const entry of deal.timeline) {
          const entryMonth = format(parseISO(entry.month), 'yyyy-MM')
          const currentMonth = format(month, 'yyyy-MM')
          if (entryMonth === currentMonth) {
            dealAmount += entry.amount
          }
        }
      } else if (deal.expectedCloseDate) {
        // No timeline - use expectedCloseDate
        const closeMonth = format(parseISO(deal.expectedCloseDate), 'yyyy-MM')
        const currentMonth = format(month, 'yyyy-MM')
        if (closeMonth === currentMonth) {
          dealAmount = deal.amount
        }
      }

      if (dealAmount > 0) {
        // Add to appropriate stage bucket
        switch (deal.stage) {
          case 'confirmed':
            data.confirmed += dealAmount
            break
          case 'very_likely':
            data.veryLikely += dealAmount
            break
          case 'hot':
            data.hot += dealAmount
            break
          case 'medium':
            data.medium += dealAmount
            break
          case 'long_shot':
            data.longShot += dealAmount
            break
        }

        data.total += dealAmount
        data.deals.push({
          id: deal.id,
          name: deal.name,
          amount: dealAmount,
          stage: deal.stage,
        })
      }
    }

    timeline.push(data)
  }

  return timeline
}
