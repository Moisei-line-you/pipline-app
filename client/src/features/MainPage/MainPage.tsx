import {RegisterCard} from "../auth/ui/RegistrationCard.tsx";
import {useState} from "react";
import {FileProcessorCard} from "../processing/ui/FileProcessorCard.tsx";

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
