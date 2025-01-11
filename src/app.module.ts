import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StudentsModule } from './students/students.module';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { InstructorsService } from './instructors/instructors.service';
import { InstructorsModule } from './instructors/instructors.module';
import { OrganisationsService } from './organisations/organisations.service';
import { OrganisationsModule } from './organisations/organisations.module';
import { OrganisationsController } from './organisations/organisations.controller';

@Module({
    imports: [
        // StudentsModule,
        DatabaseModule,
        UsersModule,
        AuthModule,
        InstructorsModule,
        OrganisationsModule,
    ],
    controllers: [AppController, OrganisationsController],
    providers: [AppService, InstructorsService, OrganisationsService],
})
export class AppModule {}
