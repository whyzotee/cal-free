# Project Context: Zero-Cost AI Calorie Tracker (PWA)

## Core Vision

A premium-feel, high-performance Calorie Tracker PWA built with zero-cost infrastructure.

## Tech Stack

- **Runtime:** Bun
- **Frontend:** React (Vite) + Tailwind CSS v4
- **Database & Auth:** Supabase (PostgreSQL with RLS)
- **AI Engine:** Google Gemini 2.0 Flash (via Supabase Edge Functions)
- **Deployment:** Vercel (Frontend) + Supabase (Backend/AI)

---

## Architectural Decisions

### 1. AI Integration (Edge Functions)

- **Status:** Migrated from Vercel API to **Supabase Edge Functions**.
- **Model:** Upgraded to **Gemini 2.0 Flash** for superior speed and accuracy.
- **Implementation:** Uses direct REST fetch to Google AI API with `response_mime_type: "application/json"` for reliable structured data.
- **Security:** API Key is stored as a Supabase Secret (`GEMINI_API_KEY`).

### 2. UI/UX Strategy (Dropset Style)

- **Theme:** High-end Fitness App (Inspired by Dropset/iOS Native).
- **Design System:**
  - **Typography:** SF Pro / System Font stack with Extra Bold weights.
  - **Components:** Custom shadcn-like components (Button, Card) with high border radius (24px-48px).
  - **Layout:** Bottom Navigation Bar with a prominent Squircle FAB for scanning.
  - **Visuals:** Dark Hero cards with circular progress rings and iOS-style Glassmorphism (Blur).

### 3. Database Schema

- **Profiles Table:** Uses `id` (UUID) as both PK and FK referencing `auth.users(id)`.
- **Calorie Logs:** Optimized for daily aggregation with RLS policies ensuring users only access their own data.

---

## Environment Variables (.env)

- `VITE_SUPABASE_URL`: Supabase project URL.
- `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY`: Primary API key.

---

## Development Commands

- **Frontend:** `bun run dev`
- **Local Edge Functions:** `supabase functions serve analyze-food --env-file supabase/.env --no-verify-jwt`
- **Deploy Edge Functions:** `supabase functions deploy analyze-food`
- **Set Secrets:** `supabase secrets set GEMINI_API_KEY=xxx`

---

## Current Status (March 22, 2026)

- [x] Gemini 2.5 Flash Integration (Complete)
- [x] Dropset-style Native UI (Complete)
- [x] PWA Manifest & Icons (Complete)
- [x] Supabase RLS & Schema (Complete)
- [ ] User Settings / Profile Editing (Planned)
- [ ] Weekly/Monthly Analytics (Planned)
