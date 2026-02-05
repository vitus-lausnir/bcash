import { Suspense } from 'react'
import { DashboardContent } from './dashboard-content'

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <DashboardContent />
    </Suspense>
  )
}
