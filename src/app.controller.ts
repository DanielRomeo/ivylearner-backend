import {
    Controller,
    Get,
    Post,
    UseGuards,
    Request,
    ParseIntPipe,
    Param,
} from '@nestjs/common';
import { AppService } from './app.service';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { AuthService } from './auth/auth.service';

import { InstructorsService } from './instructors/instructors.service';
import { StudentsService } from './students/students.service';

@Controller()
export class AppController {
    constructor(
        private readonly authService: AuthService,
        private readonly instructorsService: InstructorsService,
        private readonly studentsService: StudentsService,
    ) {}

    // Login route using LocalAuthGuard (for username/password authentication)
    // @UseGuards(LocalAuthGuard)
    // @Post('login')
    // login(@Request() req): any {
    //     return this.authService.login(req.user);
    // }

    // Protected route using JwtAuthGuard
    @UseGuards(JwtAuthGuard)
    @Get('protected')
    getProtected(@Request() req): any {
        return req.user;
    }

    @UseGuards(JwtAuthGuard)
    @Get('auth/me')
    authenticateUser(@Request() req): any {
        return req.user;
    }

    @Get('getUserDetails/:id')
    async getDetails(@Param('id', ParseIntPipe) userId: number) {
        // first find if the user is in the instructors table:
        const userType =
            await this.instructorsService['findCriminalInstructor'](userId);
        // console.log(userType)
        if (userType) {
            return {
                ...userType,
                userType: 'instructor',
            };
        } else {
            // try finding it in the students table:
            const userType =
                await this.studentsService['findCriminalStudent'](userId);
            //    console.log(userType)
            if (userType) {
                return {
                    ...userType,
                    userType: 'student',
                };
            }
        }
    }
}
