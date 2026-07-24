export class CreateListingDto {
  title!: string;
  bookId!: string;
  moduleId?: string;
  //missing sellerId
  condition: 'new' | 'good' | 'fair' | 'poor';
  annotationLevel: 'none' | 'light' | 'heavy';
  price!: number;
  photoUrls?: string[];
  hasNotes?: boolean;
  description: string;
}
