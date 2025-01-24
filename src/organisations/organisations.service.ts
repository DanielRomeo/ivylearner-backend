import { Injectable } from '@nestjs/common';
import { DatabaseProvider } from 'src/database/database.provider';
import { organisation } from '../database/schema';
import { eq } from 'drizzle-orm';
import { OrganisationType } from '../interfaces/organisation.interface';

@Injectable()
export class OrganisationsService {
    constructor(private readonly databaseProvider: DatabaseProvider) {}

    // Find the first organization created by an instructor
    async findFirstByInstructor(instructorId: number): Promise<OrganisationType | null> {
        const db = this.databaseProvider.getDb();

        const [firstOrganisation] = await db
            .select()
            .from(organisation)
            .where(eq(organisation.createdBy, instructorId))
            .limit(1);

        return firstOrganisation ?? null;
    }

    // Find one organization by ID
    async findOne(id: number): Promise<OrganisationType | null> {
        const db = this.databaseProvider.getDb();

        const [organisationInfo] = await db
            .select()
            .from(organisation)
            .where(eq(organisation.id, id));

        return organisationInfo ?? null;
    }

    // Create an organization
    async create(organisationData: OrganisationType): Promise<OrganisationType> {
        const db = this.databaseProvider.getDb();

        const [newOrganization] = await db
            .insert(organisation)
            .values({
                name: organisationData.name,
                description: organisationData.description,
                shortDescription: organisationData.shortDescription,
                createdBy: organisationData.createdBy, // instructor.id
            })
            .returning();

        return newOrganization;
    }
}
