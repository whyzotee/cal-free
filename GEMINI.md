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

### 1. AI Integration (Edge Functions)

- **Status:** Migrated from Vercel API to **Supabase Edge Functions**.
- **Model:** Upgraded to **Gemini 3.1 Flash-Lite** for the best balance of speed, cost-efficiency, and structured data extraction.
- **Security:** API Key is stored as a Supabase Secret (`GEMINI_API_KEY`).
- **Data Parsing:** Added `parseFloat` and numeric validation to the frontend `CameraScanner.tsx` to handle potential string types from AI responses.

### 2. UI/UX Strategy (Dropset Style)

- **Theme:** High-end Fitness App (Inspired by Dropset/iOS Native).
- **Navigation:** 
  - 5-item iOS Style Bottom Navigation Bar (Diary, Stats, Scan FAB, Logs, Profile).
  - Clean active states using TanStack Router's `isActive` (color change only, no fill).
  - Premium `ios-blur` glassmorphism background and `tap-effect` for tactile feedback.
- **Charts:** Integrated a simplified, robust version of **shadcn/ui Charts** (Recharts) for weekly trends.

### 3. State & Routing (Clean Architecture)

- **Zustand:** Centralized store for `session`, `profile`, and `loading` states.
- **TanStack Router:** File-Based Routing in `src/routes/`.
- **Imports:** Configured `@` path alias (`@/components`, `@/lib`, etc.) in `tsconfig` and `vite.config.ts`.
- **Developer Experience:** Following a uniform pattern where each route file defines a local `Page` component to maintain Fast Refresh compatibility.

---

## Environment Variables (.env)

- `VITE_SUPABASE_URL`: Supabase project URL.
- `VITE_SUPABASE_ANON_KEY`: Primary API key.

---

## Current Status (March 22, 2026)

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
- [ ] User Settings / Profile Editing (Planned)
- [ ] Photo Storage in Supabase (Planned)
