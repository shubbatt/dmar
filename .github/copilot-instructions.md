# D'Mar Travels - AI Coding Instructions

## Project Overview
Next.js 14 tour agency website for D'Mar Travels (Maldives diving & excursions) with multilingual support, booking system, and email notifications. Built with shadcn/ui, Tailwind CSS 4, React 19, and TypeScript.

## Key Architecture Patterns

### Multi-Language System
- **Translation keys centralized**: `lib/translations.ts` contains all text in `en`, `es`, `de`
- **Context-based i18n**: `lib/language-context.tsx` provides `useLanguage()` hook with `t()` function
- **Client-side persistence**: Language choice saved to localStorage as `dmar-language`
- **Usage pattern**: `const { t, language, setLanguage } = useLanguage()` then `t('keyName')`
- All user-facing text MUST use `t()` - hardcoded strings are tech debt

### Component Structure
- **UI components**: All in `components/ui/` from shadcn/ui (accordion, button, card, etc.)
- **Layout wrapper**: `app/layout.tsx` wraps children with `LanguageProvider` and Inter font
- **Route pages**: Each page is client component (`"use client"`) that uses `useLanguage()` hook
- **Booking flow**: Two-step wizard (selection → guest details) in `app/booking/page.tsx`

### Booking System Architecture
```
User fills form (app/booking/page.tsx)
  ↓
POST to /api/send-booking-confirmation/route.tsx
  ↓
Sends 2 emails via Resend:
  1. Customer confirmation
  2. Admin notification to dmar.oceana@gmail.com
  ↓
Stores booking to localStorage (demo mode)
```

**Important**: SQL scripts in `scripts/` folder suggest Supabase/Postgres backend was planned but NOT implemented. Current system uses:
- Client-side localStorage for demo bookings
- Email-only notifications (no database writes)
- `lib/api-client.ts` defines future API structure but endpoints don't exist yet

### Styling Conventions
- **Glassmorphism theme**: `bg-white/60 backdrop-blur-sm border-white/20` for cards
- **Gradient backgrounds**: `from-cyan-50 via-blue-50 to-teal-50` for sections
- **Brand colors**: Primary cyan-600, secondary blue-600, accent pink-600 (ALUNA retreats)
- **Mobile-first responsive**: `md:` and `lg:` breakpoints, mobile nav uses Sheet component
- **Icons from lucide-react**: Waves, Fish, Anchor, Heart, Users, Calendar, etc.

## Critical Developer Workflows

### Running the Development Server
```bash
pnpm dev        # Runs on http://localhost:3000
pnpm build      # Production build
pnpm start      # Production server
```

### Adding New Translation Keys
1. Add key to all 3 language objects in `lib/translations.ts`
2. Export type: `export type TranslationKey = keyof typeof translations.en`
3. Use in components: `t('newKey')`

### Creating New Booking Packages
Edit `groupTravelPackages` array in `app/booking/page.tsx`. Each package needs:
- `id`, `name`, `dates`, `startDate/endDate`, `duration`
- `accommodation` object with name, type, features
- `activities` array of included experiences
- `price`, `image`, `available`, `spotsLeft`
- Optional `isWomenOnly` flag for ALUNA retreats

### Email Configuration
- Uses Resend API (key: `process.env.resend` or `process.env.RESEND_API_KEY`)
- Without key: falls back to simulation mode (logs only)
- Templates: `generateEmailTemplate()` for customer, `generateAdminEmailTemplate()` for admin
- From address: `"D'Mar Travels <onboarding@resend.dev>"`

## Data Flow Patterns

### Custom Booking Flow (4-step wizard)
1. **Select dates**: Calendar range picker → stores in `customDates` state
2. **Choose accommodation**: Grid of hotels/resorts → stores in `selectedAccommodation`
3. **Add activities**: Optional multi-select → stores in `selectedActivities` array
4. **Add services**: Optional extras → stores in `selectedServices` array
5. Final step: Guest details form → calculates total with `calculateCustomTotal()`

### State Management
- Local component state (useState) for all interactions
- No global state management (Redux/Zustand)
- Form state in `app/booking/page.tsx` includes:
  - `bookingType: "package" | "custom"`
  - `selectedPackage`, `customDates`, `selectedAccommodation`, etc.
  - `customerInfo` object with name, email, phone, whatsapp, specialRequests
  - `currentStep` for multi-step wizard navigation

