# ER Modeller API

Express API for the React Flow editor. Diagram documents are stored in MongoDB and are private to the account that owns them.

## Run locally

1. Configure `MONGODB_URI` in `.env` with the local MongoDB or Atlas connection string.
2. Set `CORS_ORIGIN` to the exact frontend origin. For Vite's default address, use `http://localhost:5173`.
3. Start the backend from this directory:

   ```sh
   npm run dev
   ```

The API listens on port `5000` by default. `COOKIE_SAME_SITE=lax` is suitable when the frontend and API use localhost. For a frontend on a separate HTTPS site, configure `COOKIE_SAME_SITE=none`; production cookies are then marked Secure, and CORS must list the exact frontend origin.

## Accounts and privacy

- Create an account from the landing page with an email and a password of exactly 5 characters.
- Passwords are stored as salted scrypt hashes. The browser receives an HttpOnly session cookie; session tokens are stored hashed in MongoDB and expire after seven days.
- All diagram endpoints require a valid session. Reads, updates, and deletes filter by the authenticated owner, so knowing another diagram's ID does not grant access.
- Existing diagrams created before account ownership was added have no owner and are intentionally hidden from every account. Assign them to an account with a deliberate one-time migration if they need to be retained.
- Keep the Atlas connection string and its database user's password only in the backend `.env`, never in frontend code.

## Endpoints

All responses use JSON. Auth endpoints set or clear the HttpOnly session cookie.

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/health` | API and MongoDB connection status |
| POST | `/api/auth/register` | Create an account and sign in |
| POST | `/api/auth/login` | Sign in |
| POST | `/api/auth/logout` | End the current session |
| GET | `/api/auth/me` | Return the current account or `401` |
| POST | `/api/diagrams/save` | Create or update an owned diagram |
| GET | `/api/diagrams?limit=50` | List owned diagrams (metadata only; capped at 100) |
| GET | `/api/diagrams/:id` | Load an owned diagram |
| DELETE | `/api/diagrams/:id` | Delete an owned diagram |

Registration/login request body:

```json
{
  "email": "you@example.com",
  "password": "12345"
}
```

Diagram save body:

```json
{
  "id": null,
  "title": "My Database ERD",
  "nodes": [],
  "edges": [],
  "viewport": { "x": 0, "y": 0, "zoom": 1 }
}
```
