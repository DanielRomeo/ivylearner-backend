import { Module } from '@nestjs/common';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
    imports: [DatabaseModule, AuthModule],
    providers: [StudentsService],
    controllers: [StudentsController],
})
export class StudentsModule {}
