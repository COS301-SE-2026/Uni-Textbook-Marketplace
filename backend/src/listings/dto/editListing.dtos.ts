import { IsUUID } from "class-validator";

export class EditListingDto {
    @IsUUID()
    id: string

    title?: string;
    condition?: 'new' | 'good' | 'fair' | 'poor';
    annotation_level?: 'none' | 'light' | 'heavy';
    price?: number;
    photo_urls?: string[];
    has_notes?: boolean;
    description?: string;
}