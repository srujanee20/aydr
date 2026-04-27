# Aydr Frontend Architecture & Coding Standards

This project is a **React + Vite** SPA styled with **SCSS Modules**. When contributing to this codebase, you **must** adhere to the following directory structures, patterns, and conventions.

## 📁 Directory Structure

All source code lives in `src/`.

- **`src/configs/`**: Singleton configuration instances. Currently contains `axiosConfig.js` — the single Axios client used everywhere. Do **not** create raw `axios.create()` calls outside this file.
- **`src/context/`**: React Context providers. Currently `AuthContext.jsx` is the single source of truth for auth state.
- **`src/hooks/`**: Custom React hooks. `useApi.js` is the standard data-fetching hook. All API calls in components must go through this hook.
- **`src/components/common/`**: Shared, reusable components (e.g., `Modal`, `BookingCard`, `ServiceCard`, `LoadingSpinner`, `ProtectedRoute`). These must be generic — they must not contain page-specific logic.
- **`src/components/layouts/`**: Layout shell components (e.g., `Navbar`).
- **`src/components/pages/`**: Page-level components organized by role: `auth/`, `customer/`, `provider/`. Each file maps to one route.
- **`src/styles/`**: All SCSS. See Styling section below.

## 🛣️ Routing Conventions

Routing is defined centrally in `src/App.jsx` using React Router v6.

1. **Role-based protection**: Wrap every non-public route in `<ProtectedRoute role="CUSTOMER|PROVIDER">`. Do not add auth checks inside page components themselves.
2. **Route namespacing**: Customer routes are prefixed `/customer/`, provider routes are prefixed `/provider/`. Public routes live at the root.
3. **No new top-level routes**: Do not add routes outside `App.jsx`. All routing is co-located there.

| Route | Role | Component |
|---|---|---|
| `/` | Public | `Home` |
| `/login`, `/register` | Public | Auth pages |
| `/customer/dashboard` | CUSTOMER | `CustomerDashboard` |
| `/customer/provider/:id` | CUSTOMER | `ProviderDetail` |
| `/customer/profile` | CUSTOMER | `CustomerProfile` |
| `/provider/dashboard` | PROVIDER | `ProviderDashboard` |
| `/provider/bookings` | PROVIDER | `ProviderBookings` |
| `/provider/settings` | PROVIDER | `ProviderSettings` |

## 🔐 Authentication

- Auth state is managed exclusively by `AuthContext`. Never read from `localStorage` directly in a component — use the `useAuth()` hook.
- The `AuthContext` exposes: `user`, `token`, `loading`, `login`, `logout`, `refreshUser`, `isAuthenticated`, `isCustomer`, `isProvider`.
- JWTs are stored in `localStorage` and attached to every request automatically by the Axios interceptor in `axiosConfig.js`.
- A global 401 interceptor in `axiosConfig.js` auto-logouts the user and redirects to `/login` on expired tokens. Do not duplicate this logic in components.
- After a profile update, call `refreshUser()` from `useAuth()` to sync the user state from the server without a full logout/login.

## 📡 API Calls

**Always use the `useApi` hook. Never call `apiClient` directly inside a component.**

```jsx
// ✅ Correct
const [data, error, loading, call] = useApi();
const fetchSomething = async () => {
    const res = await call('GET', '/some-resource');
};

// ❌ Wrong — bypasses loading state, error handling, and the hook pattern
import apiClient from '../configs/axiosConfig';
const res = await apiClient.get('/some-resource');
```

- `useApi` returns `[data, error, loading, call, reset]`.
- If a component needs to make **multiple independent API calls** (e.g., fetching providers AND bookings simultaneously), instantiate `useApi` twice to get separate `loading` states for each.
- `call` throws on failure so errors can be caught in a `try/catch`. The error is also stored in `error` state.

## 🎨 Styling

This project uses **SCSS** with a strict structure. Do not use inline styles or plain CSS files.

### Design Tokens
All design tokens (colors, spacing, shadows, typography, transitions) are defined in `src/styles/_variables.scss`. **Always use these tokens — never hardcode raw hex colors or pixel values.**

Key tokens:
- Colors: `$color-primary`, `$color-accent`, `$color-danger`, `$color-success`, `$color-warning`
- Text: `$color-text-main`, `$color-text-muted`
- Backgrounds: `$color-background-dark`, `$color-background-light`, `$color-surface`
- Radii: `$border-radius`, `$border-radius-lg`, `$border-radius-full`
- Shadows: `$shadow-sm`, `$shadow-md`, `$shadow-lg`
- Transitions: `$transition-fast`, `$transition-base`, `$transition-slow`
- Status: `$status-incomplete`, `$status-pending`, `$status-approved`, `$status-rejected`

### Mixins
Reusable patterns are in `src/styles/_mixins.scss`. Use them instead of re-declaring patterns.

| Mixin | Purpose |
|---|---|
| `flex-center` | `display:flex; align-items:center; justify-content:center` |
| `flex-between` | `justify-content:space-between` |
| `page-container` | Centred, max-width, padded container |
| `card($padding)` | White rounded card with shadow |
| `card-hover` | Lift-on-hover effect |
| `btn-primary` / `btn-outline` / `btn-ghost` / `btn-danger` | Standardized button variants |
| `input-base` | Standardized form input |
| `badge($bg, $text)` | Pill badge |
| `status-badge($status)` | Status-colored badge (incomplete/pending/approved/rejected) |
| `avatar($size)` | Circular avatar image |
| `truncate($lines)` | Single or multi-line text truncation |
| `custom-scrollbar` | Thin, styled scrollbar |

### SCSS File Organization
- **Component styles**: `src/styles/common/_<component-name>.scss`
- **Layout styles**: `src/styles/layouts/_<layout-name>.scss`
- **Page styles**: `src/styles/pages/<role>/_<page-name>.scss`
- **Register new SCSS files in `main.scss`** using `@use`. Never `@import`.

### BEM Naming
Use BEM (Block__Element--Modifier) for all CSS class names.
```scss
// ✅ Correct
.booking-card { }
.booking-card__header { }
.booking-card__btn--accept { }

// ❌ Wrong
.bookingCard { }
.header { }
```

## 🧩 Component Conventions

1. **One component per file.** File name must match the component name (PascalCase).
2. **`common/` components are generic.** They must accept data via props and must not contain hardcoded role-specific logic. Use a `role` prop to differentiate behavior (see `BookingCard`).
3. **`onRefresh` pattern**: When a child component (e.g., `BookingCard`) performs an action that mutates server data, the parent must pass an `onRefresh` callback. The child calls it after a successful mutation to trigger a re-fetch.
4. **Modals live where they're used.** If a modal's state is only needed inside one component, define it there. The shared `<Modal>` wrapper handles all portal/overlay logic.

## 🗺️ Map Integration

This project uses **React Leaflet** (`react-leaflet`) for all map functionality.

- Map tile provider: OpenStreetMap (`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`)
- Coordinates are stored in **GeoJSON order** in the database: `[longitude, latitude]`.
- When rendering on a Leaflet map, the order must be **reversed** to `[latitude, longitude]`:
  ```jsx
  // DB stores: [lng, lat]
  // Leaflet needs: [lat, lng]
  position={[provider.location.coordinates[1], provider.location.coordinates[0]]}
  ```
- Use `useMapEvents` for click-based location picking during registration.
