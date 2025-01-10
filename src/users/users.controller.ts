import {  Controller,
    Get,
    Post,
    Body,
    Put,
    Param,
    Delete,
    Request ,
    forwardRef , Inject,
    HttpException, HttpStatus,
    HttpCode
} from '@nestjs/common';

import { LocalAuthGuard } from 'src/auth/local-auth.guard';
import { UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthService } from 'src/auth/auth.service';

import {User} from '../interfaces/user.interface'


@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
        @Inject(forwardRef(() => AuthService))  // Handle circular dependency
        private readonly authService: AuthService,
      ) {}

    @UseGuards(LocalAuthGuard)
    @Post('login')
    login(@Request() req): any {
        return this.authService.login(req.user);
    }

   
    @Post('create')
    @HttpCode(201)
    async create(@Body() userData: User) {
        try {
            // Create the user
            const newUser = await this.usersService.create(userData);
            
            if (!newUser) {
              throw new HttpException('Failed to create user', HttpStatus.INTERNAL_SERVER_ERROR);
            }
        
            // Verify user was created by fetching from DB
            const createdUser = await this.usersService.findOne(newUser.email);
            if (!createdUser) {
              throw new HttpException('User creation verification failed', HttpStatus.INTERNAL_SERVER_ERROR);
            }
            // Return success response without password
            const { password, ...userWithoutPassword } = createdUser;
            return {
              statusCode: 201,
              message: 'User created successfully',
              data: userWithoutPassword
            };
        
          } catch (error) {
            // Handle specific errors
            if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
              throw new HttpException('Email already exists', HttpStatus.CONFLICT);
            }
            console.error('User creation error:', error);
            throw new HttpException(
              'Failed to create user', 
              HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
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




