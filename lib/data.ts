// Data access layer - JSON file storage

import fs from 'fs/promises'
import path from 'path'
import { Deal, DealTimeline, DealHistory, Expense, StageConfig, Stage } from './types'
import { nanoid } from 'nanoid'

const DATA_DIR = path.join(process.cwd(), 'data')

// Helper: Generate ID
function generateId(prefix: string = 'item'): string {
  return `${prefix}_${nanoid()}`
}

// Helper: Read JSON file
async function readJSON<T>(filename: string): Promise<T[]> {
  const filePath = path.join(DATA_DIR, filename)
  try {
    const content = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(content)
  } catch (error) {
    // File doesn't exist yet, return empty array
    return []
  }
}

// Helper: Write JSON file
async function writeJSON<T>(filename: string, data: T[]): Promise<void> {
  const filePath = path.join(DATA_DIR, filename)
  await fs.mkdir(DATA_DIR, { recursive: true })
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8')
}

// ============================================================================
// DEALS
// ============================================================================

export async function getAllDeals(): Promise<Deal[]> {
  return readJSON<Deal>('deals.json')
}

export async function getDealById(id: string): Promise<Deal | null> {
  const deals = await getAllDeals()
  return deals.find(d => d.id === id) || null
}

export async function createDeal(input: Omit<Deal, 'id' | 'createdAt' | 'updatedAt' | 'timeline' | 'history'>): Promise<Deal> {
  const deals = await getAllDeals()
  const stageConfig = await getStageConfig(input.stage)
  
  const deal: Deal = {
    ...input,
    id: generateId('deal'),
    probability: input.probability ?? stageConfig?.defaultProbability ?? 50,
    timeline: [],
    history: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  
  deals.push(deal)
  await writeJSON('deals.json', deals)
  
  // Create history entry
  await createDealHistory({
    dealId: deal.id,
    toStage: deal.stage,
  })
  
  return deal
}

export async function updateDeal(id: string, updates: Partial<Omit<Deal, 'id' | 'createdAt' | 'timeline' | 'history'>>): Promise<Deal | null> {
  const deals = await getAllDeals()
  const index = deals.findIndex(d => d.id === id)
  
  if (index === -1) return null
  
  const oldDeal = deals[index]
  const updatedDeal = {
    ...oldDeal,
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  
  deals[index] = updatedDeal
  await writeJSON('deals.json', deals)
  
  // If stage changed, create history entry
  if (updates.stage && updates.stage !== oldDeal.stage) {
    await createDealHistory({
      dealId: id,
      fromStage: oldDeal.stage,
      toStage: updates.stage,
    })
  }
  
  return updatedDeal
}

export async function deleteDeal(id: string): Promise<boolean> {
  const deals = await getAllDeals()
  const filtered = deals.filter(d => d.id !== id)
  
  if (filtered.length === deals.length) return false // Not found
  
  await writeJSON('deals.json', filtered)
  
  // Also delete timeline and history entries
  const timeline = await readJSON<DealTimeline>('timeline.json')
  await writeJSON('timeline.json', timeline.filter(t => t.dealId !== id))
  
  const history = await readJSON<DealHistory>('history.json')
  await writeJSON('history.json', history.filter(h => h.dealId !== id))
  
  return true
}

// ============================================================================
// DEAL TIMELINE
// ============================================================================

export async function getDealTimeline(dealId: string): Promise<DealTimeline[]> {
  const timeline = await readJSON<DealTimeline>('timeline.json')
  return timeline.filter(t => t.dealId === dealId)
}

export async function createDealTimeline(input: Omit<DealTimeline, 'id'>): Promise<DealTimeline> {
  const timeline = await readJSON<DealTimeline>('timeline.json')
  
  const entry: DealTimeline = {
    ...input,
    id: generateId('timeline'),
  }
  
  timeline.push(entry)
  await writeJSON('timeline.json', timeline)
  return entry
}

export async function updateDealTimeline(id: string, updates: Partial<Omit<DealTimeline, 'id' | 'dealId'>>): Promise<DealTimeline | null> {
  const timeline = await readJSON<DealTimeline>('timeline.json')
  const index = timeline.findIndex(t => t.id === id)
  
  if (index === -1) return null
  
  timeline[index] = { ...timeline[index], ...updates }
  await writeJSON('timeline.json', timeline)
  return timeline[index]
}

export async function deleteDealTimeline(id: string): Promise<boolean> {
  const timeline = await readJSON<DealTimeline>('timeline.json')
  const filtered = timeline.filter(t => t.id !== id)
  
  if (filtered.length === timeline.length) return false
  
  await writeJSON('timeline.json', filtered)
  return true
}

// ============================================================================
// DEAL HISTORY
// ============================================================================

export async function getDealHistory(dealId: string): Promise<DealHistory[]> {
  const history = await readJSON<DealHistory>('history.json')
  return history.filter(h => h.dealId === dealId).sort((a, b) => 
    new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime()
  )
}

export async function createDealHistory(input: Omit<DealHistory, 'id' | 'changedAt'>): Promise<DealHistory> {
  const history = await readJSON<DealHistory>('history.json')
  
  const entry: DealHistory = {
    ...input,
    id: generateId('history'),
    changedAt: new Date().toISOString(),
  }
  
  history.push(entry)
  await writeJSON('history.json', history)
  return entry
}

// ============================================================================
// STAGE CONFIG
// ============================================================================

export async function getAllStageConfigs(): Promise<StageConfig[]> {
  return readJSON<StageConfig>('stage-config.json')
}

export async function getStageConfig(stage: Stage): Promise<StageConfig | null> {
  const configs = await getAllStageConfigs()
  return configs.find(c => c.stage === stage) || null
}

// ============================================================================
// EXPENSES
// ============================================================================

export async function getAllExpenses(): Promise<Expense[]> {
  return readJSON<Expense>('expenses.json')
}

export async function createExpense(input: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Promise<Expense> {
  const expenses = await getAllExpenses()
  
  const expense: Expense = {
    ...input,
    id: generateId('expense'),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  
  expenses.push(expense)
  await writeJSON('expenses.json', expenses)
  return expense
}

export async function updateExpense(id: string, updates: Partial<Omit<Expense, 'id' | 'createdAt'>>): Promise<Expense | null> {
  const expenses = await getAllExpenses()
  const index = expenses.findIndex(e => e.id === id)
  
  if (index === -1) return null
  
  expenses[index] = {
    ...expenses[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  
  await writeJSON('expenses.json', expenses)
  return expenses[index]
}

export async function deleteExpense(id: string): Promise<boolean> {
  const expenses = await getAllExpenses()
  const filtered = expenses.filter(e => e.id !== id)
  
  if (filtered.length === expenses.length) return false
  
  await writeJSON('expenses.json', filtered)
  return true
}
