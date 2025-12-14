# Senior Frontend Engineer (Vue) — 4h Take-Home

**Timebox:** Up to 4 hours. Please stop at 4h and note any trade-offs in the README.

## Deliverables
- Working Vue 3 app implementing the features below
- Mock API (provided here) wired to the app
- Pixel-perfect desktop layout (1440×900) — validated with Playwright visual test
- Brief notes on architecture, token storage, and any shortcuts you took

## Scope (Reduced to fit 4h)
1) **Auth & Tokens**
   - Login with email/password calling `POST /auth/login` (mocked)
   - Store `access_token` **in memory**; store `refresh_token` persistently
   - Attach `Authorization: Bearer <access_token>` on protected calls
   - Auto-refresh on 401 or if access token expires within 30s
   - Logout if refresh fails

2) **Experiences Dashboard**
   - Fetch paginated list from `GET /experiences?page=<n>&q=<query>`
   - Search (debounced 300ms) — cancel prior requests
   - Detail view routed at `/experiences/:id`
   - Bookmark items (persist; survive reload)

3) **Admin Action (Optional if time allows)**
   - If `role === "admin"`, show Delete on detail page
   - Optimistic update and rollback on error

4) **Pixel-Perfect UI**
   - Match **design/frames-desktop-1440x900.png** exactly for desktop
   - Run Playwright test: `npm run test:e2e` (compares against golden)

## What we’re Evaluating
- Vue 3 + TS proficiency (Composition API, Pinia, Router)
- Token lifecycle & API management (interceptors, refresh, 401 handling)
- Advanced JS (debounce + cancellation, optimistic UI if attempted)
- HTML/CSS precision (pixel parity, semantics, accessibility basics)
- Clarity of code, structure, and trade-offs

## Run
```bash
# terminal 1 (mock API)
cd mock-api
npm i
npm start  # http://localhost:3001

# terminal 2 (app)
npm i
npm run dev  # http://localhost:5173

# tests
npm run test:unit
npm run test:e2e
```

---

## Where is the task description?
You're reading it: **this README.md** contains the entire 4‑hour assignment scope, acceptance criteria, and run instructions.

## Why doesn’t `index.html` work when I double‑click it?
This project uses **Vite**. You should **not** open `index.html` directly with `file://`.
Start the dev server so modules/loaders work:

```bash
npm i
npm run dev   # http://localhost:5173
```

For a production build and local static preview:
```bash
npm run build
npm run preview
```

## CSV structure (reference)
A sample CSV lives at `mock-api/data/experiences.csv`. The mock API already serves JSON from in-memory data; the CSV is included to document the schema or to help you extend the mock.

**Columns**
- `id` — number (unique)
- `title` — string
- `category` — enum: `food` | `adventure` | `culture`
- `price_cents` — integer (cents)
- `duration_min` — integer (minutes)
- `images` — URL string or comma-separated URLs
- `short_description` — string

**API Contract** (already implemented by the mock server)
```ts
type Experience = {
  id: number;
  title: "string";
  category: "food" | "adventure" | "culture";
  price_cents: number;
  duration_min: number;
  images: string[];
  short_description: string;
};
```
