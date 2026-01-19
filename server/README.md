# Mini CRM API (Express)

## Setup

```bash
npm install
npm run dev
```

Create `.env` from `.env.example`. SQLite database file defaults to `server/data.sqlite`.

## Demo user

```bash
npm run seed
```

Creates `demo@example.com` with password `demo123` (admin).

## Auth

- `POST /auth/register` `{ name, email, password }`
- `POST /auth/login` `{ email, password }`

The first registered user becomes `admin`.

## Protected resources

All routes below require `Authorization: Bearer <token>`.

- `GET /dashboard`
- `GET /clients` `?q=&status=&owner=`
- `POST /clients`
- `GET /clients/:id`
- `PUT /clients/:id`
- `DELETE /clients/:id` (admin only)
- `GET /leads` `?q=&stage=&owner=`
- `POST /leads`
- `GET /leads/:id`
- `PUT /leads/:id`
- `DELETE /leads/:id`
- `GET /tasks` `?status=&clientId=`
- `POST /tasks`
- `GET /tasks/:id`
- `PUT /tasks/:id`
- `DELETE /tasks/:id`
- `GET /audit` (admin only)
