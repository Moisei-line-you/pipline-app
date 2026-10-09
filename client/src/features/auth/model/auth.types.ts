export interface RegisterFormData {
    userName: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export interface RegisterDto {
    name: string;
    email: string;
    password: string;
}

export interface FormErrors {
    userName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
}

export interface LoginDto {
    email: string;
    password: string;
}

export interface User {
    id: string;
    username: string;
    email: string;
}

export interface AuthResponse {
    user: User;
    token: string;
}
