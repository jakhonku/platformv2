# Orchestra & Choir Talent.uz — frontend prototype

Next.js 16 (App Router) + Tailwind v4 + shadcn (base-nova) + next-intl (`/uz`, `/ru`, `/en`). Frontend only: all data is mock and is read through `lib/data`.

## Scripts

- `npm run dev` — development server
- `npm run build && npm start` — production build
- `npm run lint`, `npx tsc --noEmit` — static checks
- `npm run check` — project rules (light theme only, no direct `lib/mock` imports, message parity)
- `npm test` — unit tests for `lib/**`

## Structure

- `app/[locale]/` — routes: `(public)`, `(auth)`, `cabinet`, `admin`
- `components/` — `ui`, `layout`, `talent`, `collective`, `casting`, `media`, `catalog`, `home`
- `lib/data/` — async data layer (swap for REST later); `lib/mock/` — mock data; `lib/constants/` — reference lists
- `types/`, `messages/{uz,ru,en}.json`, `i18n/`
