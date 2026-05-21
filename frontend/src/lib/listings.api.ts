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