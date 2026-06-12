# Contributing to TechDecide — Frontend (techdecide-frontend)

Thank you for your interest in contributing to the TechDecide frontend!

## Tech Stack

- Angular 21 (standalone components — no NgModules)
- NgRx SignalStore (`@ngrx/signals`)
- PrimeNG 21 + custom Indigo preset
- TypeScript (strict mode)

## Local Setup

See [README.md](README.md) for the full local dev setup (`ng serve`).

## Branching Model

This project uses **GitFlow**:

| Branch pattern   | Purpose                              |
|------------------|--------------------------------------|
| `master`         | Latest stable release — protected    |
| `develop`        | Integration branch — protected       |
| `feature/<name>` | New features — branch from `develop` |
| `fix/<name>`     | Bug fixes — branch from `develop`    |

Never commit directly to `master` or `develop`.

```bash
git checkout develop
git checkout -b feature/your-feature-name
```

## Commit Style

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add decision filter by tag
fix: correct skeleton guard on detail page
chore: upgrade PrimeNG to 21.2
refactor: extract vote summary to dumb component
test: add report builder integration test
docs: update README with environment setup
```

## Architecture Rules

- **State types**: always `type`, never `interface` — `interface` causes "Object is of type unknown" in NgRx SignalStore templates
- **`patchState` inside async callbacks**: always use the function form — `patchState(store, (s) => ({ ...s, items }))`
- **Containers**: inject Store only — never inject services directly
- **Detail pages**: use `route.paramMap.subscribe()`, never `route.snapshot.paramMap`
- **Back navigation**: always `Location.back()`, never a hardcoded route
- **Skeleton guard**: always `loading() && !data()`, never just `loading()`
- **Path aliases**: always use `@core`, `@features`, `@shared`, `@layout`, `@env` — never relative paths crossing feature boundaries

## Pull Requests

- Open PRs against `develop`, not `master`
- Keep each PR focused on one concern
- Ensure `ng build` passes with zero errors and zero warnings before opening a PR

## Reporting Issues

Open a GitHub Issue with:
- A clear description of the bug or feature request
- Steps to reproduce (for bugs)
- Expected vs actual behavior

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
