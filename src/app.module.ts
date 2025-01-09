import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StudentsModule } from './students/students.module';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    StudentsModule,  // Manages students
    DatabaseModule,  // Database setup
    UsersModule,     // Manages users
    AuthModule       // Authentication setup
  ],
  controllers: [AppController], // Only AppController here
  providers: [AppService],      // Only AppService here
})
export class AppModule {}
