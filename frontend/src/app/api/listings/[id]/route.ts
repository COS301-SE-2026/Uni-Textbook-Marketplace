// app/api/listings/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { MOCK_LISTINGS } from '../../../../../lib/mockData'

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const listing = MOCK_LISTINGS.find(l => l.id === id)

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
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    
    // Mock: just return success
    return NextResponse.json({ message: `Listing ${id} deleted (mock)` })
}