import {useState} from "react";
import type {FormErrors, RegisterFormData} from './auth.types';
import {authApi} from '../api/authApi';

export const useRegister = () => {
    const [formData, setFormData] = useState<RegisterFormData>({
        userName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState<boolean>(false);

    const validate = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.userName) {
            newErrors.userName = 'Required';
        } else if (formData.userName.length < 6) {
            newErrors.userName = 'Must be at least 6 characters long';
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Not valid email address';
        }

        if (!formData.password) {
            newErrors.password = 'required';
        } else if (formData.password.length < 12) {
            newErrors.password = 'Must be at least 12 characters long';
        }

        if (formData.confirmPassword != formData.password) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const {name, value} = e.target;
            setFormData((prev) => ({...prev, [name]: value}));

            if (errors[name as keyof FormErrors]) {
                setErrors((prev) => ({...prev, [name]: undefined}));
            }
        };

        const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

        const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            setServerError(null);

            if (!validate()) return;

            setIsLoading(true);
            try {
                const {confirmPassword, ...registerDto} = formData;
                await authApi.register(registerDto);
                setIsSuccess(true);
            } catch (err: unknown) {
                if (err instanceof Error) {
                    setServerError(err.message);
                } else {
                    setServerError('Uknown server error');
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