import { useEffect, useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import type { FileInfo, ProcessingStatus } from './processing.types';
import { formatFileSize } from '../../../shared/lib/formatFileSize';
import { tasksApi, type UploadTaskMeta } from '../../tasks/api/tasksApi';

const INITIAL_META: UploadTaskMeta = {
    analysisTitle: '',
    patientName: '',
    patientAge: '',
    patientGender: 'Not specified',
    referenceGenome: 'GRCh38 / hg38',
    clinicalNotes: '',
};

export const useFileProcessor = (onUploadSuccess?: () => void) => {
    const [files, setFiles] = useState<FileInfo[]>([]);
    const [meta, setMeta] = useState<UploadTaskMeta>(INITIAL_META);
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

    const handleMetaChange = (
        e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setMeta((prev) => ({ ...prev, [name]: value }));
    };

    const addRawFiles = (incomingFiles: File[]) => {
        if (incomingFiles.length === 0) return;
        setError(null);

        const invalidFile = incomingFiles.find((f) => {
            const lower = f.name.toLowerCase();
            return !lower.endsWith('.vcf') && !lower.endsWith('.vcf.gz');
        });

        if (invalidFile) {
            setError(`Invalid file "${invalidFile.name}". Please upload only .vcf or .vcf.gz files.`);
            return;
        }

        setFiles((prev) => {
            const next = [...prev];
            for (const file of incomingFiles) {
                const alreadyExists = next.some(
                    (item) => item.name === file.name && item.rawFile.size === file.size
                );
                if (!alreadyExists) {
                    next.push({
                        name: file.name,
                        size: formatFileSize(file.size),
                        rawFile: file,
                    });
                }
            }
            return next;
        });

        setStatus('file-selected');
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const selected = Array.from(e.target.files ?? []);
        addRawFiles(selected);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleDropFiles = (e: DragEvent<HTMLElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (status === 'processing') return;
        const dropped = Array.from(e.dataTransfer.files ?? []);
        addRawFiles(dropped);
    };

    const handleRemoveFile = (indexToRemove: number) => {
        setError(null);
        setFiles((prev) => {
            const updated = prev.filter((_, idx) => idx !== indexToRemove);
            if (updated.length === 0) {
                setStatus('idle');
            }
            return updated;
        });
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleProcess = async () => {
        if (files.length === 0) {
            setError('Please select at least one file');
            return;
        }

        setStatus('processing');
        setError(null);

        try {
            const baseTitle = meta.analysisTitle?.trim() || '';
            await Promise.all(
                files.map((item, idx) => {
                    const itemMeta: UploadTaskMeta = {
                        ...meta,
                        analysisTitle:
                            files.length > 1 && baseTitle
                                ? `${baseTitle} (File #${idx + 1})`
                                : baseTitle,
                    };
                    return tasksApi.uploadFile(item.rawFile, itemMeta);
                })
            );

            if (!aliveRef.current) return;

            setStatus('completed');
            setFiles([]);
            setMeta(INITIAL_META);
            onUploadSuccess?.();
        } catch (err) {
            if (!aliveRef.current) return;
            setStatus('file-selected');
            setError(err instanceof Error ? err.message : 'Failed to upload files');
        }
    };

    return {
        files,
        meta,
        status,
        error,
        fileInputRef,
        handleMetaChange,
        handleFileChange,
        handleDropFiles,
        handleRemoveFile,
        handleProcess,
    };
};
