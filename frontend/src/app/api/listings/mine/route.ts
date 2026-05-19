// app/api/listings/mine/route.ts

import { NextResponse } from 'next/server'
import { MY_MOCK_LISTINGS } from '../../../../../lib/mockData'

export async function GET() {
    return NextResponse.json({
        listings: MY_MOCK_LISTINGS,
        total: MY_MOCK_LISTINGS.length,
    })
}
