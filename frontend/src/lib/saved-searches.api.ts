import api from './api'

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
