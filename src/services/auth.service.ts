import type { LoginResponse, RefreshResponse } from '../types/auth'
import type { Result } from '../types/result'
import { HttpClient } from './http-client'

class AuthService {
  constructor(private httpClient: HttpClient) {}

  async login(email: string, password: string): Promise<LoginResponse | null> {
    const result = await this.httpClient.request<LoginResponse>({
      method: 'POST',
      url: '/auth/login',
      data: { email, password },
    })
    return result.success ? result.data : null
  }
  
  async refresh(refreshToken: string): Promise<RefreshResponse | null> {
    const result = await this.httpClient.request<RefreshResponse>({
      method: 'POST',
      url: '/auth/refresh',
      data: { refresh_token: refreshToken },
    })
    return result.success ? result.data : null
  }
}

// Factory function
export function createAuthService(httpClient: HttpClient) {
  return new AuthService(httpClient)
}

// Default instance (backward compatibility)
import { httpClient } from './http-client'
export const authService = createAuthService(httpClient)
