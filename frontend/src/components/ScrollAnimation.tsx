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

            },

            {
                threshold: 0.1,
                triggerOnce: true
            }
        )

        if (animeREF.current) {
            checkPageIntersect.observe(animeREF.current)
        }
        return () => checkPageIntersect.disconnect()
    }, [])

    return (
        <div ref={animeREF}
            className={`opacity-0 translate-y-8 transition-all duration-700 ease-out ${className}`}
            style={{ msTransitionDelay: `${delay}ms` }} >

                {children}

                <style jsx>{
                    `.animate-it-in {
                        opacity: 1 !important;
                        transform: translateY(0) !important;}
                        }`
                    }</style>
            </div>
    )
}
