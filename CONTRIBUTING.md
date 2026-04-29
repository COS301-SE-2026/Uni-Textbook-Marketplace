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
- Delete your branch after it is merged

## Commit Message Convention

We use **Conventional Commits**:

```
type: short description (max 72 chars)
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
4. Fill in the PR description — what did you change and why?
5. Request a review from at least one team member
6. Fix any review comments
7. Merge once approved — **squash and merge** preferred

## Code Quality

- All PRs must pass the CI pipeline before merging
- Test coverage must be at least **80%**
- No linting errors allowed on merge
- Never commit `.env` files or secrets

## COS 301 Specific Rules

- Use **system Git via command line only** — no GitHub Desktop, GitKraken etc.
- The **COS301 VibeCheck tool must be active** when committing code (*It still hasn't been setup*)
- You must understand and be able to explain every line you commit
- Commits heavily concentrated in the final week before a demo will be flagged