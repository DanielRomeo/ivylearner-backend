import {
    Controller,
    Get,
    Patch,
    Body,
    UseGuards,
    Request,
    Param,
    ParseIntPipe,
} from '@nestjs/common';
import { UserProfilesService } from './user-profiles.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('User Profiles')
@Controller('profiles')
export class UserProfilesController {
    constructor(private readonly userProfilesService: UserProfilesService) {}

    /** Get the currently logged-in user's profile */
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @Get('me')
    @ApiOperation({ summary: 'Get own profile' })
    async getMyProfile(@Request() req: any) {
        // JWT strategy returns { id: payload.sub, email: payload.name }
        return this.userProfilesService.getProfile(req.user.id);
    }

    /** Get any user's public profile by id */
    @Get(':userId')
    @ApiOperation({ summary: 'Get user profile by id' })
    async getProfile(@Param('userId', ParseIntPipe) userId: number) {
        return this.userProfilesService.getProfile(userId);
    }

    /** Update (upsert) own profile */
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @Patch('me')
    @ApiOperation({ summary: 'Update own profile' })
    async updateMyProfile(@Request() req: any, @Body() dto: UpdateProfileDto) {
        // JWT strategy returns { id: payload.sub, email: payload.name }
        return this.userProfilesService.upsertProfile(req.user.id, dto);
    }
}