import { Module, forwardRef } from '@nestjs/common';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';

@Module({
    imports: [DatabaseModule, forwardRef(() => AuthModule), UsersModule],
    providers: [StudentsService],
    controllers: [StudentsController],
    exports: [StudentsService],
})
export class StudentsModule {}
