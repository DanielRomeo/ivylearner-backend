import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthModule } from 'src/auth/auth.module';
import { DatabaseModule } from 'src/database/database.module';
import { UsersController } from './users.controller';
import { AuthService } from 'src/auth/auth.service';

@Module({
    imports: [DatabaseModule, forwardRef(() => AuthModule)],
    providers: [UsersService],
    controllers: [UsersController],
    exports: [UsersService],
})
export class UsersModule {}
