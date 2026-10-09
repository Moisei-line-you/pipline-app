import { useState, type ChangeEvent } from 'react';
import { formatFileSize } from '../../../shared/lib/formatFileSize';
import type { FileInfo, ProcessingStatus } from './processing.types';

export const useFileProcessor = () => {
    const [fileInfo, setFileInfo] = useState<FileInfo | null >(null);
    const [status, setStatus] = useState<ProcessingStatus>('idle');
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setError(null);

        if (file) {
            setFileInfo({
                name: file.name,
                size: formatFileSize(file.size),
                rawFile: file,
            });
            setStatus('file-selected');
        }
    };

    const handleRemoveFile = () => {
        setFileInfo(null);
        setStatus('idle');
        setError(null);
    };

    const handleProcess = async () => {
        if (!fileInfo) {
            setError('Please select a file first');
            return;
        }

        setStatus('processing');
        setError(null);

        setTimeout(() => {
            setStatus('completed');
        }, 2000);
    };

    return {
        fileInfo,
        status,
        error,
        handleFileChange,
        handleRemoveFile,
        handleProcess,
    };
};