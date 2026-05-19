// app/api/admin/listings/[id]/reject/route.ts

import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const body = await req.json()
    // Mock: just return success
    return NextResponse.json({
        message: `Listing ${params.id} rejected (mock)`,
        reason: body.reason,
    })
}
