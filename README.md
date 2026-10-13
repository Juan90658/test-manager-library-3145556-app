# test-manager-library-3145556-app

> **Technical test · ADSO 3145556** — *Manager Library* operations frontend in **React 19 + Vite**.
> Talks only to the API contract (`/api/v1`). Screen texts are in Spanish (user-facing); code is in English.

## Running it

```bash
cp .env.example .env     # VITE_API_URL=http://localhost:8000/api/v1
npm install
npm run dev              # http://localhost:5173
```

With `infra`: `docker compose up --build` serves it at http://localhost:5173.

## Screens (T-22)

| Screen | Route | Role | Story |
|---|---|---|---|
| Login | `/ingresar` | public | HU-01 |
| Catalog: search, category filter, pagination; create, edit, cover upload/removal, soft delete | `/libros` | all (editing: admin) | HU-03, HU-04 |
| Members: create, search, detail with unreturned count | `/socios` | admin, librarian | HU-05 |
| New loan: one member, 1–3 different books | `/prestar` | admin, librarian | HU-06 |
| Loans by date range and status; return one line at a time | `/prestamos` | admin, librarian | HU-07, HU-08 |
| Overdue lines, most days late first | `/vencidos` | admin, librarian | HU-09 |
| Most borrowed report | `/reporte` | admin | HU-10 |
| Create librarians | `/usuarios` | admin | HU-02 |

Design notes:

- The server enforces every rule; the UI only guides (it disables the 4th book, hides admin actions from librarians)
  and always shows the API's own `message` and `details`, so both share one source of truth.
- Covers are fetched with the token through `GET /books/{id}/cover` and shown as object URLs; `cover_key` is never used as a path.
- The ISBN field is disabled when editing: `PUT /books/{id}` does not change it.
- A 401 from any call clears the session and returns to login (expired 8-hour token).

## End-to-end walkthrough

1. Log in as admin → create a librarian in *Bibliotecarios*.
2. *Catálogo* → create a book with 1 copy, upload a PNG cover.
3. *Socios* → register a member.
4. *Prestar* → lend the book; available copies drop to 0.
5. *Préstamos* → return the line; the loan shows *Cerrado*.
6. *Reporte* → today's range lists the book.
