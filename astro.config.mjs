// @ts-check
import { defineConfig, envField, fontProviders } from 'astro/config';
import node from '@astrojs/node';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // Render every request on the server: personalization and A/B testing
  // depend on per-visitor request headers.
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Ubuntu',
      cssVariable: '--font-ubuntu',
      weights: [400, 700],
      subsets: ['latin'],
    },
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  image: {
    // Domain of the Acme Lease demo images. Add your own asset domain here.
    domains: ['demo-patterns.stream.prepr.io'],
  },
  env: {
    schema: {
      PREPR_GRAPHQL_URL: envField.string({ context: 'server', access: 'secret' }),
      PREPR_ENV: envField.enum({
        context: 'server',
        access: 'secret',
        values: ['preview', 'production'],
        default: 'production',
      }),
    },
  },
});
