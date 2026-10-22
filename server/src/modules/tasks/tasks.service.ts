import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../providers/database/prisma.service";
import { VcfParserService } from "./vcf-parser.service";
import * as fs from "node:fs";
import * as path from "node:path";
import "multer";

/** Клинические метаданные анализа и пациента */
export interface CreateTaskMeta {
    analysisTitle?: string;
    patientName?: string;
    patientAge?: string | number;
    patientGender?: string;
    referenceGenome?: string;
    clinicalNotes?: string;
}

interface StoredTaskMeta {
    analysisTitle: string | null;
    patientName: string | null;
    patientAge: number | null;
    patientGender: string | null;
    referenceGenome: string | null;
    clinicalNotes: string | null;
}

interface QueuedTask {
    userId: string;
    taskId: string;
    filePath: string;
}

@Injectable()
export class TasksService {
    private readonly MAX_PER_USER = 2;
    private readonly MAX_GLOBAL = 10;
    private readonly queue: QueuedTask[] = [];
    private activeGlobal = 0;
    private readonly activeByUser = new Map<string, number>();

    constructor(
        private readonly prisma: PrismaService,
        private readonly parser: VcfParserService
    ) {}

    private enqueueTask(userId: string, taskId: string, filePath: string) {
        this.queue.push({ userId, taskId, filePath });
        this.scheduleNext();
    }

    private scheduleNext() {
        while (this.activeGlobal < this.MAX_GLOBAL && this.queue.length > 0) {
            const nextIndex = this.queue.findIndex(
                (item) => (this.activeByUser.get(item.userId) ?? 0) < this.MAX_PER_USER
            );

            if (nextIndex === -1) {
                break;
            }

            const [nextTask] = this.queue.splice(nextIndex, 1);
            this.activeGlobal++;
            const userActive = (this.activeByUser.get(nextTask.userId) ?? 0) + 1;
            this.activeByUser.set(nextTask.userId, userActive);

            this.processTaskInBackground(nextTask.taskId, nextTask.filePath).finally(() => {
                this.activeGlobal--;
                const remainingForUser = (this.activeByUser.get(nextTask.userId) ?? 1) - 1;
                if (remainingForUser <= 0) {
                    this.activeByUser.delete(nextTask.userId);
                } else {
                    this.activeByUser.set(nextTask.userId, remainingForUser);
                }
                this.scheduleNext();
            });
        }
    }

    private getMetaFilePath(taskId: string): string {
        const resultsDir = path.resolve('storage/uploads/results');
        if (!fs.existsSync(resultsDir)) {
            fs.mkdirSync(resultsDir, { recursive: true });
        }
        return path.join(resultsDir, `${taskId}.meta.json`);
    }

    private saveTaskMeta(taskId: string, meta?: CreateTaskMeta): StoredTaskMeta {
        const parsedAge =
            meta?.patientAge !== undefined && meta?.patientAge !== ''
                ? Number(meta.patientAge)
                : null;

        const cleanMeta: StoredTaskMeta = {
            analysisTitle: meta?.analysisTitle?.trim() || null,
            patientName: meta?.patientName?.trim() || null,
            patientAge: parsedAge !== null && !Number.isNaN(parsedAge) ? parsedAge : null,
            patientGender: meta?.patientGender?.trim() || null,
            referenceGenome: meta?.referenceGenome?.trim() || null,
            clinicalNotes: meta?.clinicalNotes?.trim() || null,
        };

        try {
            fs.writeFileSync(this.getMetaFilePath(taskId), JSON.stringify(cleanMeta), 'utf-8');
        } catch {
            // ignore metadata write errors
        }

        return cleanMeta;
    }

    private readTaskMeta(taskId: string): StoredTaskMeta {
        const metaPath = this.getMetaFilePath(taskId);
        if (fs.existsSync(metaPath)) {
            try {
                return JSON.parse(fs.readFileSync(metaPath, 'utf-8')) as StoredTaskMeta;
            } catch {
                // fallback to nulls
            }
        }
        return {
            analysisTitle: null,
            patientName: null,
            patientAge: null,
            patientGender: null,
            referenceGenome: null,
            clinicalNotes: null,
        };
    }

