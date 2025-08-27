/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly AUTH_SECRET: string;
  readonly GITHUB_CLIENT_ID: string;
  readonly GITHUB_CLIENT_SECRET: string;
  readonly GOOGLE_CLIENT_ID: string;
  readonly GOOGLE_CLIENT_SECRET: string;
  readonly AUTH_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
