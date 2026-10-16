import { httpClient } from '../../../shared/api/httpClient';
import { getToken } from '../../../shared/lib/authToken';

export interface UploadTaskMeta {
    analysisTitle?: string;
    patientName?: string;
    patientAge?: string;
    patientGender?: string;
    referenceGenome?: string;
    clinicalNotes?: string;
}

export interface TaskItem {
    id: string;
    fileName: string;
    fileSize: string;
    analysisTitle?: string | null;
    patientName?: string | null;
    patientAge?: number | null;
    patientGender?: string | null;
    referenceGenome?: string | null;
    clinicalNotes?: string | null;
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    errorMessage?: string;
    createdAt: string;
    completedAt?: string;
    result?: {
        totalVariants: number;
        snpCount: number;
        indelCount: number;
        tiTvRatio: number;
        hetHomRatio: number;
    };
}

export const tasksApi = {
    // Загрузка файла и метаданных через FormData
    uploadFile: async (file: File, meta?: UploadTaskMeta) => {
        const formData = new FormData();
        formData.append('file', file);
        if (meta?.analysisTitle) formData.append('analysisTitle', meta.analysisTitle);
        if (meta?.patientName) formData.append('patientName', meta.patientName);
        if (meta?.patientAge) formData.append('patientAge', meta.patientAge);
        if (meta?.patientGender) formData.append('patientGender', meta.patientGender);
        if (meta?.referenceGenome) formData.append('referenceGenome', meta.referenceGenome);
        if (meta?.clinicalNotes) formData.append('clinicalNotes', meta.clinicalNotes);

        const token = getToken();

        const response = await fetch('/api/tasks/upload', {
            method: 'POST',
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: formData,
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Ошибка загрузки файла');
        }
        return response.json();
    },

    getTasks: () => httpClient<TaskItem[]>('/tasks'),
    getTaskResult: (taskId: string) => httpClient<{ task: TaskItem; variants: any[] }>(`/tasks/${taskId}/result`),
    deleteTask: (taskId: string) => httpClient(`/tasks/${taskId}`, { method: 'DELETE' }),
};
