export interface RegisterFormData{
    userName:string;
    email:string;
    password:string;
    confirmPassword:string;
}

export type RegisterDto = Omit<RegisterFormData, "confirmPassword">

export interface FormErrors {
    userName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
}

export interface AuthResponse {
    user: {
        id: string;
        username: string;
        email: string;
    };
    token: string;
}