import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { VcfParserService } from './vcf-parser.service';
import { DatabaseModule } from '../../providers/database/database.module';

@Module({
    imports: [DatabaseModule],
    controllers: [TasksController],
    providers: [TasksService, VcfParserService],
    exports: [TasksService],
})
export class TasksModule {}
