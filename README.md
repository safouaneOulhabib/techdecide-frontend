# TechDecide Frontend

Angular SPA for [TechDecide](https://github.com/safouaneOulhabib/techdecide-api) — a Technical Decision Hub for Agile Teams. Teams log, govern, discuss, and export Architecture Decision Records (ADRs) through a formal lifecycle.

## Tech Stack

| Layer         | Technology                          |
|---------------|-------------------------------------|
| Framework     | Angular 21 (standalone components)  |
| Language      | TypeScript 5.9 (strict mode)        |
| State         | NgRx SignalStore (`@ngrx/signals`)  |
| UI Library    | PrimeNG 21 + custom Indigo preset   |
| Icons         | PrimeIcons                          |
| PDF           | jsPDF + jspdf-autotable             |
| Package mgr   | npm 10                              |

## Local Development Setup

### Prerequisites

- Node.js 20+ and npm 10+
- The [TechDecide API](https://github.com/safouaneOulhabib/techdecide-api) running on `http://localhost:8080`

### 1 — Install dependencies

```bash
npm install
```

### 2 — Start the dev server

```bash
ng serve
```

The app opens at **http://localhost:4200**. The Angular app calls the backend directly via the URL in `src/environments/environment.ts`.

### 3 — Production build

```bash
ng build
```

Output is written to `dist/techdecide-frontend/`.

## Environment Setup

### API Base URL

The backend URL is configured in [`src/environments/environment.ts`](src/environments/environment.ts):

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api'
};
```

Change `apiUrl` to point at your deployed backend for production builds. The environment file is imported throughout the app via the `@env` path alias.

### Path Aliases

| Alias       | Resolves to            |
|-------------|------------------------|
| `@core`     | `src/app/core`         |
| `@features` | `src/app/features`     |
| `@shared`   | `src/app/shared`       |
| `@layout`   | `src/app/layout`       |
| `@env`      | `src/environments`     |

## Folder Structure

```
src/
  app/
    core/              App-wide singletons loaded once at startup
      auth/            AuthStore, AuthService, JWT interceptor, guards
    features/          One folder per product domain
      auth/            Login and register pages
      decisions/       Decision list, detail, form, lifecycle governance
      reports/         Report builder, detail, inline edit, PDF preview
      organizations/   Organization CRUD
      teams/           Team CRUD
      tags/            Tag CRUD
    layout/            App shell — sidebar, top navbar
    shared/            Reusable UI components (no business logic)
  environments/
    environment.ts     API URL and feature flags
```

Each feature folder follows a consistent internal structure:

```
features/<feature>/
  models/        Type definitions (always `type`, never `interface`)
  services/      HTTP-only services returning Observable<T>
  store/         NgRx SignalStore — state, loading, error
  components/    Dumb components (inputs/outputs only, no DI)
  containers/    Smart components (inject Store only)
  utils/         Pure business logic helpers with no Angular DI
```

## Authentication

JWT tokens are stored in `sessionStorage` under key `auth_user`. The JWT interceptor automatically attaches the token to every request except `/api/auth/login` and `/api/auth/register`. Tokens are validated on app load — expired tokens clear immediately.

Any 401 response from the API redirects to `/auth/login`.

## License

MIT — see [LICENSE](../LICENSE) in the monorepo root.
