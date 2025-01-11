import { Module, forwardRef } from '@nestjs/common';
import { InstructorsController } from './instructors.controller';
import { AuthModule } from 'src/auth/auth.module';
import { DatabaseModule } from 'src/database/database.module';
import { AuthService } from 'src/auth/auth.service';
import { InstructorsService } from './instructors.service';
import { UsersModule } from 'src/users/users.module';

@Module({
    imports: [DatabaseModule, forwardRef(() => AuthModule), UsersModule],
    providers: [InstructorsService],
    controllers: [InstructorsController],
    exports: [InstructorsService],
})
export class InstructorsModule {}
