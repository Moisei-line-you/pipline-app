import { useState, type ChangeEvent, type FormEvent } from 'react';
import { authApi } from '../api/authApi';

export const useLogin = (onSuccess?: () => void) => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (serverError) setServerError(null);
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setServerError(null);

        try {
            const response = await authApi.login(formData);
            localStorage.setItem('token', response.token);

            if (onSuccess) {
                onSuccess();
            }
        } catch (err) {
            // Безопасная извлечение ошибки без использования any
            if (err instanceof Error) {
                setServerError(err.message);
            } else {
                setServerError('Invalid email or password');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return {
        formData,
        isLoading,
        serverError,
        handleChange,
        handleSubmit,
    };
};