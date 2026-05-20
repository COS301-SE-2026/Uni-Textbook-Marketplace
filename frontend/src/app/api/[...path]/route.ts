// src/app/api/[...path]/route.ts
//
// This file acts as a proxy between the frontend and backend.
// Every request to /api/* gets forwarded to the NestJS backend.
//
// Why this exists:
// - Cookies must be on the same origin (localhost:3003) to be sent with requests
// - Next.js rewrites() strips Set-Cookie headers when forwarding responses
// - This route manually copies Set-Cookie headers so cookies are stored and sent correctly

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:3002';

console.log('BACKEND_URL:', BACKEND_URL);
console.log('Incoming path:',);

async function handler(req: NextRequest) {
    
    const path = req.nextUrl.pathname.replace('/api', '');
    const url = `${BACKEND_URL}${path}${req.nextUrl.search}`;

    
    const backendRes = await fetch(url, {
        method: req.method,
        headers: {
            'Content-Type': 'application/json',
            cookie: req.headers.get('cookie') ?? '',
        },
        body: req.method !== 'GET' ? await req.text() : undefined,
    });

    
    const data = await backendRes.text();

    const response = new NextResponse(data, {
        status: backendRes.status,
        headers: {
            'Content-Type': 'application/json',
        },
    });

    const setCookieHeaders = backendRes.headers.getSetCookie();
    setCookieHeaders.forEach((cookie) => {
        response.headers.append('Set-Cookie', cookie);
    });

    return response;
}

export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const DELETE = handler;
export const OPTIONS = handler;
