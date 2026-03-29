# Grabble AI - Design System Reference

## Overview
Grabble AI is a design inspiration management tool — a "Pinterest for UI designers." Users upload screenshots, which are auto-analyzed by Gemini AI for tags, components, and color palettes. Screenshots can be organized into folders, smart folders (AI-categorized), and moodboards.

## Tech Stack
- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS v4 (inline classes only, no CSS modules/files)
- **Icons:** lucide-react
- **Animations:** motion (Framer Motion compatible)
- **Drag & Drop:** @dnd-kit/core + @dnd-kit/sortable
- **Backend:** Firebase (Auth + Firestore)
- **AI:** Google Gemini (@google/genai)
- **Export:** html-to-image

## Typography
- **Font Family:** Poppins (Google Fonts) — weights: 400, 600, 700, 800, 900
- **Applied via:** `font-sans` on root container
- **Scale:** text-xs (10px) → text-6xl (48px)
- **Headings:** font-bold / font-extrabold
- **Body:** font-medium / font-semibold

## Color System (exact values — do not alter)

### Primary Accent (Lime Green)
- `#a3e635` — Primary CTA, active states, focus rings
- `#84cc16` — Hover state for primary buttons
- `#f4fce3` — AI tag background, light accent surface
- `#3f6212` — AI tag text on light lime background
- `#bef264` — Drag-over accent text on dark
- `#d7ff64` — Landing page right-side background

### Neutrals (Zinc scale)
- `#18181b` (zinc-900) — Primary text, dark backgrounds
- `#27272a` (zinc-800) — Sidebar borders, doodle shadows
- `#3f3f46` (zinc-700) — Secondary text dark
- `#52525b` (zinc-600) — Body text
- `#71717a` (zinc-500) — Muted text, placeholders
- `#a1a1aa` (zinc-400) — Inactive nav, subtle icons
- `#d4d4d8` (zinc-300) — Borders light
- `#e4e4e7` (zinc-200) — Card borders, dividers
- `#f4f4f5` (zinc-100) — Input backgrounds, subtle surfaces
- `#fafafa` (zinc-50) — Page background
- `#ffffff` — Cards, modals, content areas

### Semantic
- `#dc2626` (red-600) — Delete actions
- `#16a34a` (emerald-600) — Success
- Emerald-50/700 — Custom tag bg/text
- Blue, purple, amber — Used in landing page doodles only

## Component Patterns

### Buttons
- **Primary CTA:** `bg-[#a3e635] text-zinc-900 font-bold rounded-xl hover:bg-[#84cc16]`
- **Secondary (dark):** `bg-zinc-900 text-white rounded-xl hover:bg-zinc-800`
- **Pill (boards):** `bg-zinc-900 text-[#a3e635] font-bold rounded-full`
- **Icon button:** `p-2 text-zinc-400 hover:bg-zinc-100 rounded-full`
- **FAB (mobile upload):** `w-12 h-12 bg-[#a3e635] rounded-full shadow-lg -mt-5`

### Cards
- **Screenshot card:** `break-inside-avoid rounded-2xl overflow-hidden bg-zinc-200`
- **Board/folder card:** `aspect-[4/3] rounded-2xl border border-zinc-200`
- **Drag-over state:** `border-[#a3e635] ring-2 ring-[#a3e635] ring-offset-2`

### Modals
- **Backdrop:** `fixed inset-0 bg-zinc-900/80 backdrop-blur-sm z-50`
- **Container:** `bg-white rounded-[2rem] shadow-2xl`
- **Input fields:** `bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-[#a3e635]`

### Tags
- **AI tags:** `bg-[#f4fce3] text-[#3f6212] rounded-lg`
- **Custom tags:** `bg-emerald-50 text-emerald-700 rounded-lg`
- **Component tags:** `bg-zinc-100 text-zinc-700 rounded-lg`

### Navigation
- **Sidebar (desktop):** `w-64 bg-zinc-950` with gradient overlay, hidden below md
- **Active nav:** `bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]`
- **Inactive nav:** `text-zinc-400 hover:bg-white/5 hover:text-white`
- **Bottom nav (mobile):** `md:hidden fixed bottom-0 bg-white border-t border-zinc-200`

## Layout Structure
```
Root: flex h-screen bg-zinc-50 font-sans overflow-hidden
├── Sidebar (w-64, hidden md:flex)
├── Main content (flex-1 flex flex-col min-w-0)
│   ├── Topbar (h-16, sticky top-0)
│   └── Content (flex-1 overflow-y-auto p-4 sm:p-6 md:p-8)
│       └── max-w-7xl mx-auto
└── BottomNav (md:hidden, fixed bottom-0)
```

## Responsive Breakpoints
- **Default:** Mobile-first (no prefix)
- **sm (640px):** Tablet adjustments
- **md (768px):** Sidebar appears, bottom nav hides
- **lg (1024px):** 3-column grids
- **xl (1280px):** 4-column grids, landing page max widths

## Grid Patterns
- **Masonry feed:** `columns-2 lg:columns-3 xl:columns-4 gap-4 sm:gap-6`
- **Board grid:** `grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4`

## Special Effects
- **Sidebar inner glow:** `shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]`
- **Doodle shadows:** `shadow-[16px_16px_0px_#27272a]` (landing page)
- **Glass effect:** `bg-white/95 backdrop-blur-md`
- **Hidden scrollbar:** `[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]`

## Routing
State-based navigation (no React Router). Views: landing, home, boards, boardDetail, search, moodboards, moodboardDetail.

## Critical Rules
1. **Never change the existing desktop design** — all changes must be additive mobile responsiveness
2. **No new CSS files** — everything is Tailwind utility classes
3. **Preserve exact hex colors** — never substitute with different values
4. **Poppins font only** — no additional font imports
5. **lucide-react icons only** — no emoji as structural icons
6. **Mobile breakpoint boundary:** `md:` (768px) — sidebar shows at md, bottom nav hides at md
