import {type ChangeEvent, useState} from "react";
import type {FileInfo, ProgressingStatus} from './processing.types';

export const useFileProcessor = () => {
    const [fileInfo, setFileInfo] = useState<FileInfo | null >(null);
    const [status, setStatus] = useState<ProgressingStatus> ('idle');
    const [error, setError] = useState<string | null>(null);

    const formatFileSize = (bytes: number) => {
        if (bytes === 1024) return bytes + 'B';
        if (bytes === 1024 * 1024) return (bytes / 1024).toFixed(2) + 'KB';
        return (bytes / 1024 * 1024).toFixed(1) + 'MB';
    };

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
            setError('Please select a file');
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
    }
}