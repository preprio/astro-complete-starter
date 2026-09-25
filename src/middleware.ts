import { defineMiddleware } from 'astro:middleware';
import { onPreprRequest } from '@preprio/toolkit/astro';

export const onRequest = defineMiddleware((context, next) =>
  onPreprRequest(context, next, { preview: false }),
);
