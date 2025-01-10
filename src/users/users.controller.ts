import {  Controller,
    Get,
    Post,
    Body,
    Put,
    Param,
    Delete,
    Request ,
    forwardRef , Inject
} from '@nestjs/common';

import { LocalAuthGuard } from 'src/auth/local-auth.guard';
import { UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthService } from 'src/auth/auth.service';


@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
        @Inject(forwardRef(() => AuthService))  // Handle circular dependency
        private readonly authService: AuthService,
      ) {}

    @UseGuards(LocalAuthGuard)
    @Post('login')
    login(@Request() userData: User): any {
        return this.authService.login(req.user);
    }

   
    @Post('create')
    create(@Body() req): any {
        // return this.authService.create(req.user)
        // return {msg: "creating"}
        let data = this.usersService.create(req.user)
        return {data: data}
    }


    // @Get()
    // async findAll() {
    //   try {
    //     console.log('we got passed this phase');
    //     return this.studentsService.getAllStudents();
    //   } catch (error) {
    //     console.error('Error fetching students:', error);
    //     throw error; // or handle appropriately
    //   }
    // }

}