    async createTask(userId: string, file: Express.Multer.File, meta?: CreateTaskMeta) {
        const task = await this.prisma.analysisTask.create({
            data: {
                userId,
                fileName: file.originalname,
                storedPath: file.path,
                fileSize: BigInt(file.size),
                status: 'PENDING',
            },
        });

        this.saveTaskMeta(task.id, meta);
        this.enqueueTask(userId, task.id, file.path);

        return {
            taskId: task.id,
            fileName: task.fileName,
            status: task.status,
            message: 'task created successfully.',
        };
    }

    private async processTaskInBackground(taskId: string, filePath: string) {
        try {
            await this.prisma.analysisTask.update({
                where: { id: taskId },
                data: { status: 'PROCESSING' },
            });

            const stats = await this.parser.parseStream(filePath);

            const resultsDir = path.resolve('storage/uploads/results');
            if (!fs.existsSync(resultsDir)) fs.mkdirSync(resultsDir, { recursive: true });
            const jsonPath = path.join(resultsDir, `${taskId}.json`);
            fs.writeFileSync(jsonPath, JSON.stringify(stats.variants));

            const tiTv = stats.transversions > 0 ? Number((stats.transitions / stats.transversions).toFixed(2)) : 0;
            const hetHom = stats.homAltCount > 0 ? Number((stats.hetCount / stats.homAltCount).toFixed(2)) : 0;

            await this.prisma.analysisResult.create({
                data: {
                    taskId,
                    totalVariants: stats.total,
                    snpCount: stats.snpCount,
                    indelCount: stats.indelCount,
                    hetCount: stats.hetCount,
                    homAltCount: stats.homAltCount,
                    hetHomRatio: hetHom,
                    tiTvRatio: tiTv,
                    jsonResultPath: jsonPath,
                },
            });

            await this.prisma.analysisTask.update({
                where: { id: taskId },
                data: { status: 'COMPLETED', completedAt: new Date() },
            });
        } catch (error: any) {
            await this.prisma.analysisTask.update({
                where: { id: taskId },
                data: { status: 'FAILED', errorMessage: error.message || 'File processing error' },
            });
        }
    }

    async getUserTasks(userId: string) {
        const tasks = await this.prisma.analysisTask.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: { result: true },
        });
        return tasks.map((t) => ({
            ...t,
            fileSize: Number(t.fileSize),
            ...this.readTaskMeta(t.id),
        }));
    }

    async getTaskResult(userId: string, taskId: string) {
        const task = await this.prisma.analysisTask.findFirst({
            where: { id: taskId, userId },
            include: { result: true },
        });
        if (!task) throw new NotFoundException('Task not found');

        const serializedTask = {
            ...task,
            fileSize: Number(task.fileSize),
            ...this.readTaskMeta(task.id),
        };

        if (task.status !== 'COMPLETED' || !task.result) {
            return { task: serializedTask, variants: [] };
        }

        const rawData = fs.readFileSync(task.result.jsonResultPath, 'utf-8');
        const variants = JSON.parse(rawData);
        return { task: serializedTask, result: task.result, variants };
    }

    async deleteTask(userId: string, taskId: string) {
        const task = await this.prisma.analysisTask.findFirst({
            where: { id: taskId, userId },
            include: { result: true },
        });
        if (!task) throw new NotFoundException('Task not found');

        const queuedIdx = this.queue.findIndex((q) => q.taskId === taskId);
        if (queuedIdx !== -1) {
            this.queue.splice(queuedIdx, 1);
        }

        if (fs.existsSync(task.storedPath)) fs.unlinkSync(task.storedPath);
        if (task.result && fs.existsSync(task.result.jsonResultPath)) {
            fs.unlinkSync(task.result.jsonResultPath);
        }
        const metaPath = this.getMetaFilePath(task.id);
        if (fs.existsSync(metaPath)) {
            fs.unlinkSync(metaPath);
        }

        const deleted = await this.prisma.analysisTask.delete({ where: { id: taskId } });
        return { ...deleted, fileSize: Number(deleted.fileSize) };
    }
}