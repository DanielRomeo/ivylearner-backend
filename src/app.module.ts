import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StudentsModule } from './students/students.module';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { InstructorsService } from './instructors/instructors.service';
import { InstructorsModule } from './instructors/instructors.module';

@Module({
    imports: [
        // StudentsModule,
        DatabaseModule,
        UsersModule,
        AuthModule,
        InstructorsModule,
    ],
    controllers: [AppController],
    providers: [AppService, InstructorsService],
})
export class AppModule {}
