import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { DatabaseProvider } from '../database/database.provider';
import { organizations, organizationMembers, users, Organization, NewOrganization, OrganizationMember } from '../database/schema';
import { eq, and } from 'drizzle-orm';

@Injectable()
export class OrganizationsService {
    constructor(private readonly databaseProvider: DatabaseProvider) {}

    // Helper function to generate slug from name
    private generateSlug(name: string): string {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }

    // Create a new organization
    async create(orgData: Partial<NewOrganization>): Promise<Organization> {
        const db = this.databaseProvider.getDb();

        // Generate slug if not provided
        const slug = orgData.slug || this.generateSlug(orgData.name!);

        // Check if slug already exists
        const [existing] = await db
            .select()
            .from(organizations)
            .where(eq(organizations.slug, slug));

        if (existing) {
            throw new HttpException(
                'Organization with this name already exists',
                HttpStatus.CONFLICT
            );
        }

        // Insert new organization
        const [newOrg] = await db
            .insert(organizations)
            .values({
                ...orgData,
                slug,
                createdAt: new Date(),
                updatedAt: new Date(),
            })
            .returning();

        // organizationMembers entry
        await db
            .insert(organizationMembers)
            .values({
                organizationId: newOrg.id,
                userId: orgData.createdByUserId!,
                role: 'owner',
                joinedAt: new Date(),
            });


        // Automatically add the creator as an owner
        // if (newOrg && orgData.createdByUserId) {
        //     await db.insert(organizationMembers).values({
        //         organizationId: newOrg.id,
        //         userId: orgData.createdByUserId,
        //         role: 'owner',
        //         joinedAt: new Date(),
        //     });
        // }

        return newOrg;
    }

    // Get all organizations (public or all if admin)
    async findAll(userId?: number): Promise<Organization[]> {
        const db = this.databaseProvider.getDb();
        
        // For now, return all public organizations
        // You can add authorization logic later
        const orgs = await db
            .select()
            .from(organizations)
            .where(eq(organizations.isPublic, true));

        return orgs;
    }

    // Get organization by ID
    async findById(id: number): Promise<Organization> {
        const db = this.databaseProvider.getDb();

        const [org] = await db
            .select()
            .from(organizations)
            .where(eq(organizations.id, id));

        if (!org) {
            throw new HttpException('Organization not found', HttpStatus.NOT_FOUND);
        }

        return org;
    }

    // Get organization by slug
    async findBySlug(slug: string): Promise<Organization> {
        const db = this.databaseProvider.getDb();

        const [org] = await db
            .select()
            .from(organizations)
            .where(eq(organizations.slug, slug));

        if (!org) {
            throw new HttpException('Organization not found', HttpStatus.NOT_FOUND);
        }

        return org;
    }

    // Get organizations created by a specific user
    async findByCreator(userId: number): Promise<Organization[]> {
        const db = this.databaseProvider.getDb();

        const orgs = await db
            .select()
            .from(organizations)
            .where(eq(organizations.createdByUserId, userId));

        return orgs;
    }

    // Get organizations where user is a member
    async findByMember(userId: number): Promise<(Organization & { memberRole: string })[]> {
        const db = this.databaseProvider.getDb();

        const results = await db
            .select({
                org: organizations,
                memberRole: organizationMembers.role,
            })
            .from(organizationMembers)
            .innerJoin(organizations, eq(organizationMembers.organizationId, organizations.id))
            .where(eq(organizationMembers.userId, userId));

        return results.map(r => ({ ...r.org, memberRole: r.memberRole }));
    }

    // Update organization
    async update(id: number, updateData: Partial<Organization>): Promise<Organization> {
        const db = this.databaseProvider.getDb();

        // Check if organization exists
        await this.findById(id);

        // If name is being updated, regenerate slug
        if (updateData.name) {
            updateData.slug = this.generateSlug(updateData.name);
        }

        const [updated] = await db
            .update(organizations)
            .set({
                ...updateData,
                updatedAt: new Date(),
            })
            .where(eq(organizations.id, id))
            .returning();

        return updated;
    }

    // Delete organization
    async remove(id: number): Promise<void> {
        const db = this.databaseProvider.getDb();

        // Check if organization exists
        await this.findById(id);

        await db.delete(organizations).where(eq(organizations.id, id));
    }

    // ========================================================================
    // MEMBER MANAGEMENT
    // ========================================================================

    // Add a member to organization
    async addMember(
        organizationId: number,
        userId: number,
        role: 'owner' | 'admin' | 'instructor' | 'student' = 'student'
    ): Promise<OrganizationMember> {
        const db = this.databaseProvider.getDb();

        // Check if organization exists
        await this.findById(organizationId);

        // Check if user exists
        const [user] = await db.select().from(users).where(eq(users.id, userId));
        if (!user) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }

        // Check if user is already a member
        const [existing] = await db
            .select()
            .from(organizationMembers)
            .where(
                and(
                    eq(organizationMembers.organizationId, organizationId),
                    eq(organizationMembers.userId, userId)
                )
            );

        if (existing) {
            throw new HttpException(
                'User is already a member of this organization',
                HttpStatus.CONFLICT
            );
        }

        const [newMember] = await db
            .insert(organizationMembers)
            .values({
                organizationId,
                userId,
                role,
                joinedAt: new Date(),
            })
            .returning();

        return newMember;
    }

    // Get all members of an organization
    async getMembers(organizationId: number) {
        const db = this.databaseProvider.getDb();

        // Check if organization exists
        await this.findById(organizationId);

        const members = await db
            .select({
                userId: users.id,
                email: users.email,
                firstName: users.firstName,
                lastName: users.lastName,
                role: organizationMembers.role,
                joinedAt: organizationMembers.joinedAt,
            })
            .from(organizationMembers)
            .innerJoin(users, eq(organizationMembers.userId, users.id))
            .where(eq(organizationMembers.organizationId, organizationId));

        return members;
    }

    // Update member role
    async updateMemberRole(
        organizationId: number,
        userId: number,
        newRole: 'owner' | 'admin' | 'instructor' | 'student'
    ): Promise<OrganizationMember> {
        const db = this.databaseProvider.getDb();

        // Check if member exists
        const [existing] = await db
            .select()
            .from(organizationMembers)
            .where(
                and(
                    eq(organizationMembers.organizationId, organizationId),
                    eq(organizationMembers.userId, userId)
                )
            );

        if (!existing) {
            throw new HttpException(
                'User is not a member of this organization',
                HttpStatus.NOT_FOUND
            );
        }

        const [updated] = await db
            .update(organizationMembers)
            .set({ role: newRole })
            .where(
                and(
                    eq(organizationMembers.organizationId, organizationId),
                    eq(organizationMembers.userId, userId)
                )
            )
            .returning();

        return updated;
    }

    // Remove member from organization
    async removeMember(organizationId: number, userId: number): Promise<void> {
        const db = this.databaseProvider.getDb();

        // Check if member exists
        const [existing] = await db
            .select()
            .from(organizationMembers)
            .where(
                and(
                    eq(organizationMembers.organizationId, organizationId),
                    eq(organizationMembers.userId, userId)
                )
            );

        if (!existing) {
            throw new HttpException(
                'User is not a member of this organization',
                HttpStatus.NOT_FOUND
            );
        }

        await db
            .delete(organizationMembers)
            .where(
                and(
                    eq(organizationMembers.organizationId, organizationId),
                    eq(organizationMembers.userId, userId)
                )
            );
    }
}