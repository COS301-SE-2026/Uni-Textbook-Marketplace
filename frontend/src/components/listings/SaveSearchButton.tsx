'use client'

import { useState } from 'react'
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
      setIsSavFilter(true)


      if (onSave) onSave()


      setTimeout(() => setIsSavFilter(false), 3000)
    } catch (err) {

      console.error('Failed to save search', err)
      setError('Failed. Please try again.')

      setTimeout(() => setError(null), 3000)
    } finally {

        
      setIsSavFilter(false)
    }
  }

  return (
    
  )
}