'use client'

import { useParams } from 'next/navigation'
import dynamic from 'next/dynamic'

const AILiveInterview = dynamic(() => import('@/components/AILiveInterview'), {
  ssr: false,
})

export default function MockInterviewPage() {
  const params = useParams()
  const companyId = (params.companyId as string).toLowerCase()
  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') || 'test-user' : 'test-user'

  return <AILiveInterview companyId={companyId} userId={userId} role="Software Engineer" />
}
