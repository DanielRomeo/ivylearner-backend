import { Module } from '@nestjs/common';
import { OrganisationsController } from './organisations.controller';
import { OrganisationsService } from './organisations.service';
import { InstructorsModule } from 'src/instructors/instructors.module';
import { DatabaseModule } from 'src/database/database.module';

@Module({

    imports: [DatabaseModule, InstructorsModule],
    providers: [OrganisationsService],
    controllers: [OrganisationsController],
    exports: [OrganisationsService],
})
export class OrganisationsModule {}
