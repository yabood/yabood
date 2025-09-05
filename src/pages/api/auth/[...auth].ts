import type { APIRoute } from 'astro';
import { handleAuth } from '../../../auth.config';

export const prerender = false;

export const ALL: APIRoute = async ({ request }) => {
  return handleAuth(request);
};
