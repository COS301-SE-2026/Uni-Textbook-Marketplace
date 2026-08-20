
export interface ApiError {
    message: string;
    status: number;
}


const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!BASE_URL) {
    throw new Error('NEXT_PUBLIC_API_URL is not set in .env.local file');
}
let OnUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandle(handler: () => void){
    OnUnauthorized = handler;
}

async function request<T>(
    method: string,
    path: string,
    body?: unknown,
): Promise<T> {

    const headers: HeadersInit = {
        'Content-type': 'application/json',
    };

    const response = await fetch(`${BASE_URL}${path}`, {
        method,
        headers,
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

        if(response.status == 401){
            OnUnauthorized?.();
        }

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
    get: <T>(path: string): Promise<T> =>
        request<T>('GET', path),

    post: <T>(path: string, body?: unknown): Promise<T> =>
        request<T>('POST', path, body),

    patch: <T>(path: string, body?: unknown): Promise<T> =>
        request<T>('PATCH', path, body),

    delete: <T>(path: string): Promise<T> =>
        request<T>('DELETE', path),
};

export { BASE_URL }

export default api;

export function buildQuery<T extends object>(params: T){

    const search = new URLSearchParams();

    Object.entries(params).forEach(([key,value]) => {
        if(value !== undefined && value !== null){
            search.append(key, String(value));
        }
    });
    return search.toString();
}