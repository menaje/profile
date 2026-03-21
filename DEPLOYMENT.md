# Deployment

This repository uses Vercel Git integration for production and preview deployments, and GitHub Actions for build verification.

## Current status

As of 2026-03-21, the repository has no existing GitHub Actions workflows on GitHub and `https://coni-example.vercel.app` returns `DEPLOYMENT_NOT_FOUND`. The first Vercel import still needs to be completed in the Vercel dashboard before preview and production deployments can be observed.

## One-time Vercel setup

1. Import `menaje/coni-example` into Vercel from GitHub.
2. Use the repository root as the project root.
3. Confirm these project settings:
   - Install Command: `npm ci`
   - Build Command: `npm run site:build`
   - Output Directory: `dist`
4. Set the Production Branch to `main`.
5. Keep Preview Deployments enabled so pull requests receive preview URLs automatically.

No GitHub repository secrets or variables are required for deployment when Vercel Git integration is used.

## Expected flow

- Pull request to `main`: GitHub Actions runs the `Site Build` workflow (`npm run site:check` + `npm run site:build`).
- Pull request to `main`: Vercel creates a preview deployment and adds the preview URL to the pull request.
- Push to `main`: Vercel creates the production deployment automatically.

## Local verification

```bash
npm run site:check
npm run site:build
```

## Handoff checklist

- Vercel project is connected to `menaje/coni-example`
- Production branch is `main`
- A pull request to `main` shows both the `Site Build` check and a Vercel preview deployment
- A merge or direct push to `main` triggers a production deployment
