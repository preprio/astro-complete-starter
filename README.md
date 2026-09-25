# Astro Complete Starter

Check out the [Complete guide to Astro and Prepr](https://docs.prepr.io/connecting-a-front-end-framework/astro/astro-complete-guide) to learn more.

> The guide URL above is to be confirmed.

## Setup

Make sure to install the dependencies:

```bash
# yarn
yarn install

# npm
npm install

# pnpm
pnpm install --shamefully-hoist
```

## Add the environment file

Copy the .env.example file in this directory to .env (which will be ignored by Git) by running the following command:

```bash
cp .env.example .env
```

## Update the environment file

In the `.env` file, replace `<YOUR_PREPR_GRAPHQL_URL>` with the *API URL* of the Prepr *GraphQL Preview* access token from your Acme Lease Demo environment.

![preview API URL](https://assets-site.prepr.io//35k5a4g45wuy-preview-access-token.png)

`npm run codegen` (also run automatically as part of `npm run build`) regenerates the GraphQL types in `src/gql/` from this schema, reading `PREPR_GRAPHQL_URL` from `.env`.

Set `PREPR_ENV=preview` to show the Prepr preview toolbar (and let query params override segments/variants); set it to `production` to hide the toolbar and lock the page down to production content. In a deployed environment, set both variables at runtime on the host rather than baking them into the build — they're read as [Astro server secrets](https://docs.astro.build/en/guides/environment-variables/#type-safe-environment-variables) (`astro:env/server`), not inlined at build time.

> `typescript` is pinned to `^6` because `@astrojs/check` doesn't yet support TypeScript 7 — bumping it without also bumping `@astrojs/check` will break the build.

## Development Server

Start the development server on http://localhost:4321

```bash
npm run dev
```

## Production

Build the application for production:

```bash
npm run build
```

Start the production build:

```bash
npm run start
```

This runs `node ./dist/server/entry.mjs`, which serves the app using the `@astrojs/node` adapter in standalone mode.

Check out the [deployment documentation](https://docs.astro.build/en/guides/deploy/) for more information.

Deploying to Vercel/Netlify? Swap `@astrojs/node` for that host's adapter.
