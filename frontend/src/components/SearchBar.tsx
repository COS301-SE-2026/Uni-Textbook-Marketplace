'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

interface SearchBarProperts {

    onSearch?: (query: string) => void
    initialQuery?: string
    placeholder?: string
    className?: string
    delayedBounceFEAT?: number

}

export default function SearchBar({

    onSearch,
    initialQuery = '',

    placeholder = 'Search by title, author, ISBN, or module...',
    className = '',

    delayedBounceFEAT = 300,

}: SearchBarProperts) {

    const routerAttr = useRouter()

    const searchParam = useSearchParams()

    const [query, setQuery] = useState(initialQuery || searchParam?.get('search') || '')
    
    const [isFocusedOn, setIsFocusedOn] = useState(false)
    const refInsert = useRef<HTMLInputElement>(null)

    const referenceBounceTimer = useRef<NodeJS.Timeout | null>(null)
    const rendersItemFirst = useRef(true)

    useEffect(() => {
        return () => {

            if (referenceBounceTimer.current) {

                clearTimeout(referenceBounceTimer.current)

            }
        }
    }, [])

    useEffect(() => {

        const paramSQuery = searchParam?.get('search') ?? ''

        if (paramSQuery !== query && !rendersItemFirst.current) {

            Promise.resolve().then(() => setQuery(paramSQuery))
        }
    }, [searchParam, query])


    const bouncedFEAT = useCallback((searchQuery: string) => {

        if (referenceBounceTimer.current) {

            clearTimeout(referenceBounceTimer.current) 
        }
        referenceBounceTimer.current = setTimeout(() => {

            const cutQueryBounds = searchQuery.trim()

            if(onSearch) {
                onSearch(cutQueryBounds)

                return 
            }
            const restrictions = new URLSearchParams(searchParam?.toString() || '')
            
            if (cutQueryBounds) {
                restrictions.set('search', cutQueryBounds)

            } else {
                restrictions.delete('search')
            }

            const nextURL = `${window.location.pathname}?${restrictions.toString()}`

            routerAttr.push(nextURL, { scroll: false })


        }, delayedBounceFEAT) 
    }, [onSearch, routerAttr, searchParam, delayedBounceFEAT]) 


    const inputDynamics = (e: React.ChangeEvent<HTMLInputElement>) => {

        const nextQry = e.target.value
            setQuery(nextQry)

            if(rendersItemFirst.current) {
                return

            }

            bouncedFEAT(nextQry)
    }


    const searchHandler = useCallback(() => {

        if(referenceBounceTimer.current) {

            clearTimeout(referenceBounceTimer.current)

        }
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

        if (referenceBounceTimer.current) {
            clearTimeout(referenceBounceTimer.current)

        }

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

    const searchKEY = (e: React.KeyboardEvent<HTMLInputElement>) => {

        if(e.key === 'Enter') {
            e.preventDefault()
            if(referenceBounceTimer.current) {

                clearTimeout(referenceBounceTimer.current)
            }

            searchHandler()
        }
    }

    return (
        <div className={`flex justify-center ${className}`}>

            <div className={`flex items-center w-full max-w-2xl bg-white rounded-full overflow-hidden shadow-lg transition-shadow duration-200 ${


                isFocusedOn ? 'ring-2 ring-[#00B4D8] ring-offset-1' : ''}`}>

                    <div className="flex-1 flex items-center gap-2 px-4 py-2">
                        <Search size={18} className="text-[#4B4F58] flex-shrink-0" />

                        <input ref={refInsert}
                            type="text"
                            value={query}
                            onChange={inputDynamics}
                            onKeyDown={searchKEY}
                            onFocus={() => setIsFocusedOn(true)}
                            onBlur={() => setIsFocusedOn(false)}
                            placeholder={placeholder}
                            className="w-full text-sm text-[#3a3a3a] placeholder-[#4B4F58]
                                border-none outline-none bg-transparent py-1.5"
                            aria-label="Search textbooks" />
                        {query && (

                            <button onClick={searchClear}

                                className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                                aria-label="Clear search" >

                                    <X size={16} />

                                </button>
                        )}
                    </div>

                    <button onClick={searchHandler}

                        className="bg-[#00B4D8] text-[#000f2b] font-semi-bold text-sm px-6 py-2.5
                            hover:bg-[#0096B4] transition-colors h-full whitespace-nowrap">

                                SEARCH
                            </button>
                </div>
        </div>
    )
}