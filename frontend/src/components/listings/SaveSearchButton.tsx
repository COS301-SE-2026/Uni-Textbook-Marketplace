'use client'

import { useState } from 'react'

import { Bookmark, BookmarkCheck, Loader2 } from 'lucide-react'
import { createSavedSearch, Filters } from '@/lib/saved-searches.api'

interface SaveSearchButtonProps {

  filters: Filters

  onSave?: () => void

  className?: string
}

export default function SaveSearchButton({ 

  filters, 
  onSave,

  className = '' 
}: SaveSearchButtonProps) {

  const [savingFilter, setIsSavFilter] = useState(false)

  const [isFilterSaved, setFilterSave] = useState(false)


  const [error, setError] = useState<string | null>(null)


  const filterFound = Object.values(filters).some(value => 

    value && value.toString().trim() !== ''
  )

  const performFilterSave = async () => {


    if (!filterFound) {


      setError('Apply at minimum one filter before saving')

      setTimeout(() => setError(null), 3000)


      return
    }

    setIsSavFilter(true)
    setError(null)

    try {

      await createSavedSearch(filters)
      setFilterSave(true)


      if (onSave) onSave()


      setTimeout(() => setFilterSave(false), 3000)
    } catch (err) {

      console.error('Failed to save search', err)
      setError('Failed. Please try again.')

      setTimeout(() => setError(null), 3000)
    } finally {

        
      setIsSavFilter(false)
    }
  }

  return (

     <div className="space-y-1">


      <button
        onClick={performFilterSave}

        disabled={savingFilter || isFilterSaved}

        className={`flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          isFilterSaved
            ? 'bg-green-100 text-green-700 border border-green-300'
            : filterFound
            ? 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        } ${className}`}
      >


        {savingFilter ? (
          <>

            <Loader2 size={16} className="animate-spin" />
            Saving...
          </>
        ) : isFilterSaved ? (
          <>
            <BookmarkCheck size={16} />
            Saved!
          </>

        ) : (
          <>
            <Bookmark size={16} />
            Save this search
          </>


        )}
      </button>
      
      {error && (
        <p className="text-xs text-red-500 text-center">{error}</p>
      )}
      


      {!filterFound && !error && (
        
        <p className="text-xs text-gray-400 text-center">
          Apply filters to save this search
        </p>

      )}

    </div>
    
  )
}