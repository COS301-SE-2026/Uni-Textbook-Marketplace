'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSavedSearches, deleteSavedSearch, SavedSearch, Filters } from '@/lib/saved-searches.api'

export default function SavedSearchesPage() {


  const routAttr = useRouter()

  const [searches, setFilterSearches] = useState<SavedSearch[]>([])

  const [loading, setLoading] = useState(true)

  const [deleting, setDeletFeat] = useState<string | null>(null)

  const loadSearches = async () => {


    try {

      const data = await getSavedSearches()
      setFilterSearches(data)
    } catch (error) {

      console.error('Failed to load saved searches', error)
    } finally {
      setLoading(false)

    }
  }

  useEffect(() => {
    loadSearches()
  }, [])


  const deleteApplic = async (id: string) => {


    if (!confirm('Are you sure you want to delete this saved search?')) return

    setDeletFeat(id)


    try {


      await deleteSavedSearch(id)
      setFilterSearches(prev => prev.filter(s => s.id !== id))


    } catch (error) {


      console.error('Failed to delete saved search', error)
      alert('Failed to delete search. Please try again.')

    } finally {
      setDeletFeat(null)
    }
  }

  const dateStandard = (dateString: string) => {

    const date = new Date(dateString)

    return new Intl.DateTimeFormat('en-ZA', {


      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',

    }).format(date)

  }

  return ()
}