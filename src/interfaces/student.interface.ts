import { User } from './user.interface';

export interface StudentType {
    id?: number;
    userId?: number;
    firstName: string;
    lastName: string;
    profilePicture?: string;
    bio?: string;
    dateOfBirth?: number;
    educationLevel?: string;
    interests?: string;
    preferredLanguage?: string;
}

export interface StudentUser extends User, StudentType {}
