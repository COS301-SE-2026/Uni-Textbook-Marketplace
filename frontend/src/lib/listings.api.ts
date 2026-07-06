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

    console.log('Uploading images:', files.length, 'files')
    if (!files || files.length === 0) {
      return { urls: []};
    }
    const formData = new FormData();
    files.forEach((file) => {
      console.log('Adding file:', file.name, file.type, file.size)

      formData.append('images', file);
    });

    try {
      const token = localStorage.getItem('token') || 
      
                    sessionStorage.getItem('auth_token') ||

                    (() =>  {
                      const user = sessionStorage.getItem('auth_user');
                      if (user) {
                        try {
                          return JSON.parse(user)?.token;
                        } catch {}
                      }

                      return null;
                    })();

      console.log('Token exists:', !!token)

      const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

      const url = `${BASE_URL}/images/upload`;
      console.log('Sending to:', url)

      const response = await fetch(`${BASE_URL}/images/upload`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: formData,
      });

      console.log('Response status:', response.status)

      if (!response.ok) {
        const error = await response.json();

        console.error('Upload fail:', error)
        throw new Error(error.message || 'Uploading failed');
      }
      const responseData = await response.json();

      console.log('Upload response:', responseData)

      if (responseData.url) {
        return { urls: [responseData.url]};
      }

      return { urls: responseData.urls || []};
    } catch (error) {
      console.error('Uploading error:', error);
      throw error;
      //return { urls: [] };
    }
}

export async function createListing(data: CreateListingData) {
  return api.post('/listings', data);
}

export async function getListings(queryParams?: string): Promise<{ listings: any[]; total: number }> {
  const url = queryParams ? `/listings?${queryParams}` : '/listings';


  const data: unknown = await api.get(url);


  if (Array.isArray(data)) {
    
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