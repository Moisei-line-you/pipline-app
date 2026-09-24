// import type {AuthResponse, RegisterDto} from "../features/auth/types/auth.types.ts";

// export const authApi = {
//     async register(data: RegisterDto): Promise<AuthResponse> {
//         const response = await fetch('/api/auth/register', {
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify(data)
//         });
//
//         if (!response.ok) {
//             const errorData: Error = await response.json().catch(() => ({}));
//             throw new Error(errorData.message || 'Error creating register');
//         }
//         return response.json();
//     },
// };

import type { RegisterDto, AuthResponse } from '../model/auth.types';

export const authApi = {
    async register(data: RegisterDto): Promise<AuthResponse> {
        // Имитируем задержку сети 1.5 секунды
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Имитация успешного ответа
        console.log('Данные успешно "отправлены" на сервер:', data);

        return {
            user: {
                id: '1',
                username: data.userName,
                email: data.email,
            },
            token: 'fake-jwt-token-123456',
        };
    },
};