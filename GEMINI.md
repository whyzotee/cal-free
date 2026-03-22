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
- **Implementation:** Uses direct REST fetch to Google AI API with `response_mime_type: "application/json"` for reliable structured data.
- **Security:** API Key is stored as a Supabase Secret (`GEMINI_API_KEY`).
- **Data Parsing:** Added `parseFloat` and numeric validation to the frontend `CameraScanner.tsx` to handle potential string types from AI responses.

### 2. UI/UX Strategy (Dropset Style)

- **Theme:** High-end Fitness App (Inspired by Dropset/iOS Native).
- **Design System:**
  - **Typography:** SF Pro / System Font stack with Extra Bold weights.
  - **Components:** Custom shadcn-like components (Button, Card) with high border radius (24px-48px).
  - **Layout:** 5-item iOS Style Bottom Navigation Bar (Diary, Stats, Scan FAB, Logs, Profile).
  - **Visuals:** Dark Hero cards with circular progress rings and iOS-style Glassmorphism (Blur).

### 3. State & Routing (Clean Architecture)

- **Zustand:** Centralized store for `session`, `profile`, and `loading` states.
- **TanStack Router:** File-Based Routing in `src/routes/`.
- **Route Implementation:** Following a uniform pattern where each route file defines a local `Page` component that wraps a primary UI component from `src/components/`. This maintains Fast Refresh compatibility and separates routing logic from implementation.
- **Component Renaming:** Unified naming convention (e.g., `Profile.tsx`, `Overview.tsx`, `Logs.tsx`) to match their respective routes.

---

## Environment Variables (.env)

- `VITE_SUPABASE_URL`: Supabase project URL.
- `VITE_SUPABASE_ANON_KEY`: Primary API key.

---

## Development Commands

- **Frontend:** `bun run dev`
- **Local Edge Functions:** `supabase functions serve analyze-food --env-file supabase/.env --no-verify-jwt`
- **Deploy Edge Functions:** `supabase functions deploy analyze-food`
- **Set Secrets:** `supabase secrets set GEMINI_API_KEY=xxx`

---

## Current Status (March 22, 2026)

- [x] Gemini 3.1 Flash-Lite Integration (Complete)
- [x] Dropset-style Native UI (Complete)
- [x] File-Based Routing (TanStack Router) (Complete)
- [x] Zustand State Management (Complete)
- [x] PWA Manifest & Icons (Complete)
- [x] Supabase RLS & Schema (Complete)
- [x] 5-Item Navigation (Diary, Stats, Scan, Logs, Profile) (Complete)
- [x] Weekly Performance Overview & Graphs (Complete)
- [x] Historical Logs View (Complete)
- [ ] User Settings / Profile Editing (Planned)
- [ ] Real-time Macro Updates (Planned)
