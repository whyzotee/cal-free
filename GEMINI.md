# Project Context: Zero-Cost AI Calorie Tracker (PWA)

## Core Vision

A premium-feel, high-performance Calorie Tracker PWA built with zero-cost infrastructure.

## Tech Stack

- **Runtime:** Bun
- **Frontend:** React (Vite) + Tailwind CSS v4
- **State Management:** Zustand (Simplified global state)
- **Routing:** TanStack Router (File-Based Routing)
- **Database & Auth:** Supabase (PostgreSQL with RLS)
- **AI Engine:** Google Gemini 3.1 Flash-Lite (via Supabase Edge Functions)
- **Deployment:** Vercel (Frontend) + Supabase (Backend/AI)

---

## Architectural Decisions

### 1. AI Integration & Storage

- **Status:** Migrated from Vercel API to **Supabase Edge Functions**.
- **Model:** Upgraded to **Gemini 3.1 Flash-Lite** for the best balance of speed, cost-efficiency, and structured data extraction.
- **Storage:** Implemented a private `food-images` bucket on Supabase with RLS policies to restrict user access to their own folders (`/{user_id}/{filename}`).
- **Data Parsing:** Added `parseFloat` and numeric validation to the frontend `CameraScanner.tsx` to handle potential string types from AI responses.

### 2. UI/UX Strategy (Dropset Style)

- **Theme:** High-end Fitness App (Inspired by Dropset/iOS Native).
- **Dark Mode Support:** 
  - Systematic implementation of `dark:` utility classes across all components.
  - Theme persistence in `localStorage` with options for **Light**, **Dark**, and **System Default**.
  - Custom `ios-blur` utility in `index.css` dynamically adjusts for light/dark translucency.
- **Navigation:** 
  - 5-item iOS Style Bottom Navigation Bar (Diary, Stats, Scan FAB, Logs, Profile).
  - Premium `ios-blur` glassmorphism background and `tap-effect` for tactile feedback.
- **Mobile Mandate (375px Support):** 
  - **Critical UX Rule:** All screens must be fully functional and visually balanced at **375px width** (iPhone SE/13 mini).
  - **Strategy:** Use `grid-cols-1 sm:grid-cols-N` to stack elements vertically on small screens.
  - **Scaling:** Avoid horizontal "squeezing" by converting horizontal row layouts (like macro grids) to vertical or flex-wrap stacks on mobile.
- **Charts:** Integrated a simplified, robust version of **shadcn/ui Charts** (Recharts) for weekly trends.
- **Mobile Refinements:** 
  - Added `shrink-0` to dashboard icons to prevent layout compression on long text.
  - Implemented vertical stacking in `CameraScanner` results for better input spacing on small screens.
  - Simplified the scan summary by keeping food names static while allowing calorie/macro edits.
  - Reverted border radius back to original premium state (`rounded-[48px]`, `rounded-4xl`, etc.).

### 3. State & Routing (Clean Architecture)

- **Zustand:** Centralized store for `session`, `profile`, `loading`, and `theme` states.
- **TanStack Router:** File-Based Routing in `src/routes/`.
- **Detail View:** Implemented a dynamic route `/logs/$logId` to view detailed meal information, complete with secure image signed-URLs and deletion capability.
- **Sticky/Fixed Navigation:** Use `fixed top-0` for detail headers to ensure stability within overflow-y containers.
- **Secure Image Rendering:** Use `supabase.storage.from('bucket').createSignedUrls()` for batch fetching private image URLs in lists (Dashboard/Logs) to ensure RLS compliance while maintaining performance.
- **Dynamic Tagging:** Food logs are dynamically tagged (e.g., "High Protein" for ≥15g, "Low Calorie" for ≤200kcal) instead of using hardcoded labels.

---

## Technical Polish & Bug Fixes

- **Type Safety:** Replaced `any` with robust union types (`string | number | null | undefined`) in `CameraScanner.tsx`'s `parseNumeric` helper.
- **UI Logic:** Hardened the AI result display to handle `0` or `null` values correctly, preventing display glitches like "0gg".
- **Authentication:** Added a "Forgot Password" flow with Supabase `resetPasswordForEmail` integration.
- **Profile Persistence:** Integrated weight updates and TDEE syncing directly into the `Profile` component.

---

## Environment Variables (.env)

- `VITE_SUPABASE_URL`: Supabase project URL.
- `VITE_SUPABASE_ANON_KEY`: Primary API key.

---

## Current Status (March 23, 2026)

- [x] Gemini 3.1 Flash-Lite Integration (Complete)
- [x] Dropset-style Native UI (Complete)
- [x] File-Based Routing (TanStack Router) (Complete)
- [x] Zustand State Management (Complete)
- [x] PWA Manifest & Icons (Complete)
- [x] Supabase RLS & Schema (Complete)
- [x] 5-Item Navigation (Complete)
- [x] Real-Data Weekly Overview & shadcn Charts (Complete)
- [x] Historical Logs View (Complete)
- [x] Path Aliases (@/ prefix) (Complete)
- [x] Profile Weight & TDEE Sync (Complete)
- [x] Type-Safe Numeric Parsing (Complete)
- [x] Forgot Password Flow (Complete)
- [x] Secure Food Image Storage (Complete)
- [x] Log Detail View (Complete)
- [x] System-wide Dark Mode (Complete)
- [ ] User Settings / Profile Editing (Planned)
- [ ] Custom Macro Goal Settings (Planned)
