import React, { useState } from 'react';
import { LoginCard, RegisterCard } from '../../features/auth';
import { FileProcessorCard } from '../../features/file-processing';
import { VariantDashboard } from '../../features/variant-dashboard';
import type { Variant } from '../../features/variant-dashboard';
import { clearToken, getToken } from '../../shared/lib/authToken';
import { Navbar, type TabType } from '../../widgets/Navbar/Navbar';
import { HomePage } from '../HomePage/HomePage';
import { TasksListView } from '../../features/tasks/ui/TasksListView';
import { useTasksManager } from '../../features/tasks/model/useTasksManager';
import { tasksApi } from '../../features/tasks/api/tasksApi';

type AuthMode = 'login' | 'register';

export const MainPage: React.FC = () => {
    const [isAuthed, setIsAuthed] = useState<boolean>(() => Boolean(getToken()));
    const [authMode, setAuthMode] = useState<AuthMode>('login');
    const [currentTab, setCurrentTab] = useState<TabType>('home');
    const [selectedVariants, setSelectedVariants] = useState<Variant[] | null>(null);
    const [isLoadingDashboard, setIsLoadingDashboard] = useState<boolean>(false);

    const { tasks, loadTasks, deleteTask } = useTasksManager();

    const handleLogout = () => {
        clearToken();
        setIsAuthed(false);
        setSelectedVariants(null);
        setCurrentTab('home');
    };

    const handleOpenDashboard = async (taskId: string) => {
        try {
            setIsLoadingDashboard(true);
            const { variants } = await tasksApi.getTaskResult(taskId);
            setSelectedVariants(variants);
        } catch {
            alert('Failed to load analysis results');
        } finally {
            setIsLoadingDashboard(false);
        }
    };

    if (!isAuthed) {
        return (
            <main>
                {authMode === 'login' ? (
                    <LoginCard
                        onSuccess={() => {
                            setIsAuthed(true);
                            setCurrentTab('home');
                            loadTasks();
                        }}
                        onSwitchToRegister={() => setAuthMode('register')}
                    />
                ) : (
                    <RegisterCard
                        onSuccess={() => {
                            setIsAuthed(true);
                            setCurrentTab('home');
                            loadTasks();
                        }}
                        onSwitchToLogin={() => setAuthMode('login')}
                    />
                )}
            </main>
        );
    }

    if (selectedVariants) {
        return (
            <main>
                <VariantDashboard
                    variants={selectedVariants}
                    onBack={() => setSelectedVariants(null)}
                    onLogout={handleLogout}
                />
            </main>
        );
    }

    const activeTasksCount = tasks.filter(
        (t) => t.status === 'PENDING' || t.status === 'PROCESSING'
    ).length;

    return (
        <div>
            <Navbar
                currentTab={currentTab}
                onSelectTab={setCurrentTab}
                onLogout={handleLogout}
                activeTasksCount={activeTasksCount}
            />

            <main>
                {isLoadingDashboard && (
                    <div
                        style={{
                            textAlign: 'center',
                            padding: '24px',
                            color: '#88BDBC',
                            fontWeight: 600,
                        }}
                    >
                        Loading dashboard variants...
                    </div>
                )}

                {currentTab === 'home' && (
                    <HomePage
                        tasks={tasks}
                        onGoToUpload={() => setCurrentTab('upload')}
                        onGoToArchive={() => setCurrentTab('archive')}
                        onOpenDashboard={handleOpenDashboard}
                    />
                )}

                {currentTab === 'upload' && (
                    <FileProcessorCard
                        onUploadSuccess={async () => {
                            await loadTasks();
                            setCurrentTab('in_progress');
                        }}
                    />
                )}

                {currentTab === 'in_progress' && (
                    <TasksListView
                        mode="in_progress"
                        tasks={tasks}
                        onOpenDashboard={handleOpenDashboard}
                        onDeleteTask={deleteTask}
                    />
                )}

                {currentTab === 'archive' && (
                    <TasksListView
                        mode="archive"
                        tasks={tasks}
                        onOpenDashboard={handleOpenDashboard}
                        onDeleteTask={deleteTask}
                    />
                )}
            </main>
        </div>
    );
};