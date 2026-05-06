# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # dev server at http://localhost:4200
ng build           # production build → dist/
ng test            # unit tests via Vitest
ng build --base-href /currency-converter/   # GitHub Pages build
```

No linter is configured. Tests use Vitest (not Karma/Jasmine).

## Architecture

**Product:** Single-screen currency converter PWA. Full requirements are in `SPEC.md`. No routing — the app is one screen.

**Angular version:** 21. Standalone components are the default; do NOT set `standalone: true`. All conventions from `.claude/CLAUDE.md` apply (signals, OnPush, `input()`/`output()`, native control flow, no `ngClass`/`ngStyle`).

**State:** Managed entirely with Angular signals. No NgRx or other state library. Derived values use `computed()`. Persisted state (selected currencies, last active field, cached rates, last-updated timestamp) lives in `localStorage` and is loaded into signals on startup.

**Key services (to be built):**
- `ExchangeRateService` — fetches ECB XML feed, parses rates, caches to `localStorage`, exposes rates as a signal.
- `ConverterStateService` — owns the two currency selections, active field, field values, `lastAnswer`, and triggers recalculation.

**Expression evaluation:** Arithmetic expressions (`+`, `-`, `×`, `÷`, `(`, `)`) typed via the custom keyboard are eval'd in-app. Invalid/incomplete expressions leave the opposite field unchanged.

**Assets:** All icons and SVGs are in `public/assets/` (Angular's build copies `public/**` to the output root). The `assets/` directory at the repo root is a staging area — files should be in `public/assets/` to be served.

**PWA:** Service worker and `manifest.webmanifest` are required. Use `@angular/pwa` or configure manually under `angular.json`. The service worker must cache all app assets and attempt a background fetch of fresh ECB rates when online.

**GitHub Pages:** Build with `--base-href /currency-converter/` (or whatever the repo path is). No server-side routing needed since the app has no routes.
