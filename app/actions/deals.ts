'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import * as data from '@/lib/data'
import { Deal, Stage } from '@/lib/types'

const createDealSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  stage: z.enum(['very_likely', 'hot', 'medium', 'long_shot', 'confirmed', 'lost']),
  amount: z.number().positive('Amount must be positive'),
  expectedCloseDate: z.string().optional(),
  notes: z.string().optional(),
  source: z.string().optional(),
  contactPerson: z.string().optional(),
  probability: z.number().min(0).max(100).optional(),
})

export async function createDeal(input: z.infer<typeof createDealSchema>) {
  try {
    const validated = createDealSchema.parse(input)
    const deal = await data.createDeal(validated as any)
    
    revalidatePath('/dashboard')
    return { success: true, data: deal }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message }
    }
    return { success: false, error: 'Failed to create deal' }
  }
}

export async function updateDeal(dealId: string, input: Partial<z.infer<typeof createDealSchema>>) {
  try {
    const deal = await data.updateDeal(dealId, input as any)
    
    if (!deal) {
      return { success: false, error: 'Deal not found' }
    }
    
    revalidatePath('/dashboard')
    return { success: true, data: deal }
  } catch (error) {
    return { success: false, error: 'Failed to update deal' }
  }
}

export async function deleteDeal(dealId: string) {
  try {
    const success = await data.deleteDeal(dealId)
    
    if (!success) {
      return { success: false, error: 'Deal not found' }
    }
    
    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to delete deal' }
  }
}

export async function updateDealStage(dealId: string, newStage: Stage) {
  try {
    const stageConfig = await data.getStageConfig(newStage)
    
    await data.updateDeal(dealId, {
      stage: newStage,
      probability: stageConfig?.defaultProbability ?? 50,
    })
    
    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to update stage' }
  }
}

export async function getDeals(filters?: {
  stages?: Stage[]
  includeLost?: boolean
}) {
  try {
    let deals = await data.getAllDeals()
    
    if (filters?.stages) {
      deals = deals.filter(d => filters.stages!.includes(d.stage))
    }
    
    if (filters?.includeLost === false) {
      deals = deals.filter(d => d.stage !== 'lost')
    }
    
    // Load timeline and history for each deal
    for (const deal of deals) {
      deal.timeline = await data.getDealTimeline(deal.id)
      deal.history = await data.getDealHistory(deal.id)
    }
    
    return { success: true, data: deals }
  } catch (error) {
    return { success: false, error: 'Failed to fetch deals' }
  }
}

export async function getPipelineSummary() {
  try {
    const result = await getDeals({ includeLost: false })
    
    if (!result.success || !result.data) {
      return { success: false, error: 'Failed to fetch deals' }
    }
    
    const deals = result.data
    
    const summary = deals.reduce((acc, deal) => {
      const stage = deal.stage
      if (!acc[stage]) {
        acc[stage] = { count: 0, total: 0, weighted: 0 }
      }
      acc[stage].count++
      acc[stage].total += deal.amount
      acc[stage].weighted += deal.amount * (deal.probability / 100)
      return acc
    }, {} as Record<string, { count: number; total: number; weighted: number }>)
    
    const totalWeighted = Object.values(summary).reduce((sum, s) => sum + s.weighted, 0)
    
    return { success: true, data: { summary, totalWeighted } }
  } catch (error) {
    return { success: false, error: 'Failed to calculate summary' }
  }
}
