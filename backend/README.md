# ER Modeller API

Express API for saving ER diagrams from the React Flow editor. Diagrams are stored in MongoDB. This API intentionally has no authentication.

## Start

1. Ensure the MongoDB service is running locally.
2. Copy `.env.example` to `.env` and adjust `MONGODB_URI` if your local MongoDB uses a different address.
3. From this directory run:

   ```sh
   npm run dev
   ```

The default API address is `http://localhost:5000`; the default database is `er_modeller`. Set `VITE_BACKEND_API_URL=http://localhost:5000` in the frontend environment if the frontend needs an explicit API URL.

## Endpoints

All responses use JSON. Diagram objects contain MongoDB `_id`, `title`, `nodes`, `edges`, `createdAt`, and `updatedAt` fields.

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/health` | API and MongoDB connection status |
| POST | `/api/diagrams/save` | Create a diagram, or update one when `id` is provided |
| GET | `/api/diagrams?limit=50` | List recent diagrams (metadata only; limit is capped at 100) |
| GET | `/api/diagrams/:id` | Load a diagram including its nodes and edges |
| DELETE | `/api/diagrams/:id` | Delete a diagram |

Save request body:

```json
{
  "id": null,
  "title": "My Database ERD",
  "nodes": [],
  "edges": []
}
```

Omit `id` (or send `null`) to create a new diagram. Use the returned diagram `_id` to update it later. `CORS_ORIGIN` accepts a comma-separated list of frontend origins.
