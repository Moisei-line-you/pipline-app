import type { FC } from 'react';
import { useFileProcessor } from '../model/useFileProcessor';
import './FileProcessorCard.css';

interface FileProcessorCardProps {
    onLogout?: () => void;
    onUploadSuccess?: () => void;
}

export const FileProcessorCard: FC<FileProcessorCardProps> = ({ onUploadSuccess }) => {
    const {
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
    } = useFileProcessor(onUploadSuccess);

    const isProcessing = status === 'processing';
    const isCompleted = status === 'completed';

    return (
        <div className="processor-container">
            <div className="processor-card">
                <h2 className="processor-title">New Cardiogenetic Analysis</h2>
                <p className="processor-description">
                    Fill in the patient details and upload one or multiple .vcf / .vcf.gz files to generate separate reports for this patient
                </p>

                {error && <div className="server-error">{error}</div>}

                {/* Форма клинических данных анализа и пациента */}
                <div className="meta-form-grid">
                    <div className="meta-field meta-field-full">
                        <label htmlFor="analysisTitle">Analysis Title</label>
                        <input
                            id="analysisTitle"
                            name="analysisTitle"
                            type="text"
                            placeholder="e.g. Cardiomyopathy Panel — Primary Screening"
                            value={meta.analysisTitle || ''}
                            onChange={handleMetaChange}
                            disabled={isProcessing}
                        />
                    </div>

                    <div className="meta-field">
                        <label htmlFor="patientName">Patient Name / Code</label>
                        <input
                            id="patientName"
                            name="patientName"
                            type="text"
                            placeholder="e.g. Ivanov I.I. (PT-042)"
                            value={meta.patientName || ''}
                            onChange={handleMetaChange}
                            disabled={isProcessing}
                        />
                    </div>

                    <div className="meta-field-row">
                        <div className="meta-field">
                            <label htmlFor="patientAge">Age</label>
                            <input
                                id="patientAge"
                                name="patientAge"
                                type="number"
                                min={0}
                                max={120}
                                placeholder="e.g. 45"
                                value={meta.patientAge || ''}
                                onChange={handleMetaChange}
                                disabled={isProcessing}
                            />
                        </div>

                        <div className="meta-field">
                            <label htmlFor="patientGender">Sex</label>
                            <select
                                id="patientGender"
                                name="patientGender"
                                value={meta.patientGender || 'Not specified'}
                                onChange={handleMetaChange}
                                disabled={isProcessing}
                            >
                                <option value="Not specified">Not specified</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>
                    </div>

                    <div className="meta-field">
                        <label htmlFor="referenceGenome">Reference Genome</label>
                        <select
                            id="referenceGenome"
                            name="referenceGenome"
                            value={meta.referenceGenome || 'GRCh38 / hg38'}
                            onChange={handleMetaChange}
                            disabled={isProcessing}
                        >
                            <option value="GRCh38 / hg38">GRCh38 / hg38</option>
                            <option value="GRCh37 / hg19">GRCh37 / hg19</option>
                            <option value="T2T-CHM13">T2T-CHM13</option>
                        </select>
                    </div>

                    <div className="meta-field">
                        <label htmlFor="clinicalNotes">Clinical Diagnosis / Notes</label>
                        <input
                            id="clinicalNotes"
                            name="clinicalNotes"
                            type="text"
                            placeholder="e.g. Hypertrophic cardiomyopathy (HCM), MYH7/MYBPC3"
                            value={meta.clinicalNotes || ''}
                            onChange={handleMetaChange}
                            disabled={isProcessing}
                        />
                    </div>
                </div>

                <input
                    ref={fileInputRef}
                    id="vcf-file-input"
                    type="file"
                    multiple
                    accept=".vcf,.vcf.gz,.gz,text/plain"
                    onChange={handleFileChange}
                    className="file-input-hidden"
                    disabled={isProcessing}
                />

                {files.length > 0 && (
                    <div className="selected-files-list">
                        <div className="selected-files-header">
                            <span>Selected files ({files.length})</span>
                            {!isProcessing && (
                                <label htmlFor="vcf-file-input" className="add-more-files-btn">
                                    + Add another file
                                </label>
                            )}
                        </div>

                        {files.map((item, index) => (
                            <div key={`${item.name}-${index}`} className="selected-file-box">
                                <div className="file-details">
                                    <svg className="file-icon-svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                                        <polyline points="14 2 14 8 20 8"/>
                                    </svg>
                                    <div className="file-meta">
                                        <span className="file-name">
                                            {files.length > 1 ? `#${index + 1} • ` : ''}
                                            {item.name}
                                        </span>
                                        <span className="file-size">{item.size}</span>
                                    </div>
                                </div>
                                {!isProcessing && (
                                    <button
                                        type="button"
                                        className="remove-file-btn"
                                        onClick={() => handleRemoveFile(index)}
                                        title="Remove file"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {files.length === 0 && (
                    <label
                        className="file-dropzone"
                        htmlFor="vcf-file-input"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDropFiles}
                    >
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
                        <span className="upload-text">
                            Click or drag & drop one or multiple .vcf / .vcf.gz files
                        </span>
                        <span className="upload-hint">
                            You can select 2 or more files at once to create separate reports for this patient
                        </span>
                    </label>
                )}

                {isCompleted && (
                    <div className="success-message" style={{ marginTop: '16px' }}>
                        Files uploaded to background queue successfully
                    </div>
                )}

                <button
                    type="button"
                    onClick={handleProcess}
                    className="submit-btn"
                    style={{ marginTop: '20px' }}
                    disabled={files.length === 0 || isProcessing}
                >
                    {isProcessing
                        ? `Uploading ${files.length} file(s) to server...`
                        : files.length > 1
                          ? `Send ${files.length} files to server (${files.length} reports)`
                          : 'Send to server'}
                </button>
            </div>
        </div>
    );
};
