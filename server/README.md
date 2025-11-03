# Harmoniq Auth Server

Node.js/Express authentication server with PostgreSQL, bcrypt, JWT in HTTP-only cookies, and Google OAuth verification.

## Stack
- Express, Helmet, CORS
- PostgreSQL (pg)
- bcrypt for password hashing
- JSON Web Tokens via cookies
- Google ID token verification
- Input validation with Zod
- Rate limiting

## Setup

1. Create .env from template

```
cp server/.env.example server/.env
```

Edit values as needed (DB creds, JWT secret, Google client ID, CORS origin).

2. Install dependencies

```
cd server
npm install
```

3. Create database schema and seed data

Ensure your Postgres database exists (e.g., `harmoniq`). Then run:

```
npm run migrate
```

This will create tables (`users`, `sessions`, `categories`, `products`, `instruments`, `courses`, `instructors`) and seed initial data.

4. Run the server

```
npm run start
```

Server will listen on `http://localhost:4000` by default.

## Endpoints
- POST /api/auth/register { email, password, name }
- POST /api/auth/login { email, password }
- POST /api/auth/google-signin { token }
- POST /api/auth/logout
- GET /api/auth/me (requires cookie)

All auth endpoints set/clear an HTTP-only cookie named by `COOKIE_NAME`.

## pgAdmin configuration
- Open pgAdmin, connect to your server
- Create a database (e.g., `harmoniq`)
- Ensure your user (PGUSER) has privileges
- Connection fields map to env:
  - Host: PGHOST
  - Port: PGPORT
  - Maintenance DB: postgres
  - Username: PGUSER
  - Password: PGPASSWORD
- After creating the `harmoniq` DB, you can open a Query Tool and paste `server/src/schema.sql` to create tables (or run `npm run migrate`).

## Security notes
- Use HTTPS in production and set COOKIE_SECURE=true; set SameSite appropriately
- Use a long, random JWT_SECRET
- Increase rate-limiting as needed
- Consider session blacklisting using the `sessions` table by storing JWT jti
- Always verify Google ID tokens server-side (provided)
