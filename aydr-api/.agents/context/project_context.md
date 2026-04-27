# Aydr API — Project Context

## What This App Does
`aydr-api` is the backend for the Aydr platform. It serves two distinct interfaces:
1. **REST API (`/api/*`)**: Serves the `aydr-ui` SPA (React). Uses stateless JWT authentication.
2. **Admin Portal (`/*`)**: Server-rendered EJS templates for platform administrators. Uses stateful session cookies.

## Tech Stack
- **Node.js + Express 5** (Backend framework)
- **MongoDB + Mongoose** (Database and ODM)
- **Passport.js** (JWT strategy for API, Local strategy for MVC admin)
- **Joi** (Request payload validation)
- **EJS** (Server-side templating for Admin portal)
- **Multer + ImageKit** (Image upload handling)

## Data Models (Mongoose)
- **`User`**: Base identity for all actors (Customer, Provider, Admin). Stores authentication details and roles.
- **`Provider`**: Service professional profile. Contains `branding`, `location` (GeoJSON), `pricing`, `category`, and `verification` status.
- **`Category`**: Service categories. Can be created by admin or submitted by providers as `PENDING`.
- **`Service`**: Individual services offered by a Provider under a specific Category.
- **`Booking`**: Service appointments between Customer and Provider. Contains `status`, `scheduledAt`, `address`, `priceAtBooking`, `customerImages`, `providerImages`, and `providerNotes`.
- **`Review`**: Customer feedback for completed bookings. Updates Provider's aggregate rating.

## Provider Onboarding & Verification Flow
Providers must be approved by an Admin before they can log in to the UI or accept bookings.
1. Provider registers via `/api/auth/register/provider`. A `User` and `Provider` document are created. `verification.status` is `PENDING`.
2. Admin logs into the EJS portal, navigates to `/providers`, and reviews the provider's details.
3. If approved, Admin triggers the approval route. The backend automatically cascades approval to all `profileSetup` sections (`branding`, `location`, `category`).
4. **Important**: If an approved provider later updates their `location` or `branding` via `/api/providers/:id/settings`, the backend automatically reverts their `verification.status` back to `PENDING` for re-review.
5. If a provider registered with a custom category, that category is created as `PENDING`. Approving the provider does *not* automatically approve the category. Admin must separately approve/rename the category in the `/categories` portal.

## Booking State Machine
Bookings follow a strict unidirectional state machine:

```
REQUESTED → ACCEPTED → IN_PROGRESS → COMPLETED
         ↘ REJECTED
REQUESTED/ACCEPTED → CANCELLED (by customer)
```

| Status | Actor | Required Actions / Fields |
|---|---|---|
| `REQUESTED` | Customer | Initial creation state. |
| `ACCEPTED` | Provider | Acknowledges the job. |
| `REJECTED` | Provider | Declines the job. |
| `IN_PROGRESS` | Provider | Marks job as started. |
| `COMPLETED` | Provider | Completes job. Can attach `providerNotes` and `providerImages` (before/after). |
| `CANCELLED` | Customer | Can only cancel if currently REQUESTED or ACCEPTED. |

Customers can also **Reschedule** a booking if it is in `REQUESTED` or `ACCEPTED` state, modifying `scheduledAt`.

## Key Business Logic Services
- **`booking.service.js`**: Handles booking creation, fetching (`getMyBookings`), status updates (`updateBookingStatus` which accepts notes/images), and rescheduling (`rescheduleBooking`).
- **`provider.service.js`**: Manages provider settings. The `updateProviderSettings` function contains the logic to revert a provider to `PENDING` if sensitive fields change. It also supports text-based area filtering during lookup.
- **`user.service.js`**: Handles registration. Generates `PENDING` custom categories if a provider supplies `customCategory` instead of a known `category` ID.
- **`review.service.js`**: Handles review creation. Uses Mongoose aggregation (`Review.aggregate`) to dynamically recalculate and update the Provider's average rating and review count whenever a new review is submitted.

## Authentication & Authorization Layers
- **API (`/api`)**: Protected by `auth.middleware.js` -> `requireAuth` (verifies JWT signature) and `requireScope(['role1', 'role2'])` (verifies payload `scp` array).
- **Admin Portal (MVC)**: Protected by `auth.middleware.js` -> `requireAdminSession` (verifies `req.isAuthenticated()` via Express-session).

## Image Uploads
- Admin portal uses direct buffer manipulation or ImageKit integrations depending on the context.
- API endpoints for uploading images (e.g. before/after pictures) use `upload.router.js` which integrates `multer.memoryStorage()` to buffer the file and `imagekit.upload()` to send it directly to the CDN, returning the URL to the frontend.
