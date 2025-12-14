import { httpClient } from './http-client'

export function setupAxiosInterceptors() {
  const client = httpClient.getClient()
  
  // Request interceptor: Proactive refresh (30s) + header
  client.interceptors.request.use(async (config) => {
    // Skip interceptors for auth endpoints
    if (config.url?.startsWith('/auth/')) {
      return config
    }
    
    const { useAuthStore } = await import('../stores/auth')
    const auth = useAuthStore()
    
    // Proactive refresh: if token expires in < 30 seconds
    if (auth.isAuthenticated && auth.refreshToken && auth.exp > 0) {
      const delta = auth.exp * 1000 - Date.now()
      
      if (delta < 30000 && delta > 0) {
        const ok = await auth.tryRefresh()
        // If refresh failed, redirect to login
        if (!ok && typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
      }
    }
    
    // Add auth header
    Object.assign(config.headers, auth.getAuthHeader())
    return config
  })
  
  // Response interceptor: Reactive refresh (401) + retry
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      // Skip interceptors for auth endpoints
      if (error.config?.url?.startsWith('/auth/')) {
        return Promise.reject(error)
      }
      
      const { useAuthStore } = await import('../stores/auth')
      const auth = useAuthStore()
      
      if (error.response?.status === 401 && auth.refreshToken) {
        const ok = await auth.tryRefresh()
        if (ok) {
          const cfg = error.config
          Object.assign(cfg.headers, auth.getAuthHeader())
          return client(cfg) // Retry with new token
        }
        // If refresh failed, redirect to login
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
      }
      
      return Promise.reject(error)
    }
  )
}
