# Security Policy

## Reporting a vulnerability

If you discover a security vulnerability in this example, please **do not open a
public issue**. Instead, report it privately so it can be addressed before
disclosure.

- Use GitHub's [private vulnerability reporting](https://github.com/JustaName-id/wallet-connect-example/security/advisories/new), or
- Email **security@justaname.id** with the details.

Please include:

- A description of the issue and its potential impact
- Steps to reproduce or a proof of concept
- Any relevant logs, versions, or configuration

We aim to acknowledge reports within a few business days and will keep you
updated on remediation progress.

## Scope

This repository is a **reference example**, not a production application. Note
that:

- `NEXT_PUBLIC_*` keys (`NEXT_PUBLIC_JAW_API_KEY`,
  `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`) are **publishable client keys** by
  design — they ship to the browser and are not secrets.
- Never commit real server secrets to this repo. `.env.local` is gitignored;
  `.env.local.example` is the committed template.

For vulnerabilities in the underlying packages (`@jaw.id/wagmi`, `wagmi`,
`viem`, `next`), please report them to their respective maintainers.
