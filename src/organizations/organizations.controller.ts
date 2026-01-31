import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    ParseIntPipe,
    UseGuards,
    HttpCode,
    HttpStatus,
    Request,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam,
    ApiBody,
    ApiProperty,
} from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsInt, IsEnum, IsEmail } from 'class-validator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrganizationsService } from './organizations.service';

// ============================================================================
// DTOs
// ============================================================================

class CreateOrganizationDto {
    @ApiProperty({ 
        example: 'Tech Academy',
        description: 'Organization name'
    })
    @IsString()
    name!: string;

    @ApiProperty({ 
        example: 'tech-academy',
        description: 'URL-friendly slug (auto-generated if not provided)',
        required: false
    })
    @IsOptional()
    @IsString()
    slug?: string;

    @ApiProperty({ 
        example: 'Leading technology education provider',
        description: 'Organization description',
        required: false
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ 
        example: 'https://example.com/logo.png',
        description: 'Logo URL',
        required: false
    })
    @IsOptional()
    @IsString()
    logoUrl?: string;

    @ApiProperty({ 
        example: 'https://techacademy.com',
        description: 'Website URL',
        required: false
    })
    @IsOptional()
    @IsString()
    website?: string;

    @ApiProperty({ 
        example: 'contact@techacademy.com',
        description: 'Contact email',
        required: false
    })
    @IsOptional()
    @IsEmail()
    contactEmail?: string;

    @ApiProperty({ 
        example: '123 Tech Street, Digital City',
        description: 'Physical address',
        required: false
    })
    @IsOptional()
    @IsString()
    address?: string;

    @ApiProperty({ 
        example: 2020,
        description: 'Year founded',
        required: false
    })
    @IsOptional()
    @IsInt()
    foundedYear?: number;

    @ApiProperty({ 
        example: true,
        description: 'Is organization publicly visible',
        required: false,
        default: true
    })
    @IsOptional()
    @IsBoolean()
    isPublic?: boolean;
}

class UpdateOrganizationDto {
    @ApiProperty({ 
        example: 'Tech Academy Updated',
        description: 'Organization name',
        required: false
    })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({ 
        example: 'Updated description',
        description: 'Organization description',
        required: false
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ 
        example: 'https://example.com/new-logo.png',
        description: 'Logo URL',
        required: false
    })
    @IsOptional()
    @IsString()
    logoUrl?: string;

    @ApiProperty({ 
        example: 'https://newtechacademy.com',
        description: 'Website URL',
        required: false
    })
    @IsOptional()
    @IsString()
    website?: string;

    @ApiProperty({ 
        example: 'newcontact@techacademy.com',
        description: 'Contact email',
        required: false
    })
    @IsOptional()
    @IsEmail()
    contactEmail?: string;

    @ApiProperty({ 
        example: '456 New Street, Digital City',
        description: 'Physical address',
        required: false
    })
    @IsOptional()
    @IsString()
    address?: string;

    @ApiProperty({ 
        example: false,
        description: 'Is organization publicly visible',
        required: false
    })
    @IsOptional()
    @IsBoolean()
    isPublic?: boolean;
}

class AddMemberDto {
    @ApiProperty({ 
        example: 5,
        description: 'User ID to add as member'
    })
    @IsInt()
    userId!: number;

    @ApiProperty({ 
        example: 'instructor',
        description: 'Member role in organization',
        enum: ['owner', 'admin', 'instructor', 'student'],
        default: 'student'
    })
    @IsOptional()
    @IsEnum(['owner', 'admin', 'instructor', 'student'])
    role?: 'owner' | 'admin' | 'instructor' | 'student';
}

class UpdateMemberRoleDto {
    @ApiProperty({ 
        example: 'admin',
        description: 'New role for the member',
        enum: ['owner', 'admin', 'instructor', 'student']
    })
    @IsEnum(['owner', 'admin', 'instructor', 'student'])
    role!: 'owner' | 'admin' | 'instructor' | 'student';
}

