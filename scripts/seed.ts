// Seed script - initializes data directory with empty files and stage config

import fs from 'fs/promises'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')

const stageConfig = [
  { stage: 'confirmed', defaultProbability: 100, displayOrder: 1, color: '#10b981' },
  { stage: 'very_likely', defaultProbability: 80, displayOrder: 2, color: '#3b82f6' },
  { stage: 'hot', defaultProbability: 60, displayOrder: 3, color: '#f59e0b' },
  { stage: 'medium', defaultProbability: 40, displayOrder: 4, color: '#8b5cf6' },
  { stage: 'long_shot', defaultProbability: 20, displayOrder: 5, color: '#6b7280' },
  { stage: 'lost', defaultProbability: 0, displayOrder: 6, color: '#ef4444' },
]

async function seed() {
  await fs.mkdir(DATA_DIR, { recursive: true })
  
  // Initialize all data files
  await fs.writeFile(path.join(DATA_DIR, 'stage-config.json'), JSON.stringify(stageConfig, null, 2))
  await fs.writeFile(path.join(DATA_DIR, 'deals.json'), JSON.stringify([], null, 2))
  await fs.writeFile(path.join(DATA_DIR, 'timeline.json'), JSON.stringify([], null, 2))
  await fs.writeFile(path.join(DATA_DIR, 'history.json'), JSON.stringify([], null, 2))
  await fs.writeFile(path.join(DATA_DIR, 'expenses.json'), JSON.stringify([], null, 2))
  
  console.log('✓ Data directory initialized')
  console.log(`✓ Created ${DATA_DIR}`)
  console.log('✓ Files created:')
  console.log('  - stage-config.json (6 stages)')
  console.log('  - deals.json (empty)')
  console.log('  - timeline.json (empty)')
  console.log('  - history.json (empty)')
  console.log('  - expenses.json (empty)')
}

seed().catch(console.error)
