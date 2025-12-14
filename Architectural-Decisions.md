## Architectural Decisions & Trade-offs

### Overview
The application follows a layered architecture with clear separation of concerns: **Services → Stores → Composables → Components**. This design prioritizes reusability, testability, and maintainability.

### Scalability & Maintainability Refinements

If I had more time, I would focus on architecture evolution rather than new features:

- **Stronger domain boundaries**: Introduce a domain layer to encapsulate business rules (pagination, auth/session policies) separate from composables/stores
- **Explicit error states**: Model error/loading/empty states more explicitly (state machines or domain models) for predictable UI behavior at scale
- **Integration testing**: Add tests for critical flows (auth refresh, paginated search with cancellation) to validate cross-layer behavior
- **Side effect decoupling**: Extract side effects (scrolling, navigation, persistence) behind adapters for more testable, framework-agnostic core logic

The goal would be making the architecture easier to evolve as requirements grow.

### Key Decisions

#### 1. **Service Layer Extraction (Major Refactor)**
**Initial Approach**: All API calls were directly in Pinia stores using Axios:
```typescript
//  Before: Direct Axios in store
async login(email: string, password: string) {
  const { data } = await axios.post('http://localhost:3001/auth/login', { email, password })
  accessToken = data.access_token
  // ... state updates
}
// Interceptors also defined in store file
axios.interceptors.request.use(async (config) => { ... })
```

**Refactored Approach**: Extracted service layer with HTTP client abstraction:
```typescript
// After: Service layer
async login(email: string, password: string) {
  const data = await authService.login(email, password)
  if (!data) return false
  this.setAccessToken(data.access_token)
  // ... state updates
}
```

**Benefits**:
- **Separation of Concerns**: Stores handle state, services handle API communication
- **Testability**: Services can be mocked independently
- **Reusability**: Services can be used outside Vue context
- **Maintainability**: API changes isolated to service layer
- **Centralized HTTP Logic**: Interceptors moved to dedicated `axios-interceptors.ts`

**Trade-off**: Slightly more files, but much better organization and testability.

#### 2. **Token Storage Strategy**
- **Access Token**: Stored in-memory (`ref` outside Pinia store) to minimize XSS attack surface
- **Refresh Token**: Persisted in `localStorage` for session restoration across page reloads
- **Token Expiry**: Stored in-memory only, never persisted (security best practice)
- **Rationale**: Balances security (access token can't be stolen from storage) with UX (refresh token allows auto-login on reload)

#### 3. **HTTP Client Abstraction Layer**
Created a `HttpClient` wrapper class instead of using Axios directly:
- **Benefits**: 
  - Centralized error handling with normalized `Result<T>` type
  - Easy to swap HTTP libraries if needed
  - Consistent API surface for all services
  - Built-in support for `AbortSignal` for request cancellation
- **Trade-off**: Small abstraction overhead, but improves testability and maintainability

#### 4. **Composables for Reusability**
Extracted complex logic into composables rather than keeping it inline:

**`usePagination<T>`**:
- Encapsulates all pagination state and logic
- Generic type `<T>` makes it reusable for any data type
- Callback-based `onPageChange` allows flexible data fetching strategies
- **Before refactor**: Pagination logic was inline in `Home.vue` (harder to test, not reusable)

**`useDebouncedSearch`**:
- Handles debouncing + request cancellation in one place
- Creates `AbortController` before `setTimeout` to allow cancelling pending requests
- **Before refactor**: Debounce logic mixed with component logic (harder to test, violates SRP)

#### 5. **Utility Functions for Formatting**
Extracted formatting logic (`formatPrice`, `formatDuration`) into pure functions:
- **Benefits**: 
  - Testable in isolation
  - Reusable across components
  - Consistent formatting throughout the app
- **Before refactor**: Inline template expressions like `(price_cents/100).toFixed(0)` (not DRY, hard to test)

#### 6. **Refresh Token Race Condition Prevention**
Implemented refresh lock using a module-level `refreshPromise`:
- Prevents multiple concurrent refresh requests
- Ensures all waiting requests get the same new token
- **Rationale**: Without this, rapid API calls could trigger multiple refresh attempts, causing token inconsistencies

#### 7. **Request Cancellation Strategy**
Implemented proper request cancellation using `AbortController`:
- **Key insight**: Create controller BEFORE `setTimeout` to allow aborting pending debounced requests
- Prevents out-of-order responses from race conditions
- **Implementation**: `AbortSignal` flows from composable → service → http-client → axios

#### 8. **Component Structure**
- **PaginationComponent**: Separate reusable UI component with full accessibility support (ARIA attributes, keyboard navigation)
- **Rationale**: Separation of UI from business logic makes both more maintainable

### Refactoring Journey

**Initial Approach (Quick MVP)**:
- Direct Axios calls in Pinia stores
- Interceptors defined in store files
- Inline pagination logic in components
- Inline formatting in templates
- Debounce logic mixed with component logic

**Refactored Approach**:
- Service layer for all API communication
- HTTP client abstraction for consistency
- Interceptors in dedicated file
- Extracted composables for reusable business logic
- Utility functions for pure transformations
- Separation of concerns at every level

**Time Investment**: ~45 minutes of refactoring after MVP, but significantly improved code quality, testability, and maintainability.

### Trade-offs Made

1. **Admin Delete Feature**: Not implemented (optional requirement). Focused on core features first, then refactoring for quality.

2. **Error Handling**: Used `window.location.href` in interceptors instead of `router.push()` for simplicity. Works but not idiomatic Vue Router.

3. **Testing**: Unit tests for pagination composable, but could have more comprehensive test coverage given more time.

4. **Type Safety**: Some `any` types in Detail.vue (could be `Experience | null`), but acceptable for MVP scope.

### Future Improvements (Given More Time)

1. Complete test coverage for all composables and services
2. Admin delete feature with optimistic UI
3. Error boundary components for better error UX
4. Loading states for better user feedback

