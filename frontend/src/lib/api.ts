"use client";

// This is the BASE API client, one file that knows how to talk to our backend
// Every other API file (auth.api.ts, listings.api.ts, etc.) will builds on top of this

export interface ApiError {
    message: string;
    status: number;
}


const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!BASE_URL) {
    throw new Error('NEXT_PUBLIC_API_URL is not set in .env.local file');
}


async function request<T>(
    method: string,
    path: string,
    body?: unknown,
): Promise<T> {
    const response = await fetch(`${BASE_URL}${path}`, {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',

        body: body ? JSON.stringify(body) : undefined,
    });

    let data: unknown;
    try {
        data = await response.json();
    } catch {
        data = null;
    }

    if (!response.ok) {

        const errorData = data as { message?: string | string[] };

        const message = Array.isArray(errorData?.message)
            ? errorData.message.join(', ')
            : errorData?.message ?? 'Something went wrong. Please try again.';

        const error: ApiError = {
            message,
            status: response.status,
        };

        throw error;
    }

    return data as T;
}

/* HTTP method helpers */

export const api = {
    get: <T>(path: string) =>
        request<T>('GET', path),

    post: <T>(path: string, body?: unknown) =>
        request<T>('POST', path, body),

    patch: <T>(path: string, body?: unknown) =>
        request<T>('PATCH', path, body),

    delete: <T>(path: string) =>
        request<T>('DELETE', path),
};