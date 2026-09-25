import { defineMiddleware } from 'astro:middleware';
import { PREPR_ENV } from 'astro:env/server';
import { onPreprRequest } from '@preprio/toolkit/astro';

export const onRequest = defineMiddleware((context, next) =>
  // In preview, the toolbar can override the visitor's segment and A/B variant.
  onPreprRequest(context, next, { preview: PREPR_ENV === 'preview' }),
);
