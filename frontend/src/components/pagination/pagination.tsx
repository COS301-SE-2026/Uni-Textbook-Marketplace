"use client"

import { usePathname, useSearchParams } from "next/navigation"
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination'

interface PaginationMeta {

    total: number
    page: number
    limit: number
    pages: number

}

export function NotificationPagination({ meta }: { meta: PaginationMeta }) {

    const pathname = usePathname()
    const searchParams = useSearchParams()
    const currentPage = Number(meta.page)
    const totalPage = Number(meta.pages)

    const createPageURL = (pageNumber: number) => {

        const params = new URLSearchParams(searchParams)
        params.set("page", pageNumber.toString())
        return `${pathname}?${params.toString()}`

    }


    return (

        <Pagination>
            <PaginationContent>

                <PaginationItem>
                    <PaginationPrevious
                        href={createPageURL(currentPage - 1)}
                        className={currentPage <= 1 ? "pointer-events-none" : ""}
                    />
                </PaginationItem>

                {Array.from({ length: totalPage }, (_, i) => i + 1).map((p) => (
                    <PaginationItem key={p}>
                        <PaginationLink
                            href={createPageURL(p)}
                            isActive={currentPage === p}
                        >
                            {p}
                        </PaginationLink>
                    </PaginationItem>
                ))}

                <PaginationItem>
                    <PaginationNext
                        href={createPageURL(currentPage + 1)}
                        className={currentPage >= totalPage ? "pointer-events-none opacity-50" : ""}
                    />
                </PaginationItem>

            </PaginationContent>
        </Pagination>
    )
}