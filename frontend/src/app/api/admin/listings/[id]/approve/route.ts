// app/api/admin/listings/[id]/approve/route.ts

import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    
    // Mock: just return success
    return NextResponse.json({
        message: `Listing ${id} approved (mock)`,
    })
}