## Project-Specific Quirks

### TypeScript Configuration
- **Build errors ignored**: `typescript.ignoreBuildErrors: true` in `next.config.mjs`
- **ESLint ignored**: `eslint.ignoreDuringBuilds: true`
- **Images unoptimized**: `images.unoptimized: true`
- This is intentional for rapid v0.app iteration - tighten for production

### Path Aliases
- `@/*` maps to project root (configured in `tsconfig.json`)
- Use `@/components/ui/button` not `../../components/ui/button`

### Asset Handling
- Logo: `/dmar-logo-final.png` (used in nav and footer)
- Images: Mix of `/image1.png`, `/maafushi-adventure-hub...jpg`, etc.
- Video hero: Vercel blob storage URL for homepage background

### Database Schema (Planned but Not Implemented)
SQL scripts exist but aren't connected:
- `bookings` table with RLS policies
- `admin_users` for authentication
- `group_schedules` for managing trip dates
- Supabase auth integration prepared but inactive

## When Adding Features

### New Service/Page
1. Create page in `app/[route]/page.tsx` as client component
2. Import `useLanguage()` hook and use `t()` for all text
3. Add translation keys to `lib/translations.ts` for all 3 languages
4. Follow glassmorphism styling with cyan/blue gradients
5. Add navigation link to header in `app/page.tsx`

### New UI Component
- Use shadcn/ui if available: `npx shadcn-ui@latest add [component]`
- Place in `components/ui/` folder
- Use existing design tokens (cyan-600, backdrop-blur-sm, etc.)

### API Route
- Create in `app/api/[route]/route.tsx`
- Export `POST`, `GET`, `PUT`, `DELETE` as needed
- Return `NextResponse.json()` with proper error handling
- Log extensively with `[v0]` prefix for debugging

## Laravel Backend Development Plan

### Architecture Overview
Building a PHP Laravel backend to manage the entire D'Mar Travels website with:
- **Content Management**: Home page, services, hotels, resorts, about sections
- **E-commerce System**: Shopping cart for group travel packages and custom packages
- **Booking Management**: Full booking workflow with payment integration
- **Admin Dashboard**: Manage content, bookings, packages, and orders

### Planned Laravel Backend Structure
```
laravel-backend/
├── app/
│   ├── Http/Controllers/
│   │   ├── API/
│   │   │   ├── ContentController.php (home, about, services)
│   │   │   ├── HotelController.php
│   │   │   ├── ResortController.php
│   │   │   ├── PackageController.php (group travel packages)
│   │   │   ├── CustomPackageController.php
│   │   │   ├── CartController.php
│   │   │   ├── OrderController.php
│   │   │   └── BookingController.php
│   │   └── Admin/
│   │       ├── DashboardController.php
│   │       ├── PackageManagementController.php
│   │       └── OrderManagementController.php
│   ├── Models/
│   │   ├── Content.php
│   │   ├── Hotel.php
│   │   ├── Resort.php
│   │   ├── Package.php
│   │   ├── CustomPackage.php
│   │   ├── Cart.php
│   │   ├── CartItem.php
│   │   ├── Order.php
│   │   ├── OrderItem.php
│   │   └── Booking.php
│   └── Services/
│       ├── CartService.php
│       ├── OrderService.php
│       └── PaymentService.php
├── database/migrations/
├── routes/
│   ├── api.php (Next.js frontend APIs)
│   └── web.php (Admin dashboard routes)
└── config/
```

### Database Schema Design

**packages** table:
- id, name, description, dates, start_date, end_date, duration
- accommodation_id (FK), price, spots_total, spots_available
- is_women_only, is_active, image_url, created_at, updated_at

**custom_packages** table:
- id, user_id, accommodation_id, check_in, check_out
- guests, total_price, status, created_at, updated_at

**custom_package_activities** pivot table:
- custom_package_id, activity_id, quantity, price_snapshot

**custom_package_services** pivot table:
- custom_package_id, service_id, quantity, price_snapshot

**carts** table:
- id, session_id, user_id (nullable), created_at, updated_at

**cart_items** table:
- id, cart_id, item_type (package/custom_package), item_id
- quantity, price_snapshot, guest_count, created_at, updated_at

