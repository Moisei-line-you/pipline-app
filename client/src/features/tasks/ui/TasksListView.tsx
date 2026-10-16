import React from 'react';
import type { TaskItem } from '../api/tasksApi';
import { formatFileSize } from '../../../shared/lib/formatFileSize';
import './TasksListView.css';

interface TasksListViewProps {
    mode: 'in_progress' | 'archive';
    tasks: TaskItem[];
    onOpenDashboard: (taskId: string) => void;
    onDeleteTask: (taskId: string) => void;
}

export const TasksListView: React.FC<TasksListViewProps> = ({
    mode,
    tasks,
    onOpenDashboard,
    onDeleteTask,
}) => {
    const filtered = tasks.filter((t) =>
        mode === 'in_progress'
            ? t.status === 'PENDING' || t.status === 'PROCESSING'
            : t.status === 'COMPLETED' || t.status === 'FAILED'
    );

    return (
        <div className="tasks-view-container">
            <h2 className="tasks-view-title">
                {mode === 'in_progress'
                    ? 'Analyses in progress (background processing)'
                    : 'Archive of completed VCF analyses'}
            </h2>

            {filtered.length === 0 ? (
                <div className="tasks-empty-box">
                    {mode === 'in_progress'
                        ? 'There are currently no active tasks in the queue.'
                        : 'The archive is empty. Upload a VCF or VCF.GZ file in "+ New analysis".'}
                </div>
            ) : (
                <div className="tasks-list-grid">
                    {filtered.map((task) => (
                        <div key={task.id} className="task-card">
                            <div className="task-card-header">
                                <div className="task-card-header-info">
                                    <div className="task-file-title">
                                        {task.analysisTitle || task.fileName}
                                    </div>
                                    <div className="task-meta-sub">
                                        {task.analysisTitle && (
                                            <span className="task-raw-filename">{task.fileName} • </span>
                                        )}
                                        Size: {formatFileSize(Number(task.fileSize) || 0)} •{' '}
                                        {new Date(task.createdAt).toLocaleString()}
                                    </div>
                                </div>

                                <span className={`status-badge status-${task.status.toLowerCase()}`}>
                                    {(task.status === 'PENDING' || task.status === 'PROCESSING') && (
                                        <span className="spinner-dot" />
                                    )}
                                    {task.status}
                                </span>
                            </div>

                            {(task.patientName || task.patientAge || task.referenceGenome || task.clinicalNotes) && (
                                <div className="task-patient-card">
                                    {task.patientName && (
                                        <div className="task-patient-item">
                                            <span className="task-patient-label">Patient:</span>
                                            <strong className="task-patient-val">{task.patientName}</strong>
                                            {(task.patientAge || (task.patientGender && task.patientGender !== 'Not specified')) && (
                                                <span className="task-patient-tag">
                                                    {[
                                                        task.patientAge ? `${task.patientAge} y.o.` : null,
                                                        task.patientGender && task.patientGender !== 'Not specified' ? task.patientGender : null,
                                                    ].filter(Boolean).join(' • ')}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                    {task.referenceGenome && (
                                        <div className="task-patient-item">
                                            <span className="task-patient-label">Reference:</span>
                                            <span className="task-patient-badge">{task.referenceGenome}</span>
                                        </div>
                                    )}
                                    {task.clinicalNotes && (
                                        <div className="task-patient-item">
                                            <span className="task-patient-label">Diagnosis / Notes:</span>
                                            <span className="task-patient-notes">{task.clinicalNotes}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {task.status === 'COMPLETED' && task.result && (
                                <div className="task-metrics-row">
                                    <div className="metric-pill">
                                        <span>Variants:</span>
                                        <strong>{task.result.totalVariants.toLocaleString()}</strong>
                                    </div>
                                    <div className="metric-pill">
                                        <span>SNP / InDel:</span>
                                        <strong>
                                            {task.result.snpCount} / {task.result.indelCount}
                                        </strong>
                                    </div>
                                    <div className="metric-pill">
                                        <span>Ti/Tv:</span>
                                        <strong>{task.result.tiTvRatio}</strong>
                                    </div>
                                    <div className="metric-pill">
                                        <span>Het/Hom:</span>
                                        <strong>{task.result.hetHomRatio}</strong>
                                    </div>
                                </div>
                            )}

                            {task.status === 'FAILED' && (
                                <div className="task-error-banner">
                                    Error: {task.errorMessage || 'Failed to parse VCF file'}
                                </div>
                            )}

                            <div className="task-card-actions">
                                {task.status === 'COMPLETED' && (
                                    <button
                                        type="button"
                                        className="task-open-btn"
                                        onClick={() => onOpenDashboard(task.id)}
                                    >
                                        Open dashboard →
                                    </button>
                                )}
                                <button
                                    type="button"
                                    className="task-delete-btn"
                                    onClick={() => onDeleteTask(task.id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
