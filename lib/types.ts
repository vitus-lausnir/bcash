// Core types for BCash

export type Stage = 'confirmed' | 'very_likely' | 'hot' | 'medium' | 'long_shot' | 'lost'

export interface StageConfig {
  stage: Stage
  defaultProbability: number // 0-100
  displayOrder: number
  color: string
}

export interface Deal {
  id: string
  name: string
  stage: Stage
  
  // Financial
  amount: number // ISK (whole numbers, no decimals)
  probability: number // 0-100, defaults to stage probability
  
  // Timeline
  expectedCloseDate?: string // ISO date string
  actualCloseDate?: string // ISO date string
  
  // Metadata
  notes?: string
  lostReason?: string
  source?: string // Lead source
  contactPerson?: string
  
  // Relations
  timeline: DealTimeline[]
  history: DealHistory[]
  
  // Timestamps
  createdAt: string // ISO timestamp
  updatedAt: string // ISO timestamp
}

export interface DealTimeline {
  id: string
  dealId: string
  month: string // ISO date (first day of month)
  amount: number
  type: 'invoice' | 'recurring' | 'milestone'
  notes?: string
}

export interface DealHistory {
  id: string
  dealId: string
  fromStage?: Stage
  toStage: Stage
  notes?: string
  changedAt: string // ISO timestamp
}

export interface Expense {
  id: string
  name: string
  amount: number // Monthly cost in ISK
  frequency: 'one_time' | 'monthly' | 'quarterly' | 'yearly'
  startDate: string // ISO date
  endDate?: string // ISO date, null for ongoing
  category?: string
  notes?: string
  createdAt: string
  updatedAt: string
}
