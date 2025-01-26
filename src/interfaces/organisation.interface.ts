export interface SocialMediaType {
    facebook?: string;
    x?: string;
    youtube?: string;
    whatsapp?: string;
}

export interface OrganisationType {
    id?: number;
    name: string;
    description: string;
    shortDescription: string;
    banner?: string;
    logo?: string;
    website?: string;
    email?: string;
    phone?: string;
    address?: string;
    socialMedia?: string[];
    verificationStatus?: string;
    foundedYear?: number;
    createdBy: number; // instructor.id
}
