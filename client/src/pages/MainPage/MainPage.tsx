import React, { useEffect, useState } from 'react';
import { LoginCard, RegisterCard } from '../../features/auth';
import { FileProcessorCard } from '../../features/file-processing';
import { VariantDashboard } from '../../features/variant-dashboard';
import type { Variant } from '../../features/variant-dashboard';
import { clearToken, getToken } from '../../shared/lib/authToken';

type Page = 'login' | 'register' | 'process' | 'dashboard';

export const MainPage: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<Page>(() =>
        getToken() ? 'process' : 'login'
    );
    const [variants, setVariants] = useState<Variant[] | null>(null);

    useEffect(() => {
        const authed = Boolean(getToken());
        if ((currentPage === 'process' || currentPage === 'dashboard') && !authed) {
            setCurrentPage('login');
        }
        if ((currentPage === 'login' || currentPage === 'register') && authed) {
            setCurrentPage('process');
        }
    }, [currentPage]);

    const handleLogout = () => {
        clearToken();
        setVariants(null);
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
                    onProcessSuccess={(parsed) => {
                        setVariants(parsed);
                        setCurrentPage('dashboard');
                    }}
                />
            )}

            {currentPage === 'dashboard' && (
                <VariantDashboard
                    variants={variants ?? undefined}
                    onBack={() => setCurrentPage('process')}
                    onLogout={handleLogout}
                />
            )}
        </main>
    );
};
