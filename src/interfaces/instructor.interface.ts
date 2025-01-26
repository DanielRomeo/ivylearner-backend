import { User } from './user.interface';

export interface Instructor {
    id?: number;
    userId?: number;
    firstName: string;
    lastName: string;
    profilePicture?: string;
    bio?: string;
    specialization?: string;
    yearsOfExperience?: number;
    linkedinUrl?: string;
    rating?: number;
}

export interface InstructorUser extends User, Instructor {}
