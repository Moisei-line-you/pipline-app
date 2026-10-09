import { getToken } from '../lib/authToken';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

export class HttpError extends Error {
    status: number;

    constructor(message: string, status: number) {
        super(message);
        this.name = 'HttpError';
        this.status = status;
    }
}

function parseBody(text: string): { message?: string | string[] } | unknown {
    if (!text) return {};
    try {
        return JSON.parse(text);
    } catch {
        return {};
    }
}

export const httpClient = async <T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> => {
    const token = getToken();

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
    };

    let response: Response;
    try {
        response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });
    } catch {
        throw new HttpError('Cannot reach the server. Check that the API is running.', 0);
    }

    const text = await response.text();
    const data = parseBody(text) as { message?: string | string[] };

    if (!response.ok) {
        const errorMessage = Array.isArray(data.message)
            ? data.message.join(', ')
            : data.message || 'Request failed';

        throw new HttpError(errorMessage, response.status);
    }

    return (text ? parseBody(text) : undefined) as T;
};
