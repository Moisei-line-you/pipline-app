import { useState, type ChangeEvent, type FormEvent } from 'react';
import type { FormErrors, RegisterFormData } from './auth.types';
import { authApi } from '../api/authApi';
import { setToken } from '../../../shared/lib/authToken';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const useRegister = () => {
    const [formData, setFormData] = useState<RegisterFormData>({
        userName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    const validate = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.userName) {
            newErrors.userName = 'Required';
        } else if (formData.userName.length < 6) {
            newErrors.userName = 'Must be at least 6 characters long';
        }

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Not a valid email address';
        }

        if (!formData.password) {
            newErrors.password = 'Required';
        } else if (formData.password.length < 10) {
            newErrors.password = 'Must be at least 10 characters long';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.confirmPassword !== formData.password) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        if (errors[name as keyof FormErrors]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
        if (serverError) setServerError(null);
    };

    const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setServerError(null);

        if (!validate()) return;

        setIsLoading(true);
        try {
            const response = await authApi.register({
                name: formData.userName,
                email: formData.email,
                password: formData.password,
            });
            setToken(response.token);
            setIsSuccess(true);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setServerError(err.message);
            } else {
                setServerError('Unknown server error');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return {
        formData,
        errors,
        showPassword,
        isLoading,
        serverError,
        isSuccess,
        handleChange,
        togglePasswordVisibility,
        handleSubmit,
    };
};
