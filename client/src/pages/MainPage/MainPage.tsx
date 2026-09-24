import {RegisterCard} from '../../features/auth/ui/RegistrationCard.tsx';
import {useState} from "react";
import {FileProcessorCard} from '../../features/file-processing/ui/FileProcessorCard.tsx';

type Page = 'register' | 'process';

export const MainPage: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<Page>('register');

    return (
        <>
            {currentPage === 'register' ? (
                <RegisterCard onSuccess={() => setCurrentPage('process')} />
            ) : (
                <FileProcessorCard onLogout={() => setCurrentPage('register')} />
            )}
        </>
    );
};
