export interface User {
    id?: number;
    email: string;
    password?: string;
    passwordHash?: string;
    firstName?: string;
    lastName?: string;
    role?: 'student' | 'instructor' | 'admin';
    createdAt?: Date;
    updatedAt?: Date;
    lastLogin?: Date;
}