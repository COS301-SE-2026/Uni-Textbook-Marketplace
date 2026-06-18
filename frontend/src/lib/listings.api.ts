import { api } from './api';

export interface Book {
  id: string;
  isbn?: string;
  title: string;
  author?: string;
  edition?: number;
  publisher?: string;
}

export interface Module {
  id: string;
  code: string;
  name: string;
  faculty?: string;
}

export interface CreateBookData {
  isbn?: string;
  title: string;
  author?: string;
  edition?: number;
  publisher?: string;
}

export interface CreateModuleData {
  code: string;
  name: string;
  faculty?: string;
}

export interface CreateListingData {
  title?: string
  bookId: string;
  moduleId?: string;
  condition: 'new' | 'good' | 'fair' | 'poor';
  annotationLevel: 'none' | 'light' | 'heavy';
  price: number;
  hasNotes: boolean;
  photoUrls: string[];
}

export interface ListingResponse {
  listings: any[];
  total: number;
}

export async function createBook(data: CreateBookData): Promise<Book> {
  return api.post<Book>('/books', data);
}

export async function createModule(data: CreateModuleData): Promise<Module> {
  return api.post<Module>('/modules', data);
}

export async function uploadImages(files: File[]): Promise<{ urls: string[] }> {
    console.log(`${files.length} images selected but upload not yet configured`)
    return { urls: [] }
}

export async function createListing(data: CreateListingData) {
  return api.post('/listings', data);
}

export async function getListings(queryParams?: string): Promise<{ listings: any[]; total: number }> {
  const url = queryParams ? `/listings?${queryParams}` : '/listings';

  console.log('getListings URL:', url);

  const data: unknown = await api.get(url);

  console.log('Raw response from backend:', data);
  console.log('Response type:', Array.isArray(data) ? 'Array' : typeof data);

  if (Array.isArray(data)) {
    console.log('Backend returned array with', data.length, 'items');
    return {
      listings: data,
      total: data.length
    };
  }

  if (data && typeof data === 'object') {
    
    const obj = data as Record<string, unknown>;

    const listings = obj.listings || obj.data || obj.items || obj.results || [];

    const listingsArray = Array.isArray(listings) ? listings : [];
    const total = obj.total ?? obj.count ?? listingsArray.length;

    console.log('Backend returned object with', listingsArray.length, 'items');

    return {
      listings: listingsArray,
      total: typeof total === 'number' ? total : listingsArray.length
    };
  }

  console.warn('Unexpected response format:', data);
  return {
    listings: [],
    total: 0
  };
}