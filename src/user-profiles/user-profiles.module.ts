import { Module } from '@nestjs/common';
import { UserProfilesService } from './user-profiles.service';
import { UserProfilesController } from './user-profiles.controller';
import { DatabaseModule } from 'src/database/database.module';

@Module({
    imports: [DatabaseModule],
    providers: [UserProfilesService],
    controllers: [UserProfilesController],
    exports: [UserProfilesService],
})
export class UserProfilesModule {}