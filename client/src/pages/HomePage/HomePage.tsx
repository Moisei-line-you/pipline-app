import React from 'react';
import type { TaskItem } from '../../features/tasks/api/tasksApi';
import './HomePage.css';

interface HomePageProps {
    tasks: TaskItem[];
    onGoToUpload: () => void;
    onGoToArchive: () => void;
    onOpenDashboard: (taskId: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ tasks, onGoToUpload, onGoToArchive, onOpenDashboard }) => {
    const inProgressCount = tasks.filter(t => t.status === 'PENDING' || t.status === 'PROCESSING').length;
    const completedTasks = tasks.filter(t => t.status === 'COMPLETED');
    const totalVariantsSum = completedTasks.reduce((sum, t) => sum + (t.result?.totalVariants || 0), 0);
    const recentTasks = completedTasks.slice(0, 3);

    return (
        <div className="home-container">
            {/* 1. Блок о проекте */}
            <section className="home-hero">
                <h1 className="hero-heading">CardioGen - Clinical Analysis of Variants </h1>
                <p className="hero-subheading">
                    An automated web platform for parsing cardiogenetic VCF files,
                    calculating genetic metrics (Ti/Tv, Het/Hom, SNP/Indel), and performing GATK quality control.
                </p>
            </section>

            {/* 2. Карточки-счетчики */}
            <section className="kpi-grid">
                <div className="kpi-card kpi-yellow">
                    <span className="kpi-label">In progress</span>
                    <span className="kpi-value">{inProgressCount}</span>
                    <span className="kpi-desc">files are currently being processed by the server</span>
                </div>

                <div className="kpi-card kpi-green">
                    <span className="kpi-label">Completed</span>
                    <span className="kpi-value">{completedTasks.length}</span>
                    <span className="kpi-desc">completed analyses are available in the archive</span>
                </div>

                <div className="kpi-card kpi-blue">
                    <span className="kpi-label">Total mutations</span>
                    <span className="kpi-value">{totalVariantsSum.toLocaleString()}</span>
                    <span className="kpi-desc">found and classified</span>
                </div>

                <div className="kpi-card kpi-action" onClick={onGoToUpload}>
                    <span className="kpi-label">Action</span>
                    <span className="kpi-btn-text">+ New analysis</span>
                    <span className="kpi-desc">Upload a .vcf or .vcf.gz file →</span>
                </div>
            </section>

            {/* 3. Недавние анализы */}
            <section className="recent-section">
                <div className="section-header">
                    <h2>Recently completed analyses</h2>
                    <button className="link-btn" onClick={onGoToArchive}>Смотреть все ({completedTasks.length}) →</button>
                </div>

                {recentTasks.length === 0 ? (
                    <div className="empty-box">There are no completed analyses yet. Click "+ New analysis" to start.</div>
                ) : (
                    <div className="recent-grid">
                        {recentTasks.map(t => (
                            <div key={t.id} className="recent-card">
                                <div>
                                    <div className="recent-file-name">
                                        {t.analysisTitle || t.fileName}
                                    </div>
                                    {t.analysisTitle && (
                                        <div className="recent-file-sub">{t.fileName}</div>
                                    )}
                                </div>

                                {(t.patientName || t.patientAge || t.referenceGenome || t.clinicalNotes) && (
                                    <div className="recent-patient-box">
                                        {t.patientName && (
                                            <div className="recent-patient-row">
                                                <span className="recent-patient-label">Patient:</span>
                                                <strong>{t.patientName}</strong>
                                                {(t.patientAge || (t.patientGender && t.patientGender !== 'Not specified')) && (
                                                    <span className="recent-patient-meta">
                                                        ({[
                                                            t.patientAge ? `${t.patientAge} y.o.` : null,
                                                            t.patientGender && t.patientGender !== 'Not specified' ? t.patientGender : null,
                                                        ].filter(Boolean).join(', ')})
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                        {t.referenceGenome && (
                                            <div className="recent-patient-row">
                                                <span className="recent-patient-label">Genome:</span>
                                                <span>{t.referenceGenome}</span>
                                            </div>
                                        )}
                                        {t.clinicalNotes && (
                                            <div className="recent-patient-row">
                                                <span className="recent-patient-label">Diagnosis:</span>
                                                <span>{t.clinicalNotes}</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="recent-metrics">
                                    <span>Мутаций: <strong>{t.result?.totalVariants}</strong></span>
                                    <span>Ti/Tv: <strong>{t.result?.tiTvRatio}</strong></span>
                                </div>
                                <button className="open-btn" onClick={() => onOpenDashboard(t.id)}>
                                    Open dashboard →
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};
