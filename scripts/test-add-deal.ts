// Quick test script to add a sample deal

import * as data from '../lib/data'

async function testAddDeal() {
  console.log('Adding sample deal...')
  
  const deal = await data.createDeal({
    name: 'Arctic Fish Q2',
    stage: 'very_likely',
    amount: 1480000,
    probability: 80,
    expectedCloseDate: '2026-04-01',
    notes: 'Very likely per Bjorn (2026-02-05)',
    contactPerson: 'Bjorn',
  })
  
  console.log('✓ Deal created:', deal)
  console.log('\nFetching all deals...')
  
  const allDeals = await data.getAllDeals()
  console.log(`✓ Total deals: ${allDeals.length}`)
  
  for (const d of allDeals) {
    console.log(`  - ${d.name}: ${d.amount} ISK (${d.stage})`)
  }
}

testAddDeal().catch(console.error)
