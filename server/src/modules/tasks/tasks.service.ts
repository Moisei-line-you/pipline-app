import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../providers/database/prisma.service";
import { VcfParserService } from "./vcf-parser.service";
import * as fs from "node:fs";
import * as path from "node:path";
import "multer";

@Injectable()
export class TasksService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly parser: VcfParserService
    ) {}

    async createTask(userId: string, file: Express.Multer.File) {
        const task = await this.prisma.analysisTask.create({
            data: {
                userId,
                fileName: file.originalname,
                storedPath: file.path,
                fileSize: BigInt(file.size),
                status: 'PENDING',
            },
        });

        this.processTaskInBackground(task.id, file.path);

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
        return tasks.map((t) => ({ ...t, fileSize: Number(t.fileSize) }));
    }

    async getTaskResult(userId: string, taskId: string) {
        const task = await this.prisma.analysisTask.findFirst({
            where: { id: taskId, userId },
            include: { result: true },
        });
        if (!task) throw new NotFoundException('Task not found');

        const serializedTask = { ...task, fileSize: Number(task.fileSize) };

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


        if (fs.existsSync(task.storedPath)) fs.unlinkSync(task.storedPath);
        if (task.result && fs.existsSync(task.result.jsonResultPath)) {
            fs.unlinkSync(task.result.jsonResultPath);
        }

        const deleted = await this.prisma.analysisTask.delete({ where: { id: taskId } });
        return { ...deleted, fileSize: Number(deleted.fileSize) };
    }
}