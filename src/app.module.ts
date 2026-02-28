import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// import { StudentsModule } from './students/students.module';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
// import { InstructorsService } from './instructors/instructors.service';
// import { InstructorsModule } from './instructors/instructors.module';
// import { OrganisationsService } from './organisations/organisations.service';
// import { OrganisationsModule } from './organisations/organisations.module';
// import { OrganisationsController } from './organisations/organisations.controller';
// import { CoursesModule } from './courses/courses.module';
// import { StudentsService } from './students/students.service';
// import { LessonsService } from './lessons/lessons.service';
// import { LessonsModule } from './lessons/lessons.module';
//    import { OrganizationsModule } from '../organizations/organizations.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { CoursesModule } from './courses/courses.module';
import { LessonsModule } from './lessons/lessons.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';
import { UserProfilesModule } from './user-profiles/user-profiles.module';


@Module({
    imports: [
        // StudentsModule,
        EnrollmentsModule,
        LessonsModule,
        DatabaseModule,
        UsersModule,
        AuthModule,
        // InstructorsModule,
        OrganizationsModule,
        CoursesModule,
        UserProfilesModule
        // LessonsModule,
    ],
    // controllers: [AppController, OrganisationsController],
    controllers: [AppController],
    providers: [
        AppService,
        // InstructorsService,
        // OrganisationsService,
        // StudentsService,
        // LessonsService,
    ],
})
export class AppModule {}
