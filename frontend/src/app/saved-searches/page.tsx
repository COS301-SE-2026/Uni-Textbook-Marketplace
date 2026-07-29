'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui'
import { Trash2, Bookmark, Search, ArrowLeft } from 'lucide-react'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { getSavedSearches, deleteSavedSearch, SavedSearch, Filters } from '@/lib/saved-searches.api'

export default function SavedSearchesPage() {


  const routAttr = useRouter()

  const [searches, setFilterSearches] = useState<SavedSearch[]>([])

  const [loading, setLoading] = useState(true)

  const [deleting, setDeletFeat] = useState<string | null>(null)

  const loadSearches = async () => {


    try {

      const data = await getSavedSearches();

console.log("Returned from API:", data);
console.log("Is array?", Array.isArray(data));

setFilterSearches(data);
    } catch (error) {

      console.error('Failed to load saved searches', error)
    } finally {
      setLoading(false)

    }
  }

  useEffect(() => {
    let loadOnbourd = true

    
    const id = setTimeout(() => {


      if (!loadOnbourd) return

      loadSearches()
    }, 0)

    return () => {

      loadOnbourd = false

      clearTimeout(id)
    }
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

  const searchPerform = (filters: Filters) => {

    const params = new URLSearchParams()
    
    if (filters.search) params.set('search', filters.search)

    if (filters.faculty) params.set('faculty', filters.faculty)
    if (filters.moduleCode) params.set('moduleCode', filters.moduleCode)

    if (filters.edition) params.set('edition', filters.edition)

    if (filters.priceMin) params.set('priceMin', filters.priceMin)

    if (filters.priceMax) params.set('priceMax', filters.priceMax)

    if (filters.condition) params.set('condition', filters.condition)
    if (filters.annotationLevel) params.set('annotationLevel', filters.annotationLevel)

    routAttr.push(`/listings?${params.toString()}`)
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

  const filterPackaged = (filters: Filters): string => {

    const parts: string[] = []

    if (filters.search) parts.push(`"${filters.search}"`)
    if (filters.faculty) parts.push(`Faculty: ${filters.faculty}`)


    if (filters.moduleCode) parts.push(`Module: ${filters.moduleCode}`)

    if (filters.edition) parts.push(`Edition: ${filters.edition}`)

    if (filters.priceMin || filters.priceMax) {

      const price = []
      if (filters.priceMin) price.push(`R${filters.priceMin}`)


      if (filters.priceMax) price.push(`R${filters.priceMax}`)

      parts.push(`Price: ${price.join(' - ')}`)

    }


    if (filters.condition) parts.push(`Condition: ${filters.condition}`)

    if (filters.annotationLevel) parts.push(`Annotations: ${filters.annotationLevel}`)


    
    return parts.length > 0 ? parts.join(' • ') : 'All textbooks'
  }

  return (

    <ProtectedRoute>


      <div className="container-content py-8">
        <div className="mb-6">

         <Button
        variant="secondary"
        onClick={() => routAttr.back()}
        className="mb-2"
    >
        <ArrowLeft size={16} className="mr-1" />
        Back
    </Button>

          


          <div className="flex items-center justify-between">
            <div>

              <h1>Saved Searches</h1>

              <p className="text-gray-500 text-sm">
                Your saved filter combinations for quick access
              </p>
            </div>


            <button
              type="button"
              onClick={() => routAttr.push('/listings')}
              className="text-sm text-blue-600 hover:underline flex items-center gap-1"
            >
              <Search size={16} />
              New Search
            </button>


          </div>

        </div>

        {loading ? (

          <div className="space-y-4">

            {[1, 2, 3].map((i) => (
              <div key={i} className="card animate-pulse">

                <div className="flex items-center justify-between">
                  <div className="space-y-2 flex-1">

                    <div className="h-5 bg-gray-200 rounded w-3/4" />
                    
                    <div className="h-4 bg-gray-100 rounded w-1/2" />

                  </div>

                  <div className="h-8 w-8 bg-gray-200 rounded" />
                </div>

              </div>
            ))}
          </div>

        ) : searches.length === 0 ? (

          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <Bookmark size={48} className="mb-4" strokeWidth={1} />

            <p className="text-lg font-medium">No saved searches</p>
            <p className="text-sm mt-1">
              Apply filters on the browse page and click SAVE THIS SEARCH
            </p>

            <button
              type="button"
              onClick={() => routAttr.push('/listings')}
              className="mt-4 text-blue-600 hover:underline text-sm"
            >
              Go to Browse
            </button>

          </div>
        ) : (
          <div className="space-y-3">

            {searches.map((search) => (

              <div
                key={search.id}
                className="card hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => searchPerform(search.filter_json)}

              >
                <div className="flex items-center justify-between">


                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">


                      <Bookmark size={16} className="text-blue-500 flex-shrink-0" />
                      <p className="font-medium text-sm truncate">
                        {filterPackaged(search.filter_json)}
                      </p>
                    </div>

                    <p className="text-xs text-gray-400 mt-1">
                      Saved {dateStandard(search.created_at)}
                    </p>
                  </div>


                  <div className="flex items-center gap-2 flex-shrink-0 ml-4">

                    <span className="text-xs text-blue-600 hover:underline">
                      Apply
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteApplic(search.id)
                      }}
                      disabled={deleting === search.id}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                      aria-label="Delete saved search"
                    >
                      {deleting === search.id ? (
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>

                  </div>

                </div>
              </div>

            ))}
          </div>
        )}
      </div>


    </ProtectedRoute>
  )
}