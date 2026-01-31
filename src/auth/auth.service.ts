import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        @Inject(forwardRef(() => UsersService))
        private usersService: UsersService,
        private jwtService: JwtService,
    ) {}

    async validateUser(email: string, password: string): Promise<any> {
        const user = await this.usersService.validateUser(email, password);

        if (!user) {
            return null;
        }

        return user;
    }

    async login(user: any) {
        const payload = { 
            email: user.email, 
            sub: user.id,
            role: user.role 
        };

        return {
            access_token: this.jwtService.sign(payload),
        };
    }
}