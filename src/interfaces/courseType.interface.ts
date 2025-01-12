
export interface CourseType{
    id?: number;
    title: string;
    shortDescription: string;
    description: string
    thumbnail?: string;
    price: number;
    duration?: number; // in minutes
    level?: string; // beginner, int, advanced
    prerequisites?: string;
    objectives?: string;
    tags?: string, // JSON array of strings,,, array???
    language?: string;
    certificateAvailable?: boolean;
    featured?: number;
    rating?: number;
    enrollmentCount?: number;
    publishStatus?: string;
    publishedAt?: string;
    lastUpdated?: string;
    organisationId: number;
    createdBy: number; // instructor.id
}