import { NextRequest, NextResponse } from 'next/server'

const BASE_URL = process.env.BACKEND_URL

export async function GET(
        _req: NextRequest,
        context: { params: Promise<{ id: string }> }
    ) {
        try {
            const { id } = await context.params;
            const res = await fetch(`${BASE_URL}/listings/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                cache: 'no-store',
            })

            const data = await res.json()
            console.log("testing get by ID:")
            console.log('GET BY ID RESPONSE DATA:', data)

            if (!res.ok) {
                return NextResponse.json(
                    {
                        error: 'Backend error',
                        status: res.status,
                        details: data,
                    },
                    { status: res.status }
                )
            }

            return NextResponse.json(data)
        } catch (err) {
            return NextResponse.json(
                {
                    error: 'Backend unreachable',
                    details: err instanceof Error ? err.message : String(err),
                },
                { status: 500 }
            )
        }
}