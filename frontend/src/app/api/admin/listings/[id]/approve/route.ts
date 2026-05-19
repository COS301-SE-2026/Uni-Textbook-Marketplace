// app/api/admin/listings/[id]/approve/route.ts

import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
    _req: NextRequest,
    { params }: { params: { id: string } }
) {
    // Mock: just return success
    return NextResponse.json({
        message: `Listing ${params.id} approved (mock)`,
    })
}
