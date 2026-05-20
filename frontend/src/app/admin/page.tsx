'use client'

import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui";

export default function AdminPage() {
  const router = useRouter()

  return (
    <div className="container-content py-12">
      <h1 className="text-3xl font-bold text-[#000f2b] mb-2">Admin Dashboard</h1>
      <Button
        variant="secondary"
        onClick={() => router.push('/admin/review')}
      >
        Review Listings
      </Button>
    </div>
  )
}