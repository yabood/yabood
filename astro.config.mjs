import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
<<<<<<< HEAD
import react from '@astrojs/react';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export default defineConfig({
  site: 'https://yabood.com',
  integrations: [
    mdx({
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex],
    }),
    sitemap(),
    react(),
  ],
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
  },
=======
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
>>>>>>> a586041e4904d72d3c2ccdace42aebd2ceecb58a
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
