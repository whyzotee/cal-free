# Project: Calorie Tracker PWA (Premium "Dropset" Style)

## 🎯 Overall Goal
Build a high-performance, premium-feel (iOS/Dropset style) Calorie Tracker PWA using Bun, React, Tailwind v4, Supabase, and Gemini 3.1 Flash-Lite with comprehensive nutritional analysis and system-wide dark mode.

## 🛠 Active Constraints
- **Runtime**: Bun. Imports use `@/` for `src/`.
- **Mobile Mandate**: All screens must be fully functional at 375px width (iPhone SE).
- **Layout**: Vertical stacking (`grid-cols-1`) on mobile; aggressive rounding (`rounded-[48px]`, `rounded-4xl`).
- **Typography**: Consistent "Dropset" headers for "Overview", "History", and "Profile" using `text-4xl font-black tracking-tight italic`.
- **Spacing**: Standardized responsive padding at `px-6 sm:px-10` for main content containers and `p-8 sm:p-10` for cards.
- **Scroll Behavior**: Reset `main` container scroll to (0,0) on route changes via `useLocation` in `__root.tsx`.
- **Loading Pattern**: Standardized "Thinking..." centered animation across all pages using `Loader2` and `Sparkles` or `History`.

## 🧠 Key Knowledge
- **Nutrition**: Supports calories, protein, carbs, fat, sugar (g), sodium (mg), and cholesterol (mg).
- **Visuals**: Uses specific emojis (🍗, 🍚, 🧈, 🍭, 🧂, 🍳) for high-impact identification.
- **Icon Sizing**: Macro icons are `text-xl` (🍗, 🍚, 🧈) and micro icons are `text-sm` (🧂, 🍭).
- **Architecture**: Shared `NutritionDisplay.tsx` component unifies the nutrition UI, macro ratio bar, and AI refinement box across the Scanner and History Detail.
- **UI Design**: "Dropset" aesthetic features high-impact "Nutrition Hero" cards, italicized numerical totals, and a multi-color Macro Ratio Bar (Pink: Protein, Blue: Carbs, Zinc: Fat).
- **Data Integrity**: History details (`logs_.$logId.tsx`) are strictly read-only to ensure a permanent record of past logs. Editing is only permitted during the initial scan/log phase.
- **Edge Security**: AI Analysis is protected by JWT verification using `auth.getClaims(token)` for maximum performance.

## 🛠 Artifact Trail
- `src/components/NutritionDisplay.tsx`: Unified component for nutrition stats and macro ratio bars. Features increased emoji sizes and stacked layouts for "Dropset" impact.
- `src/components/CameraScanner.tsx`: Fully integrated `editableServing` and `editableUnit` for precise portion control before logging. Includes client-side auth checks.
- `src/routes/logs_.$logId.tsx`: Read-only history detail view. Removed all status indicators ("Healthy Choice", etc.) for a cleaner focus on food data.
- `supabase/functions/analyze-food/index.ts`: Updated to latest Supabase pattern (`npm:@supabase/supabase-js@2`) with lightweight JWT verification.

## 📅 Task State
1. [DONE] Dark Mode & Scroll Fixes.
2. [DONE] Premium Scanner UI Refresh ("Dropset" style).
3. [DONE] Shared Nutrition UI Component (`NutritionDisplay`).
4. [DONE] Unified Premium Loading States across all views.
5. [DONE] Group History by Date with Day Totals.
6. [DONE] AI Refinement (Recalculate with AI).
7. [DONE] Image Skeletons & Portion Size Editing.
8. [DONE] Fast JWT Verification for Edge Functions.
9. [IN PROGRESS] Profile Editing UI (Weight, Height, Age updates).
10. [TODO] Custom Macro Goal Settings (Target Ratios).

---
*Last Updated: Monday, March 23, 2026*
