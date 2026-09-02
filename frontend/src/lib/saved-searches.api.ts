import { api } from './api'

export interface SavedSearch {
  id: string
  filter_json: Filters
  created_at: string
}

export interface SavedSearchMeta {

  total: number
  page: number
  limit: number
  pages: number

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

export interface PaginatedSavedSearchResponse {
  data: SavedSearch[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }

}

export async function getSavedSearches(page: number = 1, limit: number = 5): Promise<{ data: SavedSearch[]; meta: SavedSearchMeta }> {
  try {
    const response = await api.get<PaginatedSavedSearchResponse>(
      `/saved-searches/mine?page=${page}&limit=${limit}`
    )

    return {

      data: response.data,
      meta: {
        total: Number(response.meta.total),
        page: Number(response.meta.page),
        limit: Number(response.meta.limit),
        pages: Number(response.meta.totalPages),
      }
    }
  } catch (error) {
    console.error('Fail fetch of saved searches:', error)
    return {
      data: [],
      meta: {
        total: 0,
        page: 1,
        limit,
        pages: 1
      }
    }
  }
}

export async function createSavedSearch(
  filters: Filters
): Promise<SavedSearch> {
  try {
    const savedSearch = await api.post<SavedSearch>(
      '/saved-searches',
      { filter_json: filters }
    )

    return savedSearch
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