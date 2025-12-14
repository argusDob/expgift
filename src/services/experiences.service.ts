import type { Result } from '../types/result'
import { HttpClient } from './http-client'

export type Experience = {
  id: number
  title: string
  category: 'food' | 'adventure' | 'culture'
  price_cents: number
  duration_min: number
  images: string[]
  short_description: string
}

export type ExperiencesResponse = {
  data: Experience[]
  page: number
  pageSize: number
  total: number
}

class ExperiencesService {
  constructor(private httpClient: HttpClient) {}

  async search(q: string, page: number = 1, signal?: AbortSignal): Promise<ExperiencesResponse | null> {
    const url = new URL('/experiences', 'http://localhost:3001')
    if (q) url.searchParams.set('q', q)
    url.searchParams.set('page', page.toString())
    
    const result = await this.httpClient.request<ExperiencesResponse>({
      method: 'GET',
      url: url.pathname + url.search,
      signal
    })
    
    return result.success ? result.data : null
  }

  async detail(id: number): Promise<Experience | null> {
    const result = await this.httpClient.request<Experience>({
      method: 'GET',
      url: `/experiences/${id}`,
    })
    
    return result.success ? result.data : null
  }
}

// Factory function
export function createExperiencesService(httpClient: HttpClient) {
  return new ExperiencesService(httpClient)
}

// Default instance
import { httpClient } from './http-client'
export const experiencesService = createExperiencesService(httpClient)
