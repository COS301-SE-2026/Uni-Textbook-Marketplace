// app/api/listings/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { MOCK_LISTINGS } from '../../../../../lib/mockData'

export async function GET(
    _req: NextRequest,
    { params }: { params: { id: string } }
) {
    const listing = MOCK_LISTINGS.find(l => l.id === params.id)

    if (!listing) {
        return NextResponse.json(
            { error: 'Listing not found' },
            { status: 404 }
        )
    }

    return NextResponse.json(listing)
}

export async function DELETE(
    _req: NextRequest,
    { params }: { params: { id: string } }
) {
    // Mock: just return success
    return NextResponse.json({ message: `Listing ${params.id} deleted (mock)` })
}
