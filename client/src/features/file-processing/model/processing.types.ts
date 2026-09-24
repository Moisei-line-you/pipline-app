export interface FileInfo {
    name: string;
    size: string;
    rawFile: File;
}

export type ProgressingStatus = 'idle' | 'file-selected' | 'processing' | 'completed';
