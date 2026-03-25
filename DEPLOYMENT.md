# Deployment

This repository deploys to GitHub Pages via GitHub Actions. The authoritative public URL is `https://menaje.github.io/profile/`.

## Origin contract

- Public origin host: `https://menaje.github.io`
- Base path: `/profile/`
- Final production URL: `https://menaje.github.io/profile/`
- Env precedence: `SITE_URL` -> `PUBLIC_SITE_URL` -> fallback `https://menaje.github.io`
- Custom domain migration rule: change `SITE_URL` and `astro.config.mjs` `base` together

## One-time GitHub setup

1. Rename the GitHub repository to `profile` if it is still using the old `coni-example` name.
2. Ensure the repository is public.
3. In `Settings > Pages`, set the build source to `GitHub Actions`.
4. Keep the default branch as `main`.

No repository secret is required for the default Pages deployment flow.

## Workflow behavior

- Pull request to `main`: GitHub Actions runs `npm ci` -> `npm run site:check` -> `npm run site:build`.
- Push to `main`: the same workflow uploads `dist/` as a GitHub Pages artifact and deploys it with `actions/deploy-pages`.
- `workflow_dispatch`: manual rebuild + redeploy through the same pipeline.

GitHub Pages does not provide Vercel-style PR preview URLs for this project-page setup.

## Environment variables

Use `project/.env.example` as the source of truth for local setup.

- `SITE_URL`: server-side authoritative origin override
- `PUBLIC_SITE_URL`: client-readable fallback when `SITE_URL` is not set
- `PUBLIC_FORMSPREE_ID`: contact form integration id

The base path is not environment-driven in this workplan. It stays fixed at `/profile/`.

## Local verification

```bash
npm run site:check
npm run site:build
```

## Smoke checklist

- The `Site Build` workflow is green on `main`
- The `github-pages` environment shows the latest successful deployment
- `https://menaje.github.io/profile/` returns `200`
- `https://menaje.github.io/profile/robots.txt` resolves and references the same sitemap origin
- `https://menaje.github.io/profile/sitemap.xml` resolves
- `https://menaje.github.io/profile/rss.xml` resolves
