import axios, { type AxiosInstance, type AxiosError } from 'axios'
import type { Result } from '../types/result'

const API_BASE_URL = 'http://localhost:3001'

export class HttpClient implements IHttpClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({ baseURL: API_BASE_URL })
  }

  getClient(): AxiosInstance {
    return this.client
  }

  async request<T>(config: {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE'
    url: string
    data?: unknown
    signal?: AbortSignal
  }): Promise<Result<T>> {
    // Check if already aborted before starting
    if (config.signal?.aborted) {
      return { success: false, error: new Error('Request cancelled') }
    }
    
    try {
      // Axios expects signal at root level of config
      const axiosConfig = {
        method: config.method,
        url: config.url,
        data: config.data,
        signal: config.signal // Explicitly pass signal
      }
      
      const { data } = await this.client.request<T>(axiosConfig)
      return { success: true, data }
    } catch (error) {
      // Ignore AbortError - request was intentionally cancelled
      if (axios.isCancel(error) || (error instanceof Error && error.name === 'AbortError')) {
        return { success: false, error: new Error('Request cancelled') }
      }
      return { 
        success: false, 
        error: this.normalizeError(error, config.url) 
      }
    }
  }

  private normalizeError(error: unknown, url: string): Error {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError
      return new Error(
        `Request failed [${url}]: ${axiosError.response?.status} - ${axiosError.message}`
      )
    }
    return error instanceof Error ? error : new Error(String(error))
  }
}

export interface IHttpClient {
  request<T>(config: {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE'
    url: string
    data?: any
  }): Promise<Result<T>>
}

// Singleton instance
export const httpClient = new HttpClient()
