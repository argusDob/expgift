import { describe, it, expect, beforeEach, vi } from 'vitest'
import { usePagination, type PaginatedResponse } from '../usePagination'

Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: vi.fn(),
})

type TestItem = {
  id: number
  name: string
}

describe('usePagination', () => {
  const mockPaginatedResponse: PaginatedResponse<TestItem> = {
    data: [
      { id: 1, name: 'Item 1' },
      { id: 2, name: 'Item 2' },
    ],
    page: 1,
    pageSize: 6,
    total: 12,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Initial state', () => {
    it('should initialize with default values', () => {
      const { currentPage, items, pagination, totalPages } = usePagination<TestItem>()

      expect(currentPage.value).toBe(1)
      expect(items.value).toEqual([])
      expect(pagination.value).toBeNull()
      expect(totalPages.value).toBe(1)
    })

    it('should initialize with custom initialPage', () => {
      const { currentPage } = usePagination<TestItem>({ initialPage: 3 })

      expect(currentPage.value).toBe(3)
    })
  })

  describe('setPaginationData', () => {
    it('should set items and pagination data', () => {
      const { items, pagination, setPaginationData } = usePagination<TestItem>()

      setPaginationData(mockPaginatedResponse)

      expect(items.value).toEqual(mockPaginatedResponse.data)
      expect(pagination.value).toEqual({
        page: mockPaginatedResponse.page,
        pageSize: mockPaginatedResponse.pageSize,
        total: mockPaginatedResponse.total,
      })
    })

    it('should update items and pagination when called multiple times', () => {
      const { items, pagination, setPaginationData } = usePagination<TestItem>()

      setPaginationData(mockPaginatedResponse)
      
      const secondResponse: PaginatedResponse<TestItem> = {
        data: [{ id: 3, name: 'Item 3' }],
        page: 2,
        pageSize: 6,
        total: 12,
      }
      setPaginationData(secondResponse)

      expect(items.value).toEqual(secondResponse.data)
      expect(pagination.value?.page).toBe(2)
    })
  })

  describe('totalPages computed', () => {
    it('should return 1 when pagination is null', () => {
      const { totalPages } = usePagination<TestItem>()
      expect(totalPages.value).toBe(1)
    })

    it('should calculate total pages correctly', () => {
      const { totalPages, setPaginationData } = usePagination<TestItem>()

      setPaginationData({
        data: [],
        page: 1,
        pageSize: 6,
        total: 12,
      })

      expect(totalPages.value).toBe(2) // Math.ceil(12/6)
    })

    it('should round up when total is not divisible by pageSize', () => {
      const { totalPages, setPaginationData } = usePagination<TestItem>()

      setPaginationData({
        data: [],
        page: 1,
        pageSize: 6,
        total: 13,
      })

      expect(totalPages.value).toBe(3) // Math.ceil(13/6)
    })
  })

  describe('hasNextPage computed', () => {
    it('should return false when on last page', () => {
      const { hasNextPage, setPaginationData, currentPage } = usePagination<TestItem>()

      setPaginationData({
        data: [],
        page: 2,
        pageSize: 6,
        total: 12,
      })
      currentPage.value = 2

      expect(hasNextPage.value).toBe(false)
    })

    it('should return true when not on last page', () => {
      const { hasNextPage, setPaginationData, currentPage } = usePagination<TestItem>()

      setPaginationData({
        data: [],
        page: 1,
        pageSize: 6,
        total: 12,
      })
      currentPage.value = 1

      expect(hasNextPage.value).toBe(true)
    })

    it('should return false when pagination is null', () => {
      const { hasNextPage } = usePagination<TestItem>()
      expect(hasNextPage.value).toBe(false)
    })
  })

  describe('hasPreviousPage computed', () => {
    it('should return false when on first page', () => {
      const { hasPreviousPage, currentPage } = usePagination<TestItem>()
      currentPage.value = 1

      expect(hasPreviousPage.value).toBe(false)
    })

    it('should return true when not on first page', () => {
      const { hasPreviousPage, currentPage } = usePagination<TestItem>()
      currentPage.value = 2

      expect(hasPreviousPage.value).toBe(true)
    })
  })

  describe('goToPage', () => {
    it('should change current page to valid page', () => {
      const { goToPage, currentPage, setPaginationData } = usePagination<TestItem>()

      setPaginationData({
        data: [],
        page: 1,
        pageSize: 6,
        total: 12,
      })

      goToPage(2)

      expect(currentPage.value).toBe(2)
      expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
    })

    it('should not change page when page is less than 1', () => {
      const { goToPage, currentPage } = usePagination<TestItem>()
      currentPage.value = 2

      goToPage(0)

      expect(currentPage.value).toBe(2)
    })

    it('should not change page when page exceeds totalPages', () => {
      const { goToPage, currentPage, setPaginationData } = usePagination<TestItem>()

      setPaginationData({
        data: [],
        page: 1,
        pageSize: 6,
        total: 12,
      })
      currentPage.value = 1

      goToPage(100)

      expect(currentPage.value).toBe(1)
    })

    it('should call onPageChange callback when provided', () => {
      const onPageChange = vi.fn()
      const { goToPage, setPaginationData } = usePagination<TestItem>({ onPageChange })

      setPaginationData({
        data: [],
        page: 1,
        pageSize: 6,
        total: 12,
      })

      goToPage(2)

      expect(onPageChange).toHaveBeenCalledTimes(1)
    })

    it('should not call onPageChange when page change is invalid', () => {
      const onPageChange = vi.fn()
      const { goToPage } = usePagination<TestItem>({ onPageChange })

      goToPage(0) // Invalid page

      expect(onPageChange).not.toHaveBeenCalled()
    })
  })

  describe('goToNextPage', () => {
    it('should go to next page when available', () => {
      const { goToNextPage, currentPage, setPaginationData } = usePagination<TestItem>()

      setPaginationData({
        data: [],
        page: 1,
        pageSize: 6,
        total: 12,
      })
      currentPage.value = 1

      goToNextPage()

      expect(currentPage.value).toBe(2)
    })

    it('should not change page when on last page', () => {
      const { goToNextPage, currentPage, setPaginationData } = usePagination<TestItem>()

      setPaginationData({
        data: [],
        page: 2,
        pageSize: 6,
        total: 12,
      })
      currentPage.value = 2

      goToNextPage()

      expect(currentPage.value).toBe(2)
    })
  })

  describe('goToPreviousPage', () => {
    it('should go to previous page when available', () => {
      const { goToPreviousPage, currentPage } = usePagination<TestItem>()
      currentPage.value = 2

      goToPreviousPage()

      expect(currentPage.value).toBe(1)
    })

    it('should not change page when on first page', () => {
      const { goToPreviousPage, currentPage } = usePagination<TestItem>()
      currentPage.value = 1

      goToPreviousPage()

      expect(currentPage.value).toBe(1)
    })
  })

  describe('resetPage', () => {
    it('should reset current page to 1', () => {
      const { resetPage, currentPage } = usePagination<TestItem>()
      currentPage.value = 5

      resetPage()

      expect(currentPage.value).toBe(1)
    })

    it('should reset to 1 even when already on page 1', () => {
      const { resetPage, currentPage } = usePagination<TestItem>()
      currentPage.value = 1

      resetPage()

      expect(currentPage.value).toBe(1)
    })
  })

  describe('Integration scenarios', () => {
    it('should handle full pagination flow', () => {
      const { 
        setPaginationData, 
        currentPage, 
        totalPages, 
        goToNextPage, 
        goToPreviousPage,
        resetPage 
      } = usePagination<TestItem>()

      // Set initial data
      setPaginationData({
        data: [{ id: 1, name: 'Item 1' }],
        page: 1,
        pageSize: 6,
        total: 18,
      })

      expect(currentPage.value).toBe(1)
      expect(totalPages.value).toBe(3)

      // Navigate forward
      goToNextPage()
      expect(currentPage.value).toBe(2)

      goToNextPage()
      expect(currentPage.value).toBe(3)

      // Try to go beyond last page
      goToNextPage()
      expect(currentPage.value).toBe(3) // Should not change

      // Navigate backward
      goToPreviousPage()
      expect(currentPage.value).toBe(2)

      // Reset
      resetPage()
      expect(currentPage.value).toBe(1)
    })
  })
})