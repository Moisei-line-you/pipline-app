import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import type { FileInfo, ProcessingStatus } from './processing.types';
import type { Variant } from '../../variant-dashboard/ui/types';
import { formatFileSize } from '../../../shared/lib/formatFileSize';
import { parseVcf } from './parseVcf';

export const useFileProcessor = (onProcessSuccess?: (variants: Variant[]) => void) => {
    const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
    const [status, setStatus] = useState<ProcessingStatus>('idle');
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const aliveRef = useRef(true);

    useEffect(() => {
        aliveRef.current = true;
        return () => {
            aliveRef.current = false;
        };
    }, []);

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
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleProcess = async () => {
        if (!fileInfo) {
            setError('Please select a file');
            return;
        }

        const lowerName = fileInfo.name.toLowerCase();
        if (lowerName.endsWith('.gz')) {
            setError('Compressed VCF (.gz) is not supported. Please upload a plain .vcf file.');
            return;
        }
        if (!lowerName.endsWith('.vcf')) {
            setError('Please upload a .vcf file');
            return;
        }

        setStatus('processing');
        setError(null);

        try {
            const text = await fileInfo.rawFile.text();
            if (!aliveRef.current) return;

            const variants = parseVcf(text);
            if (!aliveRef.current) return;

            if (variants.length === 0) {
                setStatus('file-selected');
                setError('No variants found in this file');
                return;
            }

            setStatus('completed');
            onProcessSuccess?.(variants);
        } catch (err) {
            if (!aliveRef.current) return;
            setStatus('file-selected');
            setError(err instanceof Error ? err.message : 'Failed to process file');
        }
    };

    return {
        fileInfo,
        status,
        error,
        fileInputRef,
        handleFileChange,
        handleRemoveFile,
        handleProcess,
    };
};
