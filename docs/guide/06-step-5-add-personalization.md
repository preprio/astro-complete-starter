## Add personalization to your Astro website

_Prepr CMS enables editors to create adaptive content directly in their content items to personalize elements of web pages. This makes setting up personalization really simple and effective in increasing engagement and conversions. This chapter of the Astro complete guide shows you how to add personalization to your Astro website._

At the end of this section, you'll see a personalized home page for visitors interested in electric cars.

![Personalized home page](https://assets-site.prepr.io/50el53oh29zt//personalized-home-page-electric-lease.png)

The steps below make use of the Adaptive content in the _Homepage_ content item from the Acme Lease demo data.

![Home page content item](https://assets-site.prepr.io/3kzih4y0123a//acme-lease-homepage-adaptive-content-hero-and-feature-sections.png)

_Home page content item with Adaptive content for the Hero and Feature sections._

This chapter continues from the previous section, [_Set up data collection_](https://docs.prepr.io/connecting-a-front-end-framework/astro/astro-complete-guide/step-3-set-up-data-collection). If you haven't yet enabled Prepr tracking in your Astro project, follow the steps in this section first. Otherwise, let's get started.

## Set up personalization for the home page

You can show different personalized versions of the content to different groups (_Segments_) of visitors. To show the right variant to the right visitor:

- Every visitor is given an ID that resolves to a segment they belong to.
- In your front end, you need to send this ID along with the query to retrieve the right variant.
- This is done by setting the value for the API request header, `Prepr-Customer-Id`, when you make the API request to retrieve the content.

By [installing the Prepr Toolkit](https://docs.prepr.io/connecting-a-front-end-framework/astro/astro-complete-guide/step-3-set-up-data-collection#install-the-prepr-toolkit) in the previous section, you've already prepared your API request headers.

### Add visitors to segments

For this setup we'll make use of the _Electric Car Lovers_ segment in the Acme lease demo data. Make sure that the segment in your Prepr environment includes the condition, _Visitors who_ `did` `view` `specific items`, `Electric Lease Landing Page`.

![electric car lovers segment](https://assets-site.prepr.io/6fefsntyp7zr//electric-car-buyers-segment.png)

If you need more details, checkout the [Segments docs](https://docs.prepr.io/personalization/managing-segments).

You previously [enabled Prepr tracking](https://docs.prepr.io/connecting-a-front-end-framework/astro/astro-complete-guide/step-3-set-up-data-collection) in your website. This means a visitor gets added to the _Electric Car Lovers_ segment whenever they view the _Electric Lease Landing Page_ content item.

You can test this with the following steps:

1. Go to `http://localhost:4321/electric-lease` to open the electric lease landing page in your website.
   ![Electric Car landing page](https://assets-site.prepr.io/4fxqpaodooxg//acme-lease-electric-car-landing-page.png)
2. In your Prepr environment, go to the **Segments** page and click the **Electric Car Lovers** segment. You should see matching visitors in this segment like in the image below.
   ![Electric Car segment visitors](https://assets-site.prepr.io/6ar98qwvhmlo//electric-car-buyers-highlight-matching-visitors.png)

To make sure that visitors in the _Electric Car Lovers_ segment see the matching adaptive content when they visit the home page, you need to set the API request header, `Prepr-Customer-Id`, when you retrieve the page content. Based on this value, Prepr will check the segment that this visitor belongs to and will retrieve the matching personalized variant.

Because you [installed the Prepr Toolkit](https://docs.prepr.io/connecting-a-front-end-framework/astro/astro-complete-guide/step-3-set-up-data-collection#install-the-prepr-toolkit) previously, your API request headers are already prepared.

### Set the API request headers

Since the API request headers are already prepared, you can simply set the API request headers for your page. This is the same change you made in the [previous chapter](https://docs.prepr.io/connecting-a-front-end-framework/astro/astro-complete-guide/step-4-add-ab-testing#set-the-api-request-headers) — the same `getPreprHeaders()` call drives both A/B testing and personalization, so if you've already added it your `[...slug].astro` needs no further changes:

```
---
import Layout from '../layouts/Layout.astro';
import Hero from '../components/sections/Hero.astro';
import Feature from '../components/sections/Feature.astro';
import { prepr } from '../lib/prepr';
import { GetPageBySlugDocument } from '../gql/graphql';
import { getPreprHeaders } from '@preprio/toolkit/astro';

// The home page has no slug in the URL; in Prepr its slug is '/'.
const slug = Astro.params.slug ?? '/';
// Prepr uses these headers (visitor ID, segments, A/B variant) to pick the right variant.
const data = await prepr(GetPageBySlugDocument, { slug }, getPreprHeaders(Astro.request.headers));

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

### Test your adaptive content

Now that people who visit the Electric lease landing page are being grouped into the _Electric Car Lovers_ segment, you can test the adaptive content. To test the adaptive content for the _Electric Car Lovers_ segment follow the steps below.

1. Go to the _Electric Lease Landing Page_ in your website. For example: `http://localhost:4321/electric-lease`.
2. Wait a few seconds and go back to the home page. You can now see the personalized home page like in the image below.

![Personalized home page](https://assets-site.prepr.io/50el53oh29zt//personalized-home-page-electric-lease.png)

To see the non-personalized page, you can reset the cookies and refresh the page as follows:

1. Right-click the page to **Inspect the page**, click the **Application** tab. Under the cookies, click your localhost. You'll notice the `__prepr_uid` cookie in the list.
2. Right-click the localhost entry to **Clear** the cookies and refresh the page. You should now see the non-personalized content in the home page.

![clear cookies](https://assets-site.prepr.io/3naav2tjzw12//clear-cookies-for-personalization.png)

### Add HTML attributes to track impressions and conversion events

Your personalization is running successfully, however there are no metrics being recorded yet. You can see this with the **Awaiting data** message at the top of the Adaptive content block in the _Homepage_ content item.

![Home page content item](https://assets-site.prepr.io/2b1r1jpzwdl1//acme-lease-homepage-adaptive-content-awaiting-data.png)

To get Prepr to start showing some metrics data, you need to add HTML attributes to elements in your adaptive content. When you add these attributes, the tracking pixel you added in the previous section automatically tracks impressions and your chosen conversion events.

1. To start collecting impressions and clicks, add the HTML attributes `data-prepr-variant-key` and `data-prepr-variant-event` to the _Hero_ section as shown in the highlighted code below. This is the same change from the [A/B testing chapter](https://docs.prepr.io/connecting-a-front-end-framework/astro/astro-complete-guide/step-4-add-ab-testing#add-html-attributes-to-track-impressions-and-conversion-events) — the attributes drive both A/B testing and adaptive content metrics. The impression is recorded when the _Hero_ element scrolls into view. The click is recorded when the _Button_ element is clicked.
   ```
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

   <!-- data-prepr-variant-key on the section records an impression for the variant -->
   <section class="bg-primary-50" data-prepr-variant-key={item._context?.variant_key}>
     <div class="mx-auto max-w-8xl p-spacing flex flex-col items-center md:flex-row gap-8 py-10 lg:py-20">
       <div class="basis-6/12">
         <h1 class="text-mb-5xl lg:text-7xl text-secondary-700 font-medium break-words text-balance">{item.heading}</h1>
         <p class="text-mb-lg text-secondary-500 lg:text-lg mt-4 lg:mt-6 text-balance">{item.sub_heading}</p>
         <div class="flex gap-4 mt-8 xl:mt-10">
           <div>
             <!-- data-prepr-variant-event on the link records a click (conversion) -->
             <a href="#" data-prepr-variant-event><Button>Find your car</Button></a>
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

If you want to track a conversion other than a click event, e.g. a quote request, then set your `data-prepr-variant-event` to the custom event. For example: `data-prepr-variant-event="QuoteRequest"`. Check out the [Personalization doc for more details](https://docs.prepr.io/personalization/setting-up-personalization#track-impressions-and-conversions).

2. To start recording metrics, go to the home page in your website, click the **Find your car** button.
3. Now when you view the adaptive content in your _Homepage_ content item, you can click the **Metrics** link and see the number of impressions and clicks like in the image below.

![Adaptive content metrics](https://assets-site.prepr.io/6j0q5cpmiu7e//home-page-adaptive-content-metrics-example.png)

Congratulations! You have successfully set up personalization with metrics in your Astro website. Now, you can [install the preview toolbar](https://docs.prepr.io/connecting-a-front-end-framework/astro/astro-complete-guide/step-6-install-the-preview-toolbar) to your website.
