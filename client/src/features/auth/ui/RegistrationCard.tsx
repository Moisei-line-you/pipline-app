import React from 'react';
import { useRegister } from '../model/useRegister';
import './RegistrationCard.css';

interface RegisterCardProps {
    onSuccess?: () => void;
    onSwitchToLogin?: () => void;
}

export const RegisterCard: React.FC<RegisterCardProps> = ({
                                                              onSuccess,
                                                              onSwitchToLogin,
                                                          }) => {
    const {
        formData,
        errors,
        showPassword,
        isLoading,
        serverError,
        isSuccess,
        handleChange,
        togglePasswordVisibility,
        handleSubmit,
    } = useRegister();

    if (isSuccess) {
        return (
            <div className="auth-container">
                <h1 className="main-app-title">CardioGen</h1>
                <div className="auth-card">
                    <div className="success-message">Registration succeeded!</div>
                    <button
                        type="button"
                        className="submit-btn"
                        style={{ marginTop: '16px' }}
                        onClick={onSuccess}
                    >
                        Go to File Processor →
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <h1 className="main-app-title">CardioGen</h1>

            <div className="auth-card">
                {/* Шапка карточки с кнопкой Назад */}
                <div className="auth-card-header">
                    <h2 className="auth-title">Registration</h2>
                </div>

                <p className="auth-description">Please fill in the details to continue</p>

                {serverError && <div className="server-error">{serverError}</div>}

                <form onSubmit={handleSubmit} className="auth-form" noValidate>
                    {/* Username */}
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            name="userName"
                            placeholder="Enter your username"
                            value={formData.userName}
                            onChange={handleChange}
                            className={errors.userName ? 'input-error' : ''}
                            disabled={isLoading}
                        />
                        {errors.userName && <span className="error-text">{errors.userName}</span>}
                    </div>

                    {/* Email */}
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            className={errors.email ? 'input-error' : ''}
                            disabled={isLoading}
                        />
                        {errors.email && <span className="error-text">{errors.email}</span>}
                    </div>

                    {/* Password */}
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <div className="password-wrapper">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                name="password"
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={handleChange}
                                className={errors.password ? 'input-error' : ''}
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={togglePasswordVisibility}
                                disabled={isLoading}
                            >
                                {showPassword ? 'Hide' : 'Show'}
                            </button>
                        </div>
                        {errors.password && <span className="error-text">{errors.password}</span>}
                    </div>

                    {/* Confirm Password */}
                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            placeholder="Confirm your password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className={errors.confirmPassword ? 'input-error' : ''}
                            disabled={isLoading}
                        />
                        {errors.confirmPassword && (
                            <span className="error-text">{errors.confirmPassword}</span>
                        )}
                    </div>

                    <button type="submit" className="submit-btn" disabled={isLoading}>
                        {isLoading ? 'Creating account...' : 'Register'}
                    </button>
                </form>

                {/* Переход на страницу входа */}
                <p className="auth-switch-text">
                    Already have an account?{' '}
                    <button type="button" onClick={onSwitchToLogin} className="auth-switch-link">
                        Log in
                    </button>
                </p>
            </div>
        </div>
    );
};