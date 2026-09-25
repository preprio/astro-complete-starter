## Set up data collection with tracking and the Prepr Toolkit

_Prepr is a CMS that includes built-in A/B testing and personalization features. These capabilities require visitor data to measure your test results and to build segments for personalization. This chapter of the Astro complete guide shows you how to enable tracking to collect this data in your Astro front end and how to simplify this data collection with the Prepr Toolkit._

The steps below continue from the previous section, [Make your Astro project dynamic](https://docs.prepr.io/connecting-a-front-end-framework/astro/astro-complete-guide/step-2-make-the-project-dynamic). If you don't yet have an Astro project connected to Prepr, follow the previous steps listed in the [Complete guide overview](https://docs.prepr.io/connecting-a-front-end-framework/astro/astro-complete-guide) to create one. Otherwise, let's get started.

## Install the Prepr Toolkit

We developed the [Prepr Toolkit](https://github.com/preprio/prepr-toolkit) to simplify working with event data for A/B testing and personalization.

In the steps below, you'll enable tracking in your website by adding the _Prepr Tracking Code_ to your front end. This code generates the `__prepr_uid` cookie for each website visitor. This visitor gets stored in Prepr with this unique ID, if they don't already exist.

This means you can use this `__prepr_uid` cookie value to set the API request header, `Prepr-Customer-Id`, when you retrieve the page content for A/B testing and personalization. The _Prepr Toolkit_ prepares the `Prepr-Customer-Id` API request header for you, using the `__prepr_uid` cookie value.

Based on this value, Prepr retrieves the right content as follows:

- A/B testing: Prepr decides which variant, A or B, to return in the content.
- Personalization: Prepr checks the segment that this visitor belongs to and retrieves the matching personalized variant.

To install the _Prepr Toolkit_, follow the steps below.

1. In your Astro project, stop the localhost website server (`CTRL-C`) if it's running and install the package with the following terminal command:
   ```
   npm install @preprio/toolkit
   ```

Once done, you need to call a function in the package to prepare the API request headers before the page gets rendered in your website.

2. To do this, go to your project and create a new file `src/middleware.ts`. Then add the following code to perform the package's preprocessing logic on user requests.
   ```
   import { defineMiddleware } from 'astro:middleware';
   import { onPreprRequest } from '@preprio/toolkit/astro';

   export const onRequest = defineMiddleware((context, next) =>
     onPreprRequest(context, next, { preview: false }),
   );
   ```
   Astro's middleware convention (`src/middleware.ts` exporting `onRequest`) replaces the `proxy.ts` file from the Next.js version of this guide; `onPreprRequest` is the Astro equivalent of `createPreprMiddleware`.

## Enable Prepr tracking and collect view events

### Enable Prepr tracking

When you enable Prepr tracking in your front end, it captures visitor data and lets you track how they engage with your content.

Follow the steps below to enable Prepr tracking:

1. Go to `src/layouts/Layout.astro` and add the highlighted lines below to render the tracking pixel in the page `<head>`.
   ```
   ---
   import { Font } from 'astro:assets';
   import NavBar from '../components/NavBar.astro';
   import PreprTrackingPixel from '@preprio/toolkit/astro/components/PreprTrackingPixel';
   import { extractAccessToken } from '@preprio/toolkit';
   import { PREPR_GRAPHQL_URL } from 'astro:env/server';
   import '../styles/globals.css';

   const accessToken = extractAccessToken(PREPR_GRAPHQL_URL);
   ---

   <!doctype html>
   <html lang="en">
     <head>
       <meta charset="utf-8" />
       <meta name="viewport" content="width=device-width" />
       <link rel="icon" href="/favicon.ico" />
       <title>Prepr Astro complete starter</title>
       <meta name="description" content="Showing the power of personalization and A/B testing" />
       <Font cssVariable="--font-ubuntu" preload />
       {accessToken && <PreprTrackingPixel id={accessToken} />}
       <slot name="head" />
     </head>
     <body style="font-family: var(--font-ubuntu)">
       <NavBar />
       <slot />
     </body>
   </html>
   ```
   To see the tracking pixel value, in your Prepr environment, click the icon and choose the **Event management** option. Click the **Get tracking code** link to view the _Prepr Tracking Code_.
   ![event tracking page](https://assets-site.prepr.io/2ovyjc1jscr8//updated-event-tracking-screenshot.png)
2. Refresh your website page in the browser. If there are no errors in the terminal console, Prepr tracking is set up successfully.

### Track page view events

For the subsequent A/B testing and personalization sections in this guide, we want to track page view events. To do this, add a `<meta>` tag with the content item ID to the `[...slug].astro` file like in the highlighted code below. The tracking pixel automatically recognizes this property and records the view event in Prepr. Check out the [data collection events docs](https://docs.prepr.io/data-collection/recording-events) for more details.

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
  <meta slot="head" property="prepr:id" content={page._id} />
  {page.content.map((element) => {
    if (element.__typename === 'Hero') return <Hero item={element} />;
    if (element.__typename === 'Feature') return <Feature item={element} />;
  })}
</Layout>
```

The `slot="head"` attribute sends this `<meta>` tag to the `<slot name="head" />` you added to `Layout.astro` in the previous step, so it renders in the page `<head>` next to the tracking pixel — Astro has no single implicit `<head>` merge like the Next.js `app` router, so the target slot has to be named explicitly.

For more details on how to track other types of events, check out the [data collection docs](https://docs.prepr.io/data-collection/recording-events).

### Test data collection

You can easily check if the data collection is successful with the following steps.

1. Go to your website in the browser and refresh the page.
2. In your Prepr environment, go to the **Segments** page.
3. If the page view is recorded successfully you'll see a recent visitor in the **All visitors** list.
4. Click to open this visitor and you should see the _View_ event on the _Homepage_ similar to the image below.
   ![page view event](https://assets-site.prepr.io/3im9gynz7ubp//page-view-events.png)

Congratulations! You've successfully enabled Prepr tracking in your Astro front end, started collecting page view events, and installed the Prepr Toolkit for A/B testing and personalization. Now, you're ready to [add A/B testing](https://docs.prepr.io/connecting-a-front-end-framework/astro/astro-complete-guide/step-4-add-ab-testing) and [personalization](https://docs.prepr.io/connecting-a-front-end-framework/astro/astro-complete-guide/step-5-add-personalization) to your website.
