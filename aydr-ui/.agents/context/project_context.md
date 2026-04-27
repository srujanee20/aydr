# Aydr UI — Project Context

## What This App Does
`aydr-ui` is the customer and service provider facing SPA for the Aydr platform — a local service marketplace (plumbing, electrical work, etc.). It communicates exclusively with `aydr-api` via REST JSON.

## Tech Stack
- **React 19** (functional components, hooks only — no class components)
- **Vite** (dev server and build tool)
- **React Router v6** (client-side routing)
- **Axios** (HTTP client, configured in `src/configs/axiosConfig.js`)
- **React Leaflet** (OpenStreetMap integration)
- **SCSS** (styling, no Tailwind, no CSS Modules — global SCSS with BEM)

## Users & Roles
There are two platform user roles. The admin is a separate server-rendered portal in `aydr-api`.

| Role | Entry Point | JWT scope |
|---|---|---|
| `CUSTOMER` | `/customer/dashboard` | `customer` |
| `PROVIDER` | `/provider/dashboard` | `provider` |

## Authentication Flow
1. User logs in via `POST /api/auth/login`. API returns `{ token, user }`.
2. Token is stored in `localStorage`. User object is stored in `AuthContext` state.
3. `axiosConfig.js` attaches the token as `Authorization: Bearer <token>` on every request.
4. On app load, `AuthContext` rehydrates state by decoding the stored JWT and calling `GET /api/users/me`.
5. On 401 responses (outside `/auth/` routes), the Axios interceptor auto-clears `localStorage` and redirects to `/login`.

## Provider Verification & Profile Setup
Providers go through an approval workflow after registration. Their `verification.status` can be `PENDING`, `APPROVED`, or `REJECTED`.

- Providers **cannot log in** until `verification.status === 'APPROVED'`.
- `profileSetup` tracks the state of each section: `branding`, `location`, `pricing`, `category`.
- Each section has a `status` field: `INCOMPLETE`, `PENDING`, `APPROVED`, `REJECTED`.
- When a provider updates their location or branding, their `verification.status` is automatically reset to `PENDING` by the backend.
- Admin approves providers from the server-rendered admin portal (`aydr-api`).

## Booking State Machine
Bookings follow a strict unidirectional state machine:

```
REQUESTED → ACCEPTED → IN_PROGRESS → COMPLETED
         ↘ REJECTED
REQUESTED/ACCEPTED → CANCELLED (by customer)
```

| Status | Who can change it |
|---|---|
| `REQUESTED` | Initial state on creation |
| `ACCEPTED` / `REJECTED` | Provider |
| `IN_PROGRESS` | Provider |
| `COMPLETED` | Provider (via "Mark Complete" modal with notes + images) |
| `CANCELLED` | Customer |

## Key API Endpoints Used by UI

| Method | Endpoint | Who calls it |
|---|---|---|
| `POST` | `/api/auth/login` | Login page |
| `POST` | `/api/auth/register/customer` | Register page |
| `POST` | `/api/auth/register/provider` | Register page |
| `GET` | `/api/users/me` | AuthContext on load |
| `GET` | `/api/providers` | CustomerDashboard (supports `?area=` text filter) |
| `GET` | `/api/providers/:id` | ProviderDetail |
| `GET` | `/api/categories` | CustomerDashboard (filter chips), Register |
| `GET` | `/api/services/provider/:id` | ProviderDetail |
| `POST` | `/api/bookings` | ProviderDetail booking modal |
| `GET` | `/api/bookings/my` | CustomerDashboard, ProviderBookings |
| `PATCH` | `/api/bookings/:id/status` | BookingCard (provider actions + customer cancel) |
| `PATCH` | `/api/bookings/:id/reschedule` | BookingCard (customer) |
| `POST` | `/api/reviews` | BookingCard (customer, after COMPLETED) |
| `PATCH` | `/api/providers/:id/settings` | ProviderSettings |

## Page Components

### Customer
- **`CustomerDashboard`**: Map + provider list + category filter pills + area search bar + "My Bookings" tab.
- **`ProviderDetail`**: Provider profile, service list, and booking creation modal (date, address, notes, optional image URL).
- **`CustomerProfile`**: Customer profile editing.

### Provider
- **`ProviderDashboard`**: Overview stats and profile setup progress indicators.
- **`ProviderBookings`**: Full booking list with status filter tabs. Provider can Accept/Reject/Start/Complete each booking.
- **`ProviderSettings`**: Profile editing (name, bio, logo, availability toggle, location, pricing, services CRUD).

## Shared Components

### `BookingCard`
The most complex shared component. Renders differently based on `role` prop (`"CUSTOMER"` or `"PROVIDER"`).

**Props:**
- `booking` — the booking object (must have `serviceId`, `providerId`, `customerId` populated)
- `role` — `"CUSTOMER"` or `"PROVIDER"`
- `onUpdateStatus(bookingId, status)` — called for simple status changes (Accept, Reject, Cancel, Start Work)
- `onRefresh()` — called after modal-based actions (Reschedule, Complete, Review) to re-fetch the booking list

**Modals rendered internally:**
- **Reschedule** (Customer, REQUESTED/ACCEPTED): Sends `PATCH /bookings/:id/reschedule`
- **Complete Job** (Provider, IN_PROGRESS): Sends `PATCH /bookings/:id/status` with `status`, `providerNotes`, and `providerImages`
- **Submit Review** (Customer, COMPLETED): Sends `POST /reviews`

### `Modal`
Generic modal wrapper. Props: `isOpen`, `onClose`, `title`, `children`.

### `ServiceCard`
Displays a single service. Props: `service`, `showBookBtn`, `onBook`.

### `ProtectedRoute`
Wrapper for role-based route guarding. Props: `role` (`"CUSTOMER"` or `"PROVIDER"`).

## Custom Category Registration
During provider registration, the category `<select>` includes a `"+ Type my own category"` option (value `"custom"`). If selected, a text input appears for `customCategory`. The form payload sends:
- `category: null` (when custom is selected)
- `customCategory: "My Category Name"`

The backend creates the category as `PENDING` and activates it when admin approves the provider.
