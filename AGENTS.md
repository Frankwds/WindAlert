# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

WindLord is a Next.js 16 (App Router) paragliding weather app for Norway. Single-product, not a monorepo. See `README.md` for details.

### Dev commands

| Task | Command |
|------|---------|
| Install deps | `npm install` |
| Dev server | `npm run dev` (port 3000) |
| Build | `npm run build` |
| Test | `npm test -- --passWithNoTests` |
| Format check | `npm run format:check` |
| Format fix | `npm run format` |

### Known issues

- **Linting**: The `package.json` `lint` script runs `next lint`, which was removed in Next.js 16. Running `npx eslint` directly also fails due to a circular reference in the `eslint.config.mjs` FlatCompat bridge with `eslint-config-next`. Linting is currently non-functional.
- **Prettier**: There are pre-existing formatting issues in ~177 files. Running `npm run format` will fix them but introduces a large diff.

### Environment variables

The app requires a `.env.local` file. Key variables (see Supabase client files in `src/lib/supabase/` for details):

- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` - **required** (Supabase client throws at module level if missing)
- `SUPABASE_SERVICE_ROLE_KEY` - required for server-side API routes
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` - required for map rendering (homepage is a Google Maps component)
- `GOOGLE_MAPS_API_KEY`, `HOLFUY_API_KEY`, `MET_CLIENT_ID`, `CRON_SECRET`, `BROWSERLESS_API_KEY`, `FIXIE_URL` - optional

Without real Supabase/Google Maps keys, the dev server starts but shows "Failed to load map" on the homepage. Static pages (About, Contact, Contribute) render fully. Build succeeds with placeholder env vars (Supabase fetch errors are non-fatal during static generation).

### Testing

No test files exist currently. Jest is configured via `jest.config.mjs` with `jest-environment-jsdom`. Run `npm test -- --passWithNoTests` to avoid a non-zero exit code.