// ============================================================================
// CONTROLLER
// ============================================================================

@ApiTags('Organizations')
@Controller('organizations')
export class OrganizationsController {
    constructor(private readonly organizationsService: OrganizationsService) {}

    // ========================================================================
    // ORGANIZATION CRUD
    // ========================================================================

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ 
        summary: 'Create a new organization',
        description: 'Create a new organization. The authenticated user becomes the owner.'
    })
    @ApiBody({ type: CreateOrganizationDto })
    @ApiResponse({ 
        status: 201, 
        description: 'Organization created successfully',
        schema: {
            example: {
                statusCode: 201,
                message: 'Organization created successfully',
                data: {
                    id: 1,
                    slug: 'tech-academy',
                    name: 'Tech Academy',
                    description: 'Leading technology education provider',
                    createdByUserId: 1,
                    createdAt: '2024-01-01T00:00:00.000Z'
                }
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 409, description: 'Organization with this name already exists' })
    async create(@Body() createDto: CreateOrganizationDto, @Request() req) {
        const org = await this.organizationsService.create({
            ...createDto,
            createdByUserId: req.user.id,
        });

        return {
            statusCode: 201,
            message: 'Organization created successfully',
            data: org,
        };
    }

    @Get()
    @ApiOperation({ 
        summary: 'Get all public organizations',
        description: 'Retrieve all publicly visible organizations'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Organizations retrieved successfully',
        schema: {
            example: {
                statusCode: 200,
                message: 'Organizations retrieved successfully',
                data: [
                    {
                        id: 1,
                        slug: 'tech-academy',
                        name: 'Tech Academy',
                        description: 'Leading technology education provider',
                        logoUrl: 'https://example.com/logo.png'
                    }
                ]
            }
        }
    })
    async findAll() {
        const orgs = await this.organizationsService.findAll();
        return {
            statusCode: 200,
            message: 'Organizations retrieved successfully',
            data: orgs,
        };
    }

    @Get('my-organizations')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ 
        summary: 'Get my organizations',
        description: 'Get all organizations where the authenticated user is a member'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'My organizations retrieved successfully'
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async getMyOrganizations(@Request() req) {
        const orgs = await this.organizationsService.findByMember(req.user.id);
        return {
            statusCode: 200,
            message: 'My organizations retrieved successfully',
            data: orgs,
        };
    }

    @Get(':id')
    @ApiOperation({ 
        summary: 'Get organization by ID',
        description: 'Retrieve a specific organization by ID'
    })
    @ApiParam({ 
        name: 'id', 
        type: 'number', 
        description: 'Organization ID',
        example: 1
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Organization found successfully'
    })
    @ApiResponse({ status: 404, description: 'Organization not found' })
    async findOne(@Param('id', ParseIntPipe) id: number) {
        const org = await this.organizationsService.findById(id);
        return {
            statusCode: 200,
            message: 'Organization found successfully',
            data: org,
        };
    }

    @Get('slug/:slug')
    @ApiOperation({ 
        summary: 'Get organization by slug',
        description: 'Retrieve a specific organization by its URL slug'
    })
    @ApiParam({ 
        name: 'slug', 
        type: 'string', 
        description: 'Organization slug',
        example: 'tech-academy'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Organization found successfully'
    })
    @ApiResponse({ status: 404, description: 'Organization not found' })
    async findBySlug(@Param('slug') slug: string) {
        const org = await this.organizationsService.findBySlug(slug);
        return {
            statusCode: 200,
            message: 'Organization found successfully',
            data: org,
        };
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ 
        summary: 'Update organization',
        description: 'Update organization details (requires authentication)'
    })
    @ApiParam({ 
        name: 'id', 
        type: 'number', 
        description: 'Organization ID'
    })
    @ApiBody({ type: UpdateOrganizationDto })
    @ApiResponse({ 
        status: 200, 
        description: 'Organization updated successfully'
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Organization not found' })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateDto: UpdateOrganizationDto
    ) {
        const org = await this.organizationsService.update(id, updateDto);
        return {
            statusCode: 200,
            message: 'Organization updated successfully',
            data: org,
        };
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ 
        summary: 'Delete organization',
        description: 'Delete an organization (requires authentication)'
    })
    @ApiParam({ 
        name: 'id', 
        type: 'number', 
        description: 'Organization ID'
    })
    @ApiResponse({ status: 204, description: 'Organization deleted successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Organization not found' })
    async remove(@Param('id', ParseIntPipe) id: number) {
        await this.organizationsService.remove(id);
    }

    // ========================================================================
    // MEMBER MANAGEMENT
    // ========================================================================

    @Post(':id/members')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ 
        summary: 'Add member to organization',
        description: 'Add a new member to the organization'
    })
    @ApiParam({ 
        name: 'id', 
        type: 'number', 
        description: 'Organization ID'
    })
    @ApiBody({ type: AddMemberDto })
    @ApiResponse({ 
        status: 201, 
        description: 'Member added successfully'
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Organization or user not found' })
    @ApiResponse({ status: 409, description: 'User is already a member' })
    async addMember(
        @Param('id', ParseIntPipe) id: number,
        @Body() addMemberDto: AddMemberDto
    ) {
        const member = await this.organizationsService.addMember(
            id,
            addMemberDto.userId,
            addMemberDto.role
        );

        return {
            statusCode: 201,
            message: 'Member added successfully',
            data: member,
        };
    }

    @Get(':id/members')
    @ApiOperation({ 
        summary: 'Get organization members',
        description: 'Get all members of the organization'
    })
    @ApiParam({ 
        name: 'id', 
        type: 'number', 
        description: 'Organization ID'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Members retrieved successfully',
        schema: {
            example: {
                statusCode: 200,
                message: 'Members retrieved successfully',
                data: [
                    {
                        userId: 1,
                        email: 'john@example.com',
                        firstName: 'John',
                        lastName: 'Doe',
                        role: 'owner',
                        joinedAt: '2024-01-01T00:00:00.000Z'
                    }
                ]
            }
        }
    })
    @ApiResponse({ status: 404, description: 'Organization not found' })
    async getMembers(@Param('id', ParseIntPipe) id: number) {
        const members = await this.organizationsService.getMembers(id);
        return {
            statusCode: 200,
            message: 'Members retrieved successfully',
            data: members,
        };
    }

    @Put(':id/members/:userId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ 
        summary: 'Update member role',
        description: 'Update a member\'s role in the organization'
    })
    @ApiParam({ 
        name: 'id', 
        type: 'number', 
        description: 'Organization ID'
    })
    @ApiParam({ 
        name: 'userId', 
        type: 'number', 
        description: 'User ID'
    })
    @ApiBody({ type: UpdateMemberRoleDto })
    @ApiResponse({ 
        status: 200, 
        description: 'Member role updated successfully'
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Organization or member not found' })
    async updateMemberRole(
        @Param('id', ParseIntPipe) id: number,
        @Param('userId', ParseIntPipe) userId: number,
        @Body() updateRoleDto: UpdateMemberRoleDto
    ) {
        const member = await this.organizationsService.updateMemberRole(
            id,
            userId,
            updateRoleDto.role
        );

        return {
            statusCode: 200,
            message: 'Member role updated successfully',
            data: member,
        };
    }

    @Delete(':id/members/:userId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ 
        summary: 'Remove member from organization',
        description: 'Remove a member from the organization'
    })
    @ApiParam({ 
        name: 'id', 
        type: 'number', 
        description: 'Organization ID'
    })
    @ApiParam({ 
        name: 'userId', 
        type: 'number', 
        description: 'User ID'
    })
    @ApiResponse({ status: 204, description: 'Member removed successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Organization or member not found' })
    async removeMember(
        @Param('id', ParseIntPipe) id: number,
        @Param('userId', ParseIntPipe) userId: number
    ) {
        await this.organizationsService.removeMember(id, userId);
    }
}