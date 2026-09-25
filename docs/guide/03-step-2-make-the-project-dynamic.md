## Make your Astro project dynamic

_This guide shows you how to connect an existing Astro project to Prepr to retrieve and show Acme Lease demo content._

## Connect your Astro website to Prepr

The steps below continue from the previous section, [Set up an Astro project](https://docs.prepr.io/connecting-a-front-end-framework/astro/astro-complete-guide/step-1-set-up-an-astro-project). If you don't yet have an Astro website with static pages, follow the steps in this section first. Otherwise, let's get started.

### Connect to Prepr

Astro has no dedicated GraphQL client integration, so instead of installing one, you'll add a small typed `fetch` helper that sends GraphQL queries to the Prepr API.

1. Stop the localhost website server (`CTRL-C`) if it's running and execute the following command in the terminal to install the packages the helper needs:
   ```
   npm add @graphql-typed-document-node/core graphql
   ```
2. Create a `lib` folder in the `src` directory. Then create a file called `prepr.ts` in this folder. Copy the following code to this file to set up the fetch helper:
   ```
   import { PREPR_GRAPHQL_URL } from 'astro:env/server';
   import { print } from 'graphql';
   import type { TypedDocumentNode } from '@graphql-typed-document-node/core';

   export async function prepr<TResult, TVariables>(
     document: TypedDocumentNode<TResult, TVariables>,
     variables: TVariables,
     headers: Record<string, string> = {},
   ): Promise<TResult> {
     const response = await fetch(PREPR_GRAPHQL_URL, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json', ...headers },
       body: JSON.stringify({ query: print(document), variables }),
     });
     if (!response.ok) {
       throw new Error(`Prepr GraphQL request failed: ${response.status} ${response.statusText}`);
     }
     const { data, errors } = await response.json();
     if (errors?.length) throw new Error(errors[0].message);
     return data;
   }
   ```
   `PREPR_GRAPHQL_URL` is read through Astro's typed environment variables (`astro:env/server`), which you'll declare in the next step. Unlike a value inlined at build time, this is read at request time and is fully typed. The `response.ok` check turns an HTTP-level failure (for example a wrong URL or a server error) into a readable error instead of a cryptic JSON parse error from calling `response.json()` on a non-JSON response body.
3. We recommend using environment variables to store sensitive information like access tokens. To add environment variables, create a `.env` file in the root directory of your project and add the access token like this:
   ```
   PREPR_GRAPHQL_URL=<YOUR-PREPR-GRAPHQL-URL>
   ```
4. Replace the placeholder value `<YOUR-PREPR-GRAPHQL-URL>` with the _API URL_ of an access token from Prepr. Get an access token by logging into your Prepr account:
   a. Click the icon and choose the **Access tokens** option to view all the access tokens.
   b. Click to open the _GraphQL Production_ access token, and copy the _API URL_ to only retrieve published content items on your site for now. c. Paste the copied _API URL_ in your `.env` file.

Use the _GraphQL Production_ access token to request published content items for your live app and use the _GraphQL Preview_ token to make a [preview of unpublished content items](https://docs.prepr.io/project-setup/setting-up-previews-and-visual-editing) for your content editors.

![GraphQL production access token example](https://assets-site.prepr.io/nl31q4rdm7c//graphql-api-token-example.png)

5. Declare the `PREPR_GRAPHQL_URL` variable in your `astro.config.mjs` so Astro validates and types it:
   ```
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
       },
     },
   });
   ```
   The `image.domains` entry is added now because you'll fetch page images from Prepr's demo asset domain later in this chapter — add the highlighted `image` and `env` blocks to your existing config.
6. Execute the following command to restart the server and refresh your page in the browser.
   ```
   npm run dev
   ```

If your website runs without errors, then the setup above was done correctly. Now that Astro can reach the Prepr API, you can retrieve content from Prepr. Before we create a query to retrieve content, let's follow some best practices for TypeScript and install a GraphQL code generator.

### Install a code generator

In this step, you'll install a GraphQL code generator to generate TypeScript types automatically for your queries and keep these up to date with any schema changes. Check out the [TypeScript best practices doc](https://docs.prepr.io/development/best-practices/typescript#install-a-graphql-code-generator) for more details. In the meantime, follow the steps below to install the GraphQL code generator.

1. Stop the localhost website server (`CTRL-C`) if it's running and execute the following commands in your terminal:
   ```
   npm add -D @graphql-codegen/cli @graphql-codegen/client-preset @graphql-codegen/introspection
   npm add dotenv
   npm add -D @astrojs/check typescript
   ```
   The `build` script you'll add in a moment runs `astro check`, which needs `@astrojs/check` and `typescript` installed — without them, the first `npm run build` stops with an interactive prompt asking to install these itself.
2. Once done, create a new file, `codegen.ts` in the root of your project. Update it with the code below.
   ```
   import 'dotenv/config';
   import type { CodegenConfig } from '@graphql-codegen/cli';

   const config: CodegenConfig = {
     overwrite: true,
     schema: process.env.PREPR_GRAPHQL_URL,
     documents: ['src/queries/**/*.graphql'],
     generates: {
       'src/gql/': {
         preset: 'client',
         presetConfig: { fragmentMasking: false },
         // Astro's strict tsconfig enables verbatimModuleSyntax.
         config: { useTypeImports: true },
       },
       './graphql.schema.json': { plugins: ['introspection'] },
     },
   };

   export default config;
   ```
   The highlighted `useTypeImports` option is not part of the plain Next.js codegen config: Astro's strict `tsconfig.json` turns on `verbatimModuleSyntax`, which requires type-only imports to use the `import type` form. Without this option, the generated `gql/graphql.ts` file fails to compile.
3. To complete the codegen installation, update the `scripts` block in your `package.json` so `build` runs codegen and a type check before `astro build`, and add a `codegen` script. Leave the rest of your `package.json` (name, version, dependencies) as-is — only the `scripts` block changes:
   ```
   {
     "scripts": {
       "dev": "astro dev",
       "build": "npm run codegen && astro check && astro build",
       "start": "node --env-file-if-exists=.env ./dist/server/entry.mjs",
       "preview": "astro preview",
       "astro": "astro",
       "codegen": "graphql-codegen --config codegen.ts"
     }
   }
   ```
   The built server (unlike `astro dev`) doesn't load `.env` on its own — `--env-file-if-exists=.env` tells Node to load it, so `PREPR_GRAPHQL_URL` and other secrets are available when you run `npm start` after `npm run build`. Host-provided environment variables (e.g. in a deployment platform) still take precedence over `.env`.
4. Execute the following command to restart the server and refresh your page in the browser to make sure the fetch helper is set up correctly:
   ```
   npm run dev
   ```

If your website runs without errors, then the setup above was done correctly. Now you can add a query to your project.

### Add a GraphQL query

Once the GraphQL code generator is installed, you can add a query to get the content for your home page from Prepr.

If you're using preloaded demo data in your Prepr environment as mentioned in the [Prerequisites](https://docs.prepr.io/connecting-a-front-end-framework/astro/astro-complete-guide/introduction#prerequisites), you should have a _Homepage_ content item like in the images below. The _Homepage_ has all the elements of the page in a [_Stack_ field](https://docs.prepr.io/content-modeling/field-types#stack-field). The stack makes it easy for an editor to set up their page content in a flexible structure for the front end.

![Home page content item - stack field](https://assets-site.prepr.io/6i5lo1ckx8vj//acme-lease-homepage-stack-field.png)

You can see that the hero and feature sections are in adaptive content blocks. We'll explain that in more detail in the upcoming personalization chapter.

Follow the steps below to add a query to retrieve the id, title, slug, and a stack containing the hero and feature sections with their own fields:

1. Create a `queries` folder in the `src` directory of your project and create a file named `get-page-by-slug.graphql`.
2. Add the following queries in the `queries` folder to retrieve a page by its slug:

You'll notice that we've created separate fragment queries for the button, hero and feature UI components in a `fragments` folder. Fragments in GraphQL are a way to define a set of fields that can be reused.

```
query GetPageBySlug($slug: String) {
    Page(slug: $slug) {
        title
        _id
        content {
            __typename
            ... on Hero {
                ...Hero
            }
            ... on Feature {
                ...Feature
            }
        }
    }
}
```

Create the fragments in `src/queries/fragments/`:

**`button.fragment.graphql`**

```
fragment Button on Button {
    button_type
    text
    external_url
    link {
        ... on Category {
            _slug
        }
        ... on Page {
            _slug
        }
        ... on Post {
            _slug
        }
    }
}
```

**`hero.fragment.graphql`**

```
fragment Hero on Hero {
    _id
    sub_heading
    image {
        url(preset: "Hero", width: 2000)
        height
        width
    }
    _context {
        variant_key
    }
    heading
    buttons {
        ...Button
    }
}
```

**`feature.fragment.graphql`**

```
fragment Feature on Feature {
    _id
    heading
    sub_heading
    button {
        ...Button
    }
    _context {
        variant_key
    }
    image_position
    image {
        url(width: 870, height: 570)
    }
}
```

You can create and [test GraphQL queries](https://docs.prepr.io/graphql-api/test-queries) using the [Apollo explorer](https://studio.apollographql.com/sandbox/explorer) from Prepr. Open the **API Explorer** from the _Homepage_ content item or from your access token page.

### Generate TypeScript types

1. Now that the query is created, generate the TypeScript types by running the following command in the terminal:
   ```
   npm run codegen
   ```
2. If the command is successful you'll see new files in the `src/gql` folder, including `graphql.ts`. Check out the [TypeScript doc](https://docs.prepr.io/development/best-practices/typescript#generate-typescript-types) for more details.
3. Test the query by updating the `[...slug].astro` file. The code below executes the query and returns early with a 404 rewrite if the page doesn't exist.
   ```
   ---
   import Layout from '../layouts/Layout.astro';
   import Hero from '../components/sections/Hero.astro';
   import Feature from '../components/sections/Feature.astro';
   import { prepr } from '../lib/prepr';
   import { GetPageBySlugDocument } from '../gql/graphql';

   // The home page has no slug in the URL; in Prepr its slug is '/'.
   const slug = Astro.params.slug ?? '/';
   const data = await prepr(GetPageBySlugDocument, { slug });

   if (!data.Page) return Astro.rewrite('/404');
   const page = data.Page;
   ---

   <Layout>
     <Hero />
     <Feature />
     <Feature align="right" />
     <Feature />
   </Layout>
   ```
   Unlike a Next.js optional catch-all route, `Astro.params.slug` is already a joined string (not an array) — there's no `Array.join('/')` step. On the root path it's `undefined`, which the `?? '/'` fallback turns into Prepr's home page slug.

You need a page to rewrite to when the slug isn't found. Create `src/pages/404.astro`:

```astro
---
import Layout from '../layouts/Layout.astro';

Astro.response.status = 404;
---

<Layout>
  <div class="mx-auto max-w-8xl p-spacing py-20 text-center text-secondary-700">
    <h1 class="text-5xl font-medium">404</h1>
    <p class="mt-4">This page could not be found.</p>
  </div>
</Layout>
```

`Astro.rewrite('/404')` renders this page in place, without a client-side redirect, mirroring Next.js's `notFound()`.

**Troubleshooting**
**Compilation error**: In `[...slug].astro` for the line `import { GetPageBySlugDocument } from '../gql/graphql'`: `Module '"../gql/graphql"' has no exported member 'GetPageBySlugDocument'`.
**Cause**: The query name was not defined or is different than expected.
**Solution**: Check that the [query you created](#add-a-graphql-query) has a query name. In our example the query name is defined as `query GetPageBySlug(...){...}`. After updating the query, [regenerate the TypeScript types](#generate-typescript-types).

### Fetch page content

To view the Prepr content in your website, you need to fetch the page elements. As mentioned previously, the page has elements in a _Stack_ field. You'll fetch two components, a _Hero_ section and _Feature_ sections in the stack.

1. Next, update your components to display data dynamically.

**Hero section** (`src/components/sections/Hero.astro`)

```astro
---
import { Image } from 'astro:assets';
import type { HeroFragment } from '../../gql/graphql';
import Button from '../Button.astro';

interface Props {
  item: HeroFragment;
}

const { item } = Astro.props;
const image = item.image;
---

<section class="bg-primary-50">
  <div class="mx-auto max-w-8xl p-spacing flex flex-col items-center md:flex-row gap-8 py-10 lg:py-20">
    <div class="basis-6/12">
      <h1 class="text-mb-5xl lg:text-7xl text-secondary-700 font-medium break-words text-balance">{item.heading}</h1>
      <p class="text-mb-lg text-secondary-500 lg:text-lg mt-4 lg:mt-6 text-balance">{item.sub_heading}</p>
      <div class="flex gap-4 mt-8 xl:mt-10">
        <div>
          <a href="#"><Button>Find your car</Button></a>
        </div>
      </div>
    </div>
    <div class="basis-6/12 relative flex justify-end items-center">
      <div class="z-10 flex items-center aspect-[20/17] w-9/12 overflow-hidden justify-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        {image?.url && <Image src={image.url} alt="Hero Image" width={720} height={360} class="object-cover rounded-2xl" />}
      </div>
      <div class="w-9/12 aspect-[20/17] bg-primary-100 rounded-3xl right-0 top-0 z-0"></div>
    </div>
  </div>
</section>
```

`<Image>` from `astro:assets` is the Astro equivalent of `next/image`; the `image.domains` entry you added to `astro.config.mjs` earlier is what allows it to optimize images from the demo asset domain. `<Image>` needs the `sharp` package to process images — your package manager installs it automatically as a dependency of `astro`, so no separate install command is needed.

**Feature section** (`src/components/sections/Feature.astro`)

```astro
---
import { Image } from 'astro:assets';
import type { FeatureFragment } from '../../gql/graphql';
import Button from '../Button.astro';

interface Props {
  item: FeatureFragment;
}

const { item } = Astro.props;
---

<section class="bg-primary-50">
  <div class="mx-auto max-w-8xl p-spacing py-10 lg:py-10 xl:py-20">
    <div class="flex flex-col items-start md:items-center md:flex-row gap-8 xl:gap-28 text-secondary-700">
      {item.image_position === 'LEFT' && item.image?.url && (
        <div class="order-first md:order-none basis-1/2">
          <Image src={item.image.url} alt="Feature image" width={800} height={300} class="rounded-2xl w-full aspect-[29/19] object-cover" />
        </div>
      )}
      <div class="basis-1/2">
        <h2 class="text-mb-4xl lg:text-5xl font-medium text-secondary-700 text-balance">{item.heading}</h2>
        <p class="text-lg mt-4 xl:mt-6 font-medium text-balance">{item.sub_heading}</p>
        <a href="#"><Button>{item.button?.text}</Button></a>
      </div>
      {item.image_position === 'RIGHT' && item.image?.url && (
        <div class="order-first md:order-none basis-1/2">
          <Image src={item.image.url} alt="Feature image" width={800} height={300} class="rounded-2xl w-full aspect-[29/19] object-cover" />
        </div>
      )}
    </div>
  </div>
</section>
```

2. Now update `[...slug].astro` to fetch and render the elements from the stack:

```astro
---
import Layout from '../layouts/Layout.astro';
import Hero from '../components/sections/Hero.astro';
import Feature from '../components/sections/Feature.astro';
import { prepr } from '../lib/prepr';
import { GetPageBySlugDocument } from '../gql/graphql';

// The home page has no slug in the URL; in Prepr its slug is '/'.
const slug = Astro.params.slug ?? '/';
const data = await prepr(GetPageBySlugDocument, { slug });

if (!data.Page) return Astro.rewrite('/404');
const page = data.Page;
---

<Layout>
  {page.content.map((element) => {
    if (element.__typename === 'Hero') return <Hero item={element} />;
    if (element.__typename === 'Feature') return <Feature item={element} />;
  })}
</Layout>
```

In later chapters, this guide shows you how to implement Personalization and A/B testing which are dynamic features in Prepr. These features work best with [SSR (Server-side rendering)](https://docs.prepr.io/development/best-practices/csr-ssr-ssg#server-side-rendering-ssr). The `output: 'server'` setting in `astro.config.mjs` renders every request on the server, so there's no build-time cache to disable — Astro's SSR mode always fetches fresh data per request, unlike Next.js where you also need to turn off Apollo's result cache.

Check out the [caching strategies doc](https://docs.prepr.io/connecting-a-front-end-framework/nextjs/caching-strategies) for more details on the underlying rendering strategies (the Next.js example there maps directly onto Astro's `output: 'server'`).

Now when you view the website on your localhost, you'll see something like the image below:

![Dynamic home page](https://assets-site.prepr.io/p6rja5r1cj8//dynamic-website-with-prepr-content.png)

**Troubleshooting**
**Compilation error**: `Property 'url' does not exist on type ...` or a similar type error on `image.url` in `Hero.astro` or `Feature.astro`.
**Cause**: The `codegen.ts` does not have the client preset configured, or the query fragments changed and the types are stale.
**Solution**: [Check the `codegen.ts`](#install-a-code-generator) uses the `client` preset with `fragmentMasking: false`, and [regenerate the TypeScript types](#generate-typescript-types).

**Troubleshooting**
**Runtime error**: `500` response with `Error: <error message from Prepr>` in the terminal.
**Cause**: The `PREPR_GRAPHQL_URL` value is missing or incorrect, so the GraphQL API returns an error.
**Solution**: Check the [Connect to Prepr](#connect-to-prepr) section and confirm the _API URL_ in your `.env` file matches an access token in your Prepr environment.

Congratulations! You have successfully connected your front end to Prepr to make your website dynamic. Continue your journey to the next section to [set up data collection](https://docs.prepr.io/connecting-a-front-end-framework/astro/astro-complete-guide/step-3-set-up-data-collection).
