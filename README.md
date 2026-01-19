# Mini CRM (Svelte + Tailwind)

## Dev

```bash
npm install
npm run dev
```

Set API URL (optional):

```bash
VITE_API_URL=http://localhost:4000
```

## Production (single domain)

```bash
npm install
npm run build
npm run start
```

Ensure `server/.env` exists on the server. `dist/` is served by Express.

## Backend

See `server/README.md`.
