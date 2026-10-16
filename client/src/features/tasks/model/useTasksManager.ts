import { useState, useEffect, useCallback, useRef } from 'react';
import { tasksApi, type TaskItem } from '../api/tasksApi';

export const useTasksManager = () => {
    const [tasks, setTasks] = useState<TaskItem[]>([]);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const loadTasks = useCallback(async () => {
        try {
            const data = await tasksApi.getTasks();
            setTasks(data);
        } catch (err) {
            console.error('Ошибка загрузки задач:', err);
        }
    }, []);

    useEffect(() => {
        loadTasks();
    }, [loadTasks]);

    useEffect(() => {
        const hasActive = tasks.some(
            (t) => t.status === 'PENDING' || t.status === 'PROCESSING'
        );
        if (hasActive) {
            timerRef.current = setTimeout(() => {
                loadTasks();
            }, 4000);
        }
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [tasks, loadTasks]);

    const deleteTask = async (taskId: string) => {
        await tasksApi.deleteTask(taskId);
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
    };

    return { tasks, loadTasks, deleteTask };
};
