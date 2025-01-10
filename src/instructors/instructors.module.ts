import { Module, forwardRef } from '@nestjs/common';
import { InstructorsController } from './instructors.controller';
import { AuthModule } from 'src/auth/auth.module';
import { DatabaseModule } from 'src/database/database.module';
import { AuthService } from 'src/auth/auth.service';
import { InstructorsService } from './instructors.service';

@Module({
    imports: [DatabaseModule, forwardRef(() => AuthModule)],
    controllers: [InstructorsController],
    exports: [InstructorsService],
})
export class InstructorsModule {}
