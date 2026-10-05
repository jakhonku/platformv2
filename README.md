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

## Demo notes

- **Roles**: the header "Rolni almashtirish" switcher (shown when `NODE_ENV !== 'production'` or `NEXT_PUBLIC_DEMO=1`) sets the `demo-role` cookie; cabinet and admin menus follow it. There is no real authentication.
- **Login demo**: any password with 8+ characters; `admin@example.uz` (admin), `moderator@example.uz` (moderator). OTP and 2FA code is always `123456`.
- **Mutations** (apply, invite, cabinet edits, admin CRUD) run through Server Actions (`lib/data/actions.ts`, regenerate with `node scripts/gen-actions.mjs`) against **in-memory server state**. State resets when the server restarts and is not shared between serverless instances, so on Vercel it is best-effort and may appear to reset.
- YouTube ids in mock media are placeholders (`PLACEHOLD0N`); replace the constants in `lib/mock/media.ts` with real clips.

## Deploy (Vercel)

1. `vercel login`, then in this folder `vercel link` (new project, framework Next.js).
2. Set `NEXT_PUBLIC_DEMO=1` for the environments that should show the role switcher.
3. `vercel` for a preview, `vercel --prod` for production. Preconditions: `npm run check && npm run lint && npx tsc --noEmit && npm test && npm run build` are all green.
