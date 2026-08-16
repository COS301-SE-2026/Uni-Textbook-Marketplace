# Contributing to Uni Textbook Marketplace

## Git Configuration (Required before first commit)

Every team member **must** configure their local Git before making any commits.
Untracked commits cannot be recovered and will not count toward your mark.

```bash
git config --global user.name "your-github-username"
git config --global user.email "your-github-email"
```

Verify it worked:
```bash
git config --global --list
```

## Branching Strategy

We follow **GitHub Flow**:

| Branch | Purpose |
|---|---|
| `main` | Always stable and production-ready. **No direct commits.** |
| `develop` | Integration branch. All features merge here first. |
| `feature/[name]` | New features (e.g. `feature/auth-service`) |
| `fix/[name]` | Bug fixes (e.g. `fix/listing-validation`) |
| `docs/[name]` | Documentation updates (e.g. `docs/srs-update`) |
| `test/[name]` | Test additions (e.g. `test/auth-unit-tests`) |

### Rules
- **Never commit directly to `main` or `develop`**
- Always create a feature branch from `develop`
- Open a Pull Request to merge back into `develop`
- At least **one team member must review** before merging

## Commit Message Convention

We use **Conventional Commits**:

```
type: short description
```

| Type | When to use |
|---|---|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation changes |
| `test` | Adding or updating tests |
| `refactor` | Code change that's not a fix or feature |
| `chore` | Build process, CI, config changes |
| `style` | Formatting, missing semicolons (no logic change) |

**Examples:**
```bash
git commit -m "feat: add university email verification endpoint"
git commit -m "fix: correct JWT expiry time in auth service"
git commit -m "docs: add expanded use cases to SRS"
git commit -m "test: add unit tests for listing creation"
git commit -m "chore: configure GitHub Actions CI pipeline"
```

## Pull Request Process

1. Create your branch from `develop`
2. Make your changes with clear, conventional commits
3. Push your branch and open a PR against `develop`
4. Fill in the PR description - what did you change and why?
5. Request a review from at least one team member
6. Fix any review comments
7. Merge once approved - **squash and merge** preferred

## Code Quality

- All PRs must pass the CI pipeline before merging
- Test coverage must be at least **80%**
- No linting errors allowed on merge
- Never commit `.env` files or secrets

## Frontend End-to-End Tests (Cypress)

We use Cypress for real, no mock end-to-end coverage of user flows. Specs live in `frontend/cypress/e2e/*.cy.ts`.

### First-time setup

```bash
cd frontend
npm install
```

Cypress downloads a real browser binary on install, separate from the npm package itself,this can take a minute the first time.

**Known issue on some networks:** if install fails with `getaddrinfo ENOENT download.cypress.io`, this is a DNS resolution problem, not a Cypress bug. Try:
```bash
NODE_OPTIONS=--dns-result-order=ipv4first npm install cypress --save-dev
```

If that doesn't fix it, try a different network (mobile hotspot) before assuming your setup is broken, some restrictive networks (including parts of the UP network) interfere with this specific download.

### Running tests locally

E2E tests need a **real backend and a real production-mode frontend running**, not the dev server:

```bash
# terminal 1: backend running as normal (docker-compose, or npm run start:dev)

#terminal 2: frontend
cd frontend
npm run build
npm run start
```

**Do not run these against `npm run dev`.** Next.js's dev server compiles routes on demand and Strict Mode double-renders components, both cause real, confusing test flakiness that isn't present in production mode or in CI. Always use `build` + `start` locally.

Then, in a third terminal:

```bash
npm run cy:open # interactive GUI, best for writing/debugging a spec
npm run cy:run # in the terminal, matches what CI runs
```

### Writing a new spec

- One spec file per feature area (e.g. `login.cy.ts`, `register.cy.ts`, `report.cy.ts`), matching the person who owns that feature's testing task in the sprint plan.
-Ass a visibility assertion immediately after `cy.visi()`, before any click or type:
```ts
cy.visit('/some/route');
cy.contains('Something guaranteed to be on the page').should('be.visible');
```

This isn't optional boilerplate, it prevents a real, easy-to-hit Next.js hydration race where Cypress clicks a button before React has attached its event handlers, causing the click to silently do nothing.
- Use the real seeded test accounts from `backend/src/database/seeds/student.seed.ts` (e.g. `student1@tuks.co.za`, password `Password123`) rather than registering a throwaway user for every test, unless the test is specifically about registration itself.
- Prefer `data-testid` attributes on new components over matching placeholder text or button labels, placeholders and copy change, `data-testid` doesn't. Existing specs use placeholder/label matching because that's what the components had at the time, new components should add `data-testid` from the start.
- If your spec calls a real registration or other data-creating endpoint, that's expected and correct (no mocks), but be aware it creates a real row in whatever database you're pointed at. Locally this is low-stakes; in CI it's automatically wiped since the whole is ephemeral per run.

### CI

The `e2e` job in `.github/workflows/ci.yml` runs automatically on every push and PR to `main`/`devlop`. It spins up a fresh, disposable Postgres database, ruuns migrations and seeds, starts a real backend  and a real production build of the frontend, then runs the full Cypress suite against them. On failure, screenshots are uploaded as workflow artifact, check the failed run's Actions tab and download `cypress-screenshots` to see exactly what was on screen when a test failed.

## COS 301 Specific Rules

- Use **system Git via command line only** - no GitHub Desktop, GitKraken etc.