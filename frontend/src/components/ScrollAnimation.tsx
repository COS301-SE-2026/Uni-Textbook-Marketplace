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
}: {
    children: ReactNode; className?: string; delay?: number }) {



    const animeREF = useRef<HTMLDivElement>(null)


    useEffect(() => {

        const validScrollItem = animeREF.current

        if(!validScrollItem) return

        const checkPageIntersect = new IntersectionObserver(

            ([enterSection]) => {

                if (enterSection.isIntersecting) {

                    validScrollItem.classList.add('animate-it-in')
                    checkPageIntersect.unobserve(validScrollItem)
                }

            },

            {
                threshold: 0.1
            }
        )

        checkPageIntersect.observe(validScrollItem)
            
        
        return () => checkPageIntersect.disconnect()
    }, [])

    return (
        <div ref={animeREF}
            className={`opacity-0 translate-y-8 transition-all duration-700 ease-out ${className}`}
            style={{ transitionDelay: `${delay}ms` }} >

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
