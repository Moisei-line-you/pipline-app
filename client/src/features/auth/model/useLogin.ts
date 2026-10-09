import { useState, type ChangeEvent, type FormEvent } from 'react';
import { authApi } from '../api/authApi';
import { setToken } from '../../../shared/lib/authToken';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
        setServerError(null);

        if (!formData.email) {
            setServerError('Email is required');
            return;
        }
        if (!emailRegex.test(formData.email)) {
            setServerError('Not a valid email address');
            return;
        }
        if (!formData.password) {
            setServerError('Password is required');
            return;
        }

        setIsLoading(true);

        try {
            const response = await authApi.login(formData);
            setToken(response.token);
            onSuccess?.();
        } catch (err) {
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
