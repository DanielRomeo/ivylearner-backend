import { Injectable } from '@nestjs/common';
import { DatabaseProvider } from 'src/database/database.provider';
import { organisation } from '../database/schema';
import { eq } from 'drizzle-orm';
import { Instructor , InstructorUser } from '../interfaces/instructor.interface';
import {OrganisationType} from '../interfaces/organisation.interface'



@Injectable()
export class OrganisationsService {
    constructor(private readonly databaseProvider: DatabaseProvider) {}

    // find one organisation:
   async findOne(id: number): Promise<OrganisationType> {
        const db = this.databaseProvider.getDb();
        const [organisationInfo] = await db
            .select()
            .from(organisation)
            .where(eq(organisation.id, id));
        return organisationInfo ?? null;
    }

    // create an organisation:
    async create(organisationData: OrganisationType): Promise<OrganisationType> {
        const db = this.databaseProvider.getDb();

        const [newUser] = await db
            .insert(organisation)
            .values({
                name: organisationData.name,
                description: organisationData.description,
                shortDescription: organisationData.shortDescription,
                createdBy: organisationData.createdBy // instructor.id
            })
            .returning();

        return newUser;
    }
}
