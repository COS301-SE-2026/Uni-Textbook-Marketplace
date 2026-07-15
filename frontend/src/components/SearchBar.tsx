'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

interface SearchBarProperts {

    onSearch?: (query: string) => void
    initialQuery?: string
    placeholder?: string
    className?: string

}

export default function SearchBar({

    onSearch,
    initialQuery = '',
    placeholder = 'Search by title, author, ISBN, or module...',
    className = '',

}: SearchBarProperts) {

    const routerAttr = useRouter()
    const searchParam = useSearchParams()

    const [query, setQuery] = useState(initialQuery || searchParam?.get('search') || '')
    const [isFocusedOn, setIsFocusedOn] = useState(false)
    const refInsert = useRef<HTMLInputElement>(null)

    useEffect(() => {

        const searchBounds = searchParam?.get('search')

            if (searchBounds !== undefined && searchBounds !== query) {
                setQuery(searchBounds)
            }
        
    }, [searchParam])

    const searchHandler = useCallback(() => {
        const cutQueryParam = query.trim()

        if(onSearch) {
            onSearch(cutQueryParam)

            return

        }

        const bounds = new URLSearchParams(searchParam?.toString() || '')

        if (cutQueryParam) {

            bounds.set('search', cutQueryParam)
        } else {
            bounds.delete('search')
        }

        const updatedURL = `${window.location.pathname}?${bounds.toString()}`

        routerAttr.push(updatedURL, { scroll: false })
    }, [query, onSearch, routerAttr, searchParam])

    const searchClear = useCallback(() => {
        setQuery('')

        if (refInsert.current) {
            refInsert.current.focus()

        }
        if (onSearch) {
            onSearch('')
        } else {
            const boundsForSearch = new URLSearchParams(searchParam?.toString() || '')
            boundsForSearch.delete('search')
            const nextURL = `${window.location.pathname}?${boundsForSearch.toString()}`

            routerAttr.push(nextURL, { scroll: false })
        }
    }, [onSearch, routerAttr, searchParam])

    return (
        <div className="{`flex justify-center ${className}`}">
            <div className="{`flex items-center w-full max-w-2xl bg-white rounded-full overflow-hidden shadow-lg transition-shadow duration-200 ${
                isFocused ? 'ring-2 ring-[#00B4D8] ring-offset-1' : ''}`}">
                    
                </div>
        </div>
    )
}