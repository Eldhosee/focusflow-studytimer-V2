# FocusFlow

A premium, offline-first Study Session Tracker with a distraction-free Focus Mode.

## Stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · Framer Motion · React Router ·
Dexie (IndexedDB) · Recharts · React Hook Form + Zod · Lucide React ·
vite-plugin-pwa (Workbox)

## Getting started

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build -> dist/
npm run preview   # serve the production build locally
```

The app is installable as a PWA straight from `npm run preview` or any HTTPS deploy —
look for the install icon in your browser's address bar, or "Add to Home Screen" on mobile.

## What's implemented

- **Onboarding** — welcome screen, display name, daily goal, optional subjects
- **Focus Mode** — the core feature. Fullscreen, distraction-free timer that is
  **timestamp-based** (never `setInterval` accumulation), so it recovers exactly after
  a refresh, tab switch, browser restart, or PWA reopen. Keyboard shortcuts
  (`Space` end, `F` fullscreen, `Esc` exit fullscreen), animated particle background,
  cursor auto-hide on idle.
- **Dashboard** — today's study time, goal ring, streak, average/longest session,
  weekly + monthly charts, GitHub-style heatmap, recent sessions, confetti on goal hit.
- **Sessions** — searchable list grouped by day, inline edit (subject/notes/tags) via
  React Hook Form + Zod, delete with undo.
- **Calendar** — monthly grid, click a day for a side panel with time/sessions/longest/subjects.
- **Statistics** — daily/weekly/monthly/yearly tabs, subject breakdown pie chart, goal
  completion rate, heatmap.
- **Goals** — daily/weekly/monthly/custom goals with animated progress rings.
- **Settings** — profile & daily goal, notification toggle (real browser Notifications API,
  incl. a working break-reminder during Focus Mode), keyboard shortcut reference, CSV
  export, full JSON backup export/import.
- **PWA** — manifest, service worker (Workbox, `NetworkFirst` for HTML /
  `StaleWhileRevalidate` for assets), installable, works offline once cached, custom icons.
- Dexie repository pattern, strict TypeScript, feature-based folder structure, lazy-loaded
  routes for code splitting, reduced-motion support, custom scrollbar, skeleton loaders,
  empty states throughout.

## Scoped out of this pass

To avoid shipping placeholder code, a few items from the original brief were deliberately
left out rather than half-implemented:

- **PDF export** (CSV + JSON backup are implemented)
- **Command palette** (⌘K-style quick search/actions)
- **Scheduled daily reminder notifications** — the Notifications API wiring exists and is
  used for goal-completion and break reminders (which fire from live app state), but a
  reminder that fires at a fixed clock time *while the app isn't open* needs a periodic
  background sync / push subscription, which requires a backend and isn't meaningful for a
  fully local-first, no-server app.

All of the above can be added in a follow-up pass — the architecture (repository pattern,
feature folders, service layer) is set up to make that straightforward.
