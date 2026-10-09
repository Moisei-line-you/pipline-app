import type { FC } from 'react';
import { useFileProcessor } from '../model/useFileProcessor';
import type { Variant } from '../../variant-dashboard/ui/types';
import './FileProcessorCard.css';

interface FileProcessorCardProps {
    onLogout?: () => void;
    onProcessSuccess?: (variants: Variant[]) => void;
}

export const FileProcessorCard: FC<FileProcessorCardProps> = ({ onLogout, onProcessSuccess }) => {
    const {
        fileInfo,
        status,
        error,
        fileInputRef,
        handleFileChange,
        handleRemoveFile,
        handleProcess,
    } = useFileProcessor(onProcessSuccess);

    const isProcessing = status === 'processing';
    const isCompleted = status === 'completed';

    return (
        <div className="processor-container">
            <div className="processor-header">
                <h1 className="main-app-title">File Processor</h1>
                {onLogout && (
                    <button type="button" onClick={onLogout} className="logout-btn">
                        Log out
                    </button>
                )}
            </div>
            <div className="processor-card">
                <h2 className="processor-title">Loading and processing of file</h2>
                <p className="processor-description">
                    Select a VCF file and press execute
                </p>

                {error && <div className="server-error">{error}</div>}

                <input
                    ref={fileInputRef}
                    id="vcf-file-input"
                    type="file"
                    accept=".vcf,text/plain"
                    onChange={handleFileChange}
                    className="file-input-hidden"
                    disabled={isProcessing}
                />

                {fileInfo ? (
                    <div className="selected-file-box">
                        <div className="file-details">
                            <svg className="file-icon-svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                                <polyline points="14 2 14 8 20 8"/>
                            </svg>
                            <div className="file-meta">
                                <span className="file-name">{fileInfo.name}</span>
                                <span className="file-size">{fileInfo.size}</span>
                            </div>
                        </div>
                        {!isProcessing && (
                            <button
                                type="button"
                                className="remove-file-btn"
                                onClick={handleRemoveFile}
                            >
                                ✕
                            </button>
                        )}
                    </div>
                ) : (
                    <label className="file-dropzone" htmlFor="vcf-file-input">
                        <svg
                            className="upload-icon-svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        <span className="upload-text">Click to upload VCF file</span>
                    </label>
                )}

                {isCompleted && (
                    <div className="success-message" style={{ marginTop: '16px' }}>
                        File processed successfully
                    </div>
                )}

                <button
                    type="button"
                    onClick={handleProcess}
                    className="submit-btn"
                    style={{ marginTop: '20px' }}
                    disabled={!fileInfo || isProcessing}
                >
                    {isProcessing ? 'Processing' : 'Execute file'}
                </button>
            </div>
        </div>
    );
};
