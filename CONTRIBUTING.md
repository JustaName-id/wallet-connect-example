# Contributing

Thanks for your interest in improving this example! It's a small reference app,
so contributions that keep it minimal, correct, and easy to read are the most
welcome.

## Getting started

```bash
pnpm install
cp .env.local.example .env.local   # add your JAW API key from https://jaw.id
pnpm dev
```

See the [README](./README.md) for environment variables and architecture.

## Before you open a PR

Run the full check suite locally:

```bash
pnpm lint        # ESLint
pnpm build       # type-check + production build
pnpm test        # Vitest component tests
pnpm test:e2e    # Playwright (run `pnpm exec playwright install chromium` once)
```

All of the above should pass. If you change behavior, add or update the
relevant test.

## Guidelines

- **Keep it minimal.** This is a teaching example — prefer clarity over cleverness.
- **Server Components by default.** Only reach for `"use client"` when needed.
- **No new dependencies** unless they're essential to the example.
- **Conventional Commits** for commit messages (e.g. `feat:`, `fix:`, `docs:`).
- **One logical change per PR.** Smaller PRs get reviewed faster.

## Reporting bugs

Open an issue with a clear description, steps to reproduce, and your environment
(Node version, browser, wallet). For security issues, see [SECURITY.md](./SECURITY.md)
instead of filing a public issue.
