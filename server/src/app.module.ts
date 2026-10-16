import { Module } from '@nestjs/common';
import { DatabaseModule } from './providers/database/database.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import {TasksModule} from "./modules/tasks/tasks.module";

@Module({
    imports: [DatabaseModule, UsersModule, AuthModule, TasksModule],
})
export class AppModule {}