
export interface ApiError {
    message: string;
    status: number;
}


const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!BASE_URL) {
    throw new Error('NEXT_PUBLIC_API_URL is not set in .env.local file');
}
export default BASE_URL;
function getAuthToken(): string | null {
    if (typeof globalThis.window === 'undefined') return null;
    return localStorage.getItem('token');
}

async function tryRefresh(): Promise<boolean> {
    
    try {
        const res = await fetch(`${BASE_URL}/auth/refresh`,{
            method: 'POST',
            credentials: 'include',
        });
        return res.ok;
    } catch {
        return false;
    }
}

async function request<T>(
    method: string,
    path: string,
    body?: unknown,
    isRetry = false
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

        if(response.status === 401 && !isRetry && path !== '/auth/refresh' && path !== '/auth/login'){
            const refreshed = await tryRefresh();

            if(refreshed){
                return request<T>(method,path,body,true);
            }

           if(typeof window !== 'undefined' && window.location.pathname !== '/auth/login') {
                window.location.href = '/auth/login';
           }
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
    get: <T>(path: string) =>
        request<T>('GET', path),

    post: <T>(path: string, body?: unknown) =>
        request<T>('POST', path, body),

    patch: <T>(path: string, body?: unknown) =>
        request<T>('PATCH', path, body),

    delete: <T>(path: string) =>
        request<T>('DELETE', path),
};