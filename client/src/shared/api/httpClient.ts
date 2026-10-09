const API_BASE_URL = 'http://localhost:3000/api';

export const httpClient = async <T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> => {
    const token = localStorage.getItem('token');

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = Array.isArray(errorData.message)
            ? errorData.message.join(', ')
            : errorData.message || 'Произошла ошибка при запросе';

        throw new Error(errorMessage);
    }

    return response.json();
};