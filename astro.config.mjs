import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://yabood.com',
  integrations: [mdx(), sitemap()],
  output: 'hybrid',
  adapter: vercel({
    webAnalytics: {
      enabled: false,
    },
  }),
  compressHTML: true,
  build: {
    inlineStylesheets: 'auto',
  },
  vite: {
    build: {
      cssMinify: true,
    },
  },
});
