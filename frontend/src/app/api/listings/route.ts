// app/api/listings/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { MOCK_LISTINGS } from '../../../../lib/mockData'

export async function GET(req: NextRequest) {
    const { searchParams } = req.nextUrl

    const faculty         = searchParams.get('faculty')
    const moduleCode      = searchParams.get('moduleCode')
    const edition         = searchParams.get('edition')
    const priceMin        = searchParams.get('priceMin')
    const priceMax        = searchParams.get('priceMax')
    const condition       = searchParams.get('condition')
    const annotationLevel = searchParams.get('annotationLevel')

    let results = MOCK_LISTINGS.filter(l => l.status === 'APPROVED')

    if (faculty)
        results = results.filter(l => l.faculty === faculty)

    if (moduleCode)
        results = results.filter(l =>
            l.moduleCode.toLowerCase().includes(moduleCode.toLowerCase())
        )

    if (edition)
        results = results.filter(l =>
            l.edition.toLowerCase().startsWith(edition.toLowerCase())
        )

    if (priceMin)
        results = results.filter(l => l.price >= Number(priceMin))

    if (priceMax)
        results = results.filter(l => l.price <= Number(priceMax))

    if (condition)
        results = results.filter(l => l.condition === condition)

    if (annotationLevel)
        results = results.filter(l => l.annotationLevel === annotationLevel)

    return NextResponse.json({
        listings: results,
        total: results.length,
    })
}

export async function POST(req: NextRequest) {
    // In real app: parse FormData, save to DB, return new listing
    // For mock, just return success
    return NextResponse.json(
        { message: 'Listing created (mock)', id: 'new-mock-id' },
        { status: 201 }
    )
}
