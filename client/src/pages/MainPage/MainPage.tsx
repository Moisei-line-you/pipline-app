import React, { useState } from 'react';
import { LoginCard, RegisterCard } from '../../features/auth';
import { FileProcessorCard } from '../../features/file-processing';
import {VariantDashboard} from "../../features/variant-dashboard";

type Page = 'login' | 'register' | 'process' | 'dashboard';

export const MainPage: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<Page>('login');

    const handleLogout = () => {
        localStorage.removeItem('token');
        setCurrentPage('login');
    };

    return (
        <main>
            {currentPage === 'login' && (
                <LoginCard
                    onSuccess={() => setCurrentPage('process')}
                    onSwitchToRegister={() => setCurrentPage('register')}
                />
            )}

            {currentPage === 'register' && (
                <RegisterCard
                    onSuccess={() => setCurrentPage('process')}
                    onSwitchToLogin={() => setCurrentPage('login')}
                />
            )}

            {currentPage === 'process' && (
                <FileProcessorCard
                    onLogout={handleLogout}
                    onProcessSuccess={() => setCurrentPage('dashboard')}
                />
            )}

            {currentPage === 'dashboard' && (
                <VariantDashboard/>
            )}
        </main>
    );
};