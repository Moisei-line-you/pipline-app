export interface FileInfo {
    name: string;
    size: string;
    rawFile: File;
}

export type ProcessingStatus= 'idle' | 'file-selected' | 'processing' | 'completed';
