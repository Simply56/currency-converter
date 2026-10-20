# Currency Converter

Single-screen currency converter PWA built with Angular. Rates come from the ECB feed and are cached for offline use. Requirements are in `SPEC.md`.

## Commands

```bash
pnpm install
pnpm start       # dev server at http://localhost:4200
pnpm build       # production build → dist/
pnpm test        # unit tests (Vitest)
pnpm run check   # ESLint + Prettier check
pnpm deploy      # build with --base-href /currency-converter/ and publish to GitHub Pages
```
