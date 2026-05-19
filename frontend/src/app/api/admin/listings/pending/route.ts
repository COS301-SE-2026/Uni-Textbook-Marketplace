// app/api/admin/listings/pending/route.ts

import { NextResponse } from 'next/server'
import { MOCK_LISTINGS } from '../../../../../../lib/mockData'

export async function GET() {
    const pending = MOCK_LISTINGS.filter(l => l.status === 'PENDING')

    return NextResponse.json({
        listings: pending,
        total: pending.length,
    })
}
