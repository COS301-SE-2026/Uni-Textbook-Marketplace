import { api } from './api'

export interface SavedSearch {

  id: string

  filter_json: Filters
  created_at: string


}

export interface Filters {

  faculty?: string

  moduleCode?: string

  edition?: string

  priceMin?: string

  priceMax?: string
  condition?: string

  annotationLevel?: string
  search?: string

}

export async function getSavedSearches(): Promise<SavedSearch[]> {


  try {
    
    const apiReplySave = await api.get<SavedSearch[]>('/saved-searches/mine')


    return apiReplySave
  } catch (error) {


    console.error('Fail fetch of saved searches:', error)

    return []
  }
}

export async function createSavedSearch(filters: Filters): Promise<SavedSearch> {
  try {
   
    const apiReplyCreate = await api.post<SavedSearch>('/saved-searches', { filter_json: filters })
    
    return apiReplyCreate


  } catch (error) {

    console.error('Create saved search failed:', error)
    throw error
  }
}

export async function deleteSavedSearch(id: string): Promise<void> {


  try {
    
    await api.delete<void>(`/saved-searches/${id}`)
  } catch (error) {


    console.error('Failed to delete saved search:', error)

    throw error
  }
}