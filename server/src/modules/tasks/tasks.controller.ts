import { Controller, Post, Get, Delete, Param, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { TasksService } from './tasks.service';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
    constructor(private readonly tasksService: TasksService) {}

    @Post('upload')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: 'storage/uploads/raw',
                filename: (req, file, cb) => {
                    const ext = path.extname(file.originalname);
                    const safeName = `${uuidv4()}_${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
                    cb(null, safeName);
                },
            }),
            limits: { fileSize: 500 * 1024 * 1024 }, // До 500 МБ
            fileFilter: (req, file, cb) => {
                const lower = file.originalname.toLowerCase();
                if (lower.endsWith('.vcf') || lower.endsWith('.vcf.gz')) {
                    return cb(null, true);
                }
                cb(new BadRequestException('Разрешены только файлы .vcf и .vcf.gz'), false);
            },
        }),
    )
    uploadFile(@CurrentUser() user: { id: string }, @UploadedFile() file: Express.Multer.File) {
        if (!file) throw new BadRequestException('Файл не был загружен');
        return this.tasksService.createTask(user.id, file);
    }

    @Get()
    getTasks(@CurrentUser() user: { id: string }) {
        return this.tasksService.getUserTasks(user.id);
    }

    @Get(':id/result')
    getResult(@CurrentUser() user: { id: string }, @Param('id') id: string) {
        return this.tasksService.getTaskResult(user.id, id);
    }

    @Delete(':id')
    deleteTask(@CurrentUser() user: { id: string }, @Param('id') id: string) {
        return this.tasksService.deleteTask(user.id, id);
    }
}
