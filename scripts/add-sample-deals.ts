// Add sample deals for testing

import * as data from '../lib/data'

async function addSampleDeals() {
  const sampleDeals = [
    {
      name: 'Coripharma',
      stage: 'hot' as const,
      amount: 1000000,
      probability: 60,
      expectedCloseDate: '2026-05-01',
      notes: 'Positive meeting, awaiting proposal review',
      contactPerson: 'Sarah',
    },
    {
      name: 'Ístak',
      stage: 'long_shot' as const,
      amount: 500000,
      probability: 20,
      expectedCloseDate: '2026-06-01',
      notes: 'Initial conversation, need follow-up',
      contactPerson: 'Jon',
    },
    {
      name: 'Idnmark Pharmaceuticals',
      stage: 'medium' as const,
      amount: 750000,
      probability: 40,
      expectedCloseDate: '2026-05-15',
      notes: 'Second meeting scheduled',
      contactPerson: 'Anna',
    },
    {
      name: 'Valitor Q2',
      stage: 'very_likely' as const,
      amount: 680000,
      probability: 80,
      expectedCloseDate: '2026-04-15',
      notes: 'Verbal commitment received',
      contactPerson: 'Magnus',
    },
  ]

  console.log('Adding sample deals...\n')

  for (const dealData of sampleDeals) {
    const deal = await data.createDeal(dealData)
    console.log(`✓ Created: ${deal.name} (${deal.stage}, ${deal.amount} ISK)`)
  }

  console.log('\n✓ All sample deals added!')
  
  const allDeals = await data.getAllDeals()
  console.log(`\nTotal deals in system: ${allDeals.length}`)
}

addSampleDeals().catch(console.error)
