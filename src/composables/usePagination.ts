import { ref, computed, type Ref } from 'vue'

/**
 * Pagination metadata returned from the API
 */
export type PaginationData = {
  page: number
  pageSize: number
  total: number
}

/**
 * Standard paginated API response structure
 * @template T - The type of items in the paginated response
 */
export type PaginatedResponse<T> = {
  data: T[]
  page: number
  pageSize: number
  total: number
}

/**
 * Options for configuring the pagination composable
 */
type UsePaginationOptions = {
  /** Initial page number (default: 1) */
  initialPage?: number
  /** Callback function to execute when the page changes */
  onPageChange?: () => void
}

/**
 * Composable for managing pagination state and logic.
 * 
 * Provides reactive state for pagination data, computed properties for pagination info,
 * and methods to navigate between pages.
 * 
 * @template T - The type of items being paginated
 * @param options - Configuration options for pagination
 * @returns Pagination state, computed properties, and navigation methods
 * 
 * @example
 *
 * const {
 *   items,
 *   currentPage,
 *   totalPages,
 *   goToPage,
 *   setPaginationData
 * } = usePagination<Experience>({
 *   initialPage: 1,
 *   onPageChange: () => fetchData()
 * })
 *  */
export function usePagination<T>(options: UsePaginationOptions = {}) {
  const currentPage = ref(options.initialPage ?? 1)
  const pagination = ref<PaginationData | null>(null)
  const items = ref<T[]>([]) as Ref<T[]>

  /**
   * Total number of pages based on total items and page size
   */
  const totalPages = computed(() => {
    if (!pagination.value) return 1
    return Math.ceil(pagination.value.total / pagination.value.pageSize)
  })

  /**
   * Whether there is a next page available
   */
  const hasNextPage = computed(() => {
    return currentPage.value < totalPages.value
  })

  /**
   * Whether there is a previous page available
   */
  const hasPreviousPage = computed(() => {
    return currentPage.value > 1
  })

  /**
   * Updates pagination state with data from API response
   * @param response - Paginated response from the API
   */
  function setPaginationData(response: PaginatedResponse<T>) {
    items.value = response.data
    pagination.value = {
      page: response.page,
      pageSize: response.pageSize,
      total: response.total
    }
  }

  /**
   * Resets pagination to the first page
   */
  function resetPage() {
    currentPage.value = 1
  }

  /**
   * Navigates to a specific page number.
   * Only navigates if the page is within valid bounds (1 to totalPages).
   * Automatically scrolls to top and triggers onPageChange callback.
   * 
   * @param page - Target page number (1-indexed)
   */
  function goToPage(page: number) {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
      options.onPageChange?.()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  /**
   * Navigates to the next page if available
   */
  function goToNextPage() {
    if (hasNextPage.value) {
      goToPage(currentPage.value + 1)
    }
  }

  /**
   * Navigates to the previous page if available
   */
  function goToPreviousPage() {
    if (hasPreviousPage.value) {
      goToPage(currentPage.value - 1)
    }
  }

  return {
    // State
    currentPage,
    pagination,
    items,
    
    // Computed
    totalPages,
    hasNextPage,
    hasPreviousPage,
    
    // Methods
    setPaginationData,
    resetPage,
    goToPage,
    goToNextPage,
    goToPreviousPage
  }
}
