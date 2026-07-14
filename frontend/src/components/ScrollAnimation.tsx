'use client'

import { useEffect, useRef, ReactNode } from 'react'

interface ScrollAnimationProps {
    
    children: ReactNode
    className?: string
    delay?: number

}

export default function ScrollAnimation({
    
    children,
    className = '',
    delay = 0
}: ScrollAnimationProps) {

    const animeREF = useRef<HTMLDivElement>(null)


    useEffect(() => {
        const checkPageIntersect = new IntersectionObserver(

            ([enterSection]) => {

                if (enterSection.isIntersecting) {
                    enterSection.target.classList.add('animate-it-in')
                }
            }
        )
    })
}
