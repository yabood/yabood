import { Auth } from '@auth/core';
import GitHub from '@auth/core/providers/github';
import Google from '@auth/core/providers/google';
import jwt from 'jsonwebtoken';
import type { AuthConfig } from '@auth/core/types';

const AUTH_SECRET = process.env.AUTH_SECRET ?? import.meta.env.AUTH_SECRET;
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID ?? import.meta.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET =
  process.env.GITHUB_CLIENT_SECRET ?? import.meta.env.GITHUB_CLIENT_SECRET;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID ?? import.meta.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET =
  process.env.GOOGLE_CLIENT_SECRET ?? import.meta.env.GOOGLE_CLIENT_SECRET;
if (!AUTH_SECRET) {
  throw new Error('AUTH_SECRET is not set. Define it in .env/.env.local');
}

export const authConfig: AuthConfig = {
  basePath: '/api/auth',
  providers: [
    GitHub({
      clientId: GITHUB_CLIENT_ID!,
      clientSecret: GITHUB_CLIENT_SECRET!,
    }),
    Google({
      clientId: GOOGLE_CLIENT_ID!,
      clientSecret: GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
        token.provider = account?.provider;

        // Assign role based on email domain
        const email = user.email as string;
        if (email && email.endsWith('@yabood.com')) {
          token.role = 'admin';
        } else {
          token.role = 'user';
        }
      }
      return token;
    },
    async session({ session, token }) {
      const sess: any = session;
      if (token && sess.user) {
        (sess.user as any).id = token.id as string;
        (sess.user as any).provider = token.provider as string;
        (sess.user as any).role = token.role as string;
      }

      const accessToken = jwt.sign(
        {
          userId: token.id,
          email: token.email,
          name: token.name,
          provider: token.provider,
          role: token.role,
        },
        AUTH_SECRET as string,
        { expiresIn: '1d' }
      );

      sess.accessToken = accessToken;
      return sess;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: (AUTH_SECRET as string) || undefined,
  trustHost: true,
};

export async function handleAuth(request: Request) {
  return Auth(request, authConfig);
}
