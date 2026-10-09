import { httpClient } from '../../../shared/api/httpClient';
import type { AuthResponse, RegisterDto, LoginDto } from '../model/auth.types';

export const authApi = {
    register: (data: RegisterDto) =>
        httpClient<AuthResponse>('/auth/register', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    login: (data: LoginDto) =>
        httpClient<AuthResponse>('/auth/login', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
};