'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function DemoRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the demo-recommendations page
    router.push('/demo-recommendations')
  }, [router])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <h2 className="text-lg mt-4">Redirecting to Course Recommendation Demo...</h2>
    </div>
  )
}