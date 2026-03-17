// src/organizations/organizations.service.ts
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { DatabaseProvider } from '../database/database.provider';
import { organizations, organizationMembers, users, Organization, NewOrganization, OrganizationMember } from '../database/schema';
import { eq, and } from 'drizzle-orm';

@Injectable()
export class OrganizationsService {
    constructor(private readonly databaseProvider: DatabaseProvider) {}

    private generateSlug(name: string): string {
        return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    async create(orgData: Partial<NewOrganization>): Promise<Organization> {
        const db = this.databaseProvider.getDb();

        if (!orgData.name) throw new HttpException('Name is required', HttpStatus.BAD_REQUEST);
        if (!orgData.createdByUserId) throw new HttpException('createdByUserId is required', HttpStatus.BAD_REQUEST);

        const slug = orgData.slug || this.generateSlug(orgData.name);

        const [existing] = await db.select().from(organizations).where(eq(organizations.slug, slug));
        if (existing) throw new HttpException('Organization with this name already exists', HttpStatus.CONFLICT);

        // Pass fields explicitly — do NOT spread Partial<NewOrganization> into .values()
        const [newOrg] = await db
            .insert(organizations)
            .values({
                name: orgData.name,
                createdByUserId: orgData.createdByUserId,
                slug,
                description: orgData.description ?? null,
                logoUrl: orgData.logoUrl ?? null,
                website: orgData.website ?? null,
                contactEmail: orgData.contactEmail ?? null,
                address: orgData.address ?? null,
                foundedYear: orgData.foundedYear ?? null,
                isPublic: orgData.isPublic ?? true,
            })
            .returning();

        await db.insert(organizationMembers).values({
            organizationId: newOrg.id,
            userId: orgData.createdByUserId,
            role: 'owner',
            joinedAt: new Date(),
        });

        return newOrg;
    }

    async findAll(): Promise<Organization[]> {
        const db = this.databaseProvider.getDb();
        return db.select().from(organizations).where(eq(organizations.isPublic, true));
    }

    async findById(id: number): Promise<Organization> {
        const db = this.databaseProvider.getDb();
        const [org] = await db.select().from(organizations).where(eq(organizations.id, id));
        if (!org) throw new HttpException('Organization not found', HttpStatus.NOT_FOUND);
        return org;
    }

    async findBySlug(slug: string): Promise<Organization> {
        const db = this.databaseProvider.getDb();
        const [org] = await db.select().from(organizations).where(eq(organizations.slug, slug));
        if (!org) throw new HttpException('Organization not found', HttpStatus.NOT_FOUND);
        return org;
    }

    async findByCreator(userId: number): Promise<Organization[]> {
        const db = this.databaseProvider.getDb();
        return db.select().from(organizations).where(eq(organizations.createdByUserId, userId));
    }

    async findByMember(userId: number): Promise<(Organization & { memberRole: string })[]> {
        const db = this.databaseProvider.getDb();
        const results = await db
            .select({ org: organizations, memberRole: organizationMembers.role })
            .from(organizationMembers)
            .innerJoin(organizations, eq(organizationMembers.organizationId, organizations.id))
            .where(eq(organizationMembers.userId, userId));
        return results.map(r => ({ ...r.org, memberRole: r.memberRole }));
    }

    async update(id: number, updateData: Partial<Organization>): Promise<Organization> {
        const db = this.databaseProvider.getDb();
        await this.findById(id);
        if (updateData.name) updateData.slug = this.generateSlug(updateData.name);
        const [updated] = await db.update(organizations).set({ ...updateData, updatedAt: new Date() }).where(eq(organizations.id, id)).returning();
        return updated;
    }

    async remove(id: number): Promise<void> {
        const db = this.databaseProvider.getDb();
        await this.findById(id);
        await db.delete(organizations).where(eq(organizations.id, id));
    }

    async addMember(organizationId: number, userId: number, role: 'owner' | 'admin' | 'instructor' | 'student' = 'student'): Promise<OrganizationMember> {
        const db = this.databaseProvider.getDb();
        await this.findById(organizationId);
        const [user] = await db.select().from(users).where(eq(users.id, userId));
        if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        const [existing] = await db.select().from(organizationMembers).where(and(eq(organizationMembers.organizationId, organizationId), eq(organizationMembers.userId, userId)));
        if (existing) throw new HttpException('User is already a member of this organization', HttpStatus.CONFLICT);
        const [newMember] = await db.insert(organizationMembers).values({ organizationId, userId, role, joinedAt: new Date() }).returning();
        return newMember;
    }

    async getMembers(organizationId: number) {
        const db = this.databaseProvider.getDb();
        await this.findById(organizationId);
        return db
            .select({ userId: users.id, email: users.email, firstName: users.firstName, lastName: users.lastName, role: organizationMembers.role, joinedAt: organizationMembers.joinedAt })
            .from(organizationMembers)
            .innerJoin(users, eq(organizationMembers.userId, users.id))
            .where(eq(organizationMembers.organizationId, organizationId));
    }

    async updateMemberRole(organizationId: number, userId: number, newRole: 'owner' | 'admin' | 'instructor' | 'student'): Promise<OrganizationMember> {
        const db = this.databaseProvider.getDb();
        const [existing] = await db.select().from(organizationMembers).where(and(eq(organizationMembers.organizationId, organizationId), eq(organizationMembers.userId, userId)));
        if (!existing) throw new HttpException('User is not a member of this organization', HttpStatus.NOT_FOUND);
        const [updated] = await db.update(organizationMembers).set({ role: newRole }).where(and(eq(organizationMembers.organizationId, organizationId), eq(organizationMembers.userId, userId))).returning();
        return updated;
    }

    async removeMember(organizationId: number, userId: number): Promise<void> {
        const db = this.databaseProvider.getDb();
        const [existing] = await db.select().from(organizationMembers).where(and(eq(organizationMembers.organizationId, organizationId), eq(organizationMembers.userId, userId)));
        if (!existing) throw new HttpException('User is not a member of this organization', HttpStatus.NOT_FOUND);
        await db.delete(organizationMembers).where(and(eq(organizationMembers.organizationId, organizationId), eq(organizationMembers.userId, userId)));
    }
}