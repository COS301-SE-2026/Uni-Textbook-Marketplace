export class CreateListingDto {
  title: string;
  bookId: string;
  moduleId?: string;
  condition: 'new' | 'good' | 'fair' | 'poor';
  annotationLevel: 'none' | 'light' | 'heavy';
  price: number;
  photoUrls?: string[];
  hasNotes?: boolean;
}