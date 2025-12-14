import { ref, type Ref } from 'vue'

/**
 * Composable for debounced search with request cancellation
 * @param callback Function to call after debounce period
 * @param delayMs Debounce delay in milliseconds (default: 300)
 */
export function useDebouncedSearch<T>(
  callback: (signal: AbortSignal) => Promise<T>,
  delayMs: number = 300
) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined
  let abortController: AbortController | null = null

  const trigger = () => {
    // Clear previous timeout
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    // Cancel previous request if it exists
    if (abortController) {
      abortController.abort()
    }

    // Create new AbortController BEFORE setTimeout so we can abort pending requests
    abortController = new AbortController()

    timeoutId = setTimeout(() => {
      // Check if controller was aborted while waiting
      if (abortController && !abortController.signal.aborted) {
        callback(abortController.signal)
      }
    }, delayMs)
  }

  const cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = undefined
    }
    if (abortController) {
      abortController.abort()
      abortController = null
    }
  }

  return { trigger, cancel }
}