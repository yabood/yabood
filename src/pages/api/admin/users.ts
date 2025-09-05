import type { APIRoute } from 'astro';
import { getUserFromToken, requireAdmin } from '../../../utils/auth.js';

export const GET: APIRoute = async ({ request }) => {
  try {
    const authorization = request.headers.get('authorization');

    if (!authorization || !authorization.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Missing or invalid authorization header' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const token = authorization.substring(7);
    const user = getUserFromToken(token);

    // This will throw an error if user is not admin
    requireAdmin(user);

    // Mock user data - replace with actual database query
    const users = [
      { id: '1', email: 'user@example.com', role: 'user', name: 'Regular User' },
      { id: '2', email: 'admin@yabood.com', role: 'admin', name: 'Admin User' },
    ];

    return new Response(
      JSON.stringify({
        users,
        message: 'Admin access granted - here are all users',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    if (error.message.includes('Access denied')) {
      return new Response(JSON.stringify({ error: 'Access denied. Admin role required.' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