**orders** table:
- id, order_number, customer_name, customer_email, customer_phone
- customer_whatsapp, total_amount, payment_status, payment_method
- status (pending/confirmed/cancelled), created_at, updated_at

**order_items** table:
- id, order_id, item_type, item_id, quantity, unit_price
- guest_count, subtotal, created_at, updated_at

**hotels** & **resorts** tables:
- id, name, type, category, description, features (JSON)
- price_per_night, location, image_url, is_active, created_at, updated_at

**activities** & **services** tables:
- id, name, description, duration, price, price_per_day
- icon, is_active, created_at, updated_at

### API Endpoints for Next.js Frontend

**Content APIs:**
```
GET /api/content/home
GET /api/content/about
GET /api/content/services
GET /api/hotels
GET /api/hotels/{id}
GET /api/resorts
GET /api/resorts/{id}
```

**Package APIs:**
```
GET /api/packages (list all group travel packages)
GET /api/packages/{id}
GET /api/activities
GET /api/services
POST /api/custom-packages (create custom package quote)
```

**Cart APIs:**
```
GET /api/cart
POST /api/cart/add (add package or custom package)
PUT /api/cart/items/{id}
DELETE /api/cart/items/{id}
POST /api/cart/clear
```

**Order/Booking APIs:**
```
POST /api/orders (create order from cart)
GET /api/orders/{orderNumber}
POST /api/bookings (legacy endpoint, redirect to orders)
```

**Admin APIs:**
```
GET /api/admin/dashboard
GET /api/admin/orders
PUT /api/admin/orders/{id}/status
GET /api/admin/packages
POST /api/admin/packages
PUT /api/admin/packages/{id}
DELETE /api/admin/packages/{id}
```

### Integration with Current Next.js Frontend

**Phase 1: Replace localStorage with Laravel APIs**
1. Update `lib/booking-service.ts` to call Laravel API instead of localStorage
2. Create `lib/cart-service.ts` for cart operations
3. Update `app/booking/page.tsx` to use new cart system

**Phase 2: Dynamic Content from Laravel**
1. Fetch `groupTravelPackages` from `/api/packages`
2. Fetch `accommodations` from `/api/hotels` and `/api/resorts`
3. Fetch `activities` and `services` from respective endpoints

**Phase 3: Cart & Checkout Flow**
1. Add cart icon to navigation
2. Create `app/cart/page.tsx` for cart view
3. Create `app/checkout/page.tsx` for order completion
4. Update booking confirmation flow

**Phase 4: Admin Dashboard**
1. Build Laravel Blade admin panel or use Laravel Nova
2. Manage packages, accommodations, orders, content

### Environment Variables Needed
```env
# Laravel Backend
LARAVEL_API_URL=http://localhost:8000/api
LARAVEL_API_KEY=your-api-key

# Payment Integration (future)
STRIPE_PUBLIC_KEY=
STRIPE_SECRET_KEY=

# Existing
RESEND_API_KEY=your-resend-key
```

### Migration Strategy
1. Keep current Next.js frontend functional during migration
2. Build Laravel backend with all APIs
3. Gradually replace frontend data sources (localStorage → Laravel API)
4. Add cart functionality on top of existing booking flow
5. Deploy Laravel backend separately (could use Laravel Forge or DigitalOcean)

### Technology Stack
- **Backend**: PHP 8.2+, Laravel 11
- **Database**: MySQL 8 or PostgreSQL
- **Authentication**: Laravel Sanctum (for admin) + session-based for cart
- **File Storage**: Laravel Storage (S3 for production)
- **Email**: Laravel Mail (can integrate with Resend)
- **Cache**: Redis (for cart sessions and performance)
- **Queue**: Laravel Queues (for order processing, emails)

## Important Context

- **Target audience**: International travelers (German, Spanish, English speakers)
- **Brand voice**: Soul-focused, transformational, ocean-centered (see `brandDescription` keys)
- **Business owner**: Daniela Mora, PADI instructor based in Ukulhas, Maldives
- **Deployed on**: Vercel (Next.js), Laravel backend separate deployment
- **Contact**: dmar.oceana@gmail.com, +49 1512 6720043, Instagram @d.marmaid
