import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import axios, { AxiosInstance } from 'axios'

// Mock httpClient BEFORE importing setupAxiosInterceptors
const mockAxiosInstance = axios.create({ baseURL: 'http://localhost:3001' })

vi.mock('../../src/services/http-client', () => ({
  httpClient: {
    getClient: () => mockAxiosInstance
  }
}))

// Mock the auth store
vi.mock('../../src/stores/auth', () => {
  const mockStore = {
    isAuthenticated: false,
    refreshToken: '',
    exp: 0,
    user: null,
    setAccessToken: vi.fn(),
    setRefreshToken: vi.fn(),
    setUser: vi.fn(),
    setExp: vi.fn(),
    tryRefresh: vi.fn(),
    getAuthHeader: vi.fn(() => ({})),
  }
  
  return {
    useAuthStore: () => mockStore
  }
})

// Import AFTER mocks
import { setupAxiosInterceptors } from '../../src/services/axios-interceptors'

describe('axios-interceptors', () => {
  let mockStore: any

  beforeEach(async () => {
    // Get the mocked store
    const { useAuthStore } = await import('../../src/stores/auth')
    mockStore = useAuthStore()
    
    // Reset mocks
    vi.clearAllMocks()
    
    // Clear interceptors
    mockAxiosInstance.interceptors.request.clear()
    mockAxiosInstance.interceptors.response.clear()
    
    // Setup interceptors
    setupAxiosInterceptors()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Request Interceptor', () => {
    it('should skip interceptors for /auth/ endpoints', async () => {
      mockStore.getAuthHeader.mockReturnValue({ Authorization: 'Bearer test-token' })
      
      const config = { url: '/auth/login', headers: {} }
      // @ts-expect-error - handlers is not in type definition but exists at runtime
      const handler = mockAxiosInstance.interceptors.request.handlers[0]
      const result = await handler.fulfilled(config)
      
      expect(result.headers.Authorization).toBeUndefined()
      expect(mockStore.getAuthHeader).not.toHaveBeenCalled()
    })

    it('should add Authorization header for protected routes', async () => {
      mockStore.isAuthenticated = true
      mockStore.getAuthHeader.mockReturnValue({ Authorization: 'Bearer test-token' })
      
      const config = { url: '/experiences/1', headers: {} }
      // @ts-expect-error - handlers is not in type definition but exists at runtime
      const handler = mockAxiosInstance.interceptors.request.handlers[0]
      const result = await handler.fulfilled(config)
      
      expect(result.headers.Authorization).toBe('Bearer test-token')
      expect(mockStore.getAuthHeader).toHaveBeenCalled()
    })

    it('should trigger proactive refresh when token expires in < 30s', async () => {
      mockStore.isAuthenticated = true
      mockStore.refreshToken = 'refresh-token'
      mockStore.exp = Math.floor(Date.now() / 1000) + 20 // 20 seconds
      mockStore.tryRefresh.mockResolvedValue(true)
      mockStore.getAuthHeader.mockReturnValue({ Authorization: 'Bearer test-token' })
      
      const config = { url: '/experiences/1', headers: {} }
      // @ts-expect-error - handlers is not in type definition but exists at runtime
      const handler = mockAxiosInstance.interceptors.request.handlers[0]
      await handler.fulfilled(config)
      
      expect(mockStore.tryRefresh).toHaveBeenCalled()
    })

    it('should NOT trigger proactive refresh when token expires in > 30s', async () => {
      mockStore.isAuthenticated = true
      mockStore.refreshToken = 'refresh-token'
      mockStore.exp = Math.floor(Date.now() / 1000) + 40 // 40 seconds
      mockStore.getAuthHeader.mockReturnValue({ Authorization: 'Bearer test-token' })
      
      const config = { url: '/experiences/1', headers: {} }
      // @ts-expect-error - handlers is not in type definition but exists at runtime
      const handler = mockAxiosInstance.interceptors.request.handlers[0]
      await handler.fulfilled(config)
      
      expect(mockStore.tryRefresh).not.toHaveBeenCalled()
    })

    it('should NOT trigger proactive refresh when token is expired', async () => {
      mockStore.isAuthenticated = true
      mockStore.refreshToken = 'refresh-token'
      mockStore.exp = Math.floor(Date.now() / 1000) - 10 // Expired 10s ago
      mockStore.getAuthHeader.mockReturnValue({ Authorization: 'Bearer test-token' })
      
      const config = { url: '/experiences/1', headers: {} }
      // @ts-expect-error - handlers is not in type definition but exists at runtime
      const handler = mockAxiosInstance.interceptors.request.handlers[0]
      await handler.fulfilled(config)
      
      expect(mockStore.tryRefresh).not.toHaveBeenCalled()
    })
  })

  describe('Response Interceptor', () => {
    it('should trigger reactive refresh on 401 error', async () => {
      mockStore.refreshToken = 'refresh-token'
      mockStore.isAuthenticated = true
      mockStore.exp = Math.floor(Date.now() / 1000) + 60 // Token valid for 60s to avoid proactive refresh
      mockStore.tryRefresh.mockResolvedValue(true)
      mockStore.getAuthHeader.mockReturnValue({ Authorization: 'Bearer new-token' })
      
      // Mock axios adapter to intercept the retry request and return success
      // This bypasses interceptors and prevents infinite loops
      let retryRequested = false
      const originalAdapter = mockAxiosInstance.defaults.adapter
      
      mockAxiosInstance.defaults.adapter = async (config) => {
        // If this is the retry request (has the new token header), return success
        if (config.headers?.Authorization === 'Bearer new-token' && !retryRequested) {
          retryRequested = true
          return {
            data: { id: 1 },
            status: 200,
            statusText: 'OK',
            headers: {},
            config
          }
        }
        // For any other request, use original adapter or throw
        throw new Error('Unexpected request')
      }
      
      const error = {
        config: { url: '/experiences/1', headers: {} },
        response: { status: 401 }
      }
      
      // @ts-expect-error - handlers is not in type definition but exists at runtime
      const handler = mockAxiosInstance.interceptors.response.handlers[0]
      const result = await handler.rejected(error)
      
      expect(mockStore.tryRefresh).toHaveBeenCalled()
      expect(result.data).toEqual({ id: 1 })
      
      // Restore adapter
      mockAxiosInstance.defaults.adapter = originalAdapter
    })

    it('should NOT trigger reactive refresh on non-401 errors', async () => {
      const error = {
        config: { url: '/experiences/1' },
        response: { status: 500 }
      }
      
      // @ts-expect-error - handlers is not in type definition but exists at runtime
      const handler = mockAxiosInstance.interceptors.response.handlers[0]
      await expect(handler.rejected(error)).rejects.toEqual(error)
      
      expect(mockStore.tryRefresh).not.toHaveBeenCalled()
    })
  })
})
