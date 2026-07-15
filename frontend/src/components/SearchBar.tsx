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
    const input = useRef<HTMLInputElement>(null)

    const searchHandler = useCallback(() => {
        const cutQueryParam = query.trim()

        if(onSearch) {
            onSearch(cutQueryParam)

            return

        }
    })

    return ()
}