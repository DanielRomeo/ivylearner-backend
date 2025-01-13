
export interface CourseType{
    id: number;
    title: string;
    shortDescription: string;
    description: string | null;
    thumbnail: string | null;
    price: number | null;
    duration: number | null;
    level: string | null;
    prerequisites: string | null;
    objectives: string | null;
    tags: string | null;
    language: string;
    certificateAvailable: boolean | null;
    featured: boolean | null;
    rating: number | null;
    enrollmentCount: number | null;
    publishStatus: string | null;
    publishedAt: Date | null;
    lastUpdated: Date | null;
    organisationId: number;
    createdBy: number;
}
