import mdx from '@astrojs/mdx';
import { satteri } from '@astrojs/markdown-satteri';
import netlify from '@astrojs/netlify';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import { katexPlugin } from './src/plugins/katex.ts';
import { stripHeadInjectDirective } from './src/plugins/strip-head-inject.ts';

export default defineConfig({
  site: 'https://yabood.com',
  output: 'server',
  adapter: netlify({
    devFeatures: {
      environmentVariables: false,
      images: true,
      // Netlify emulates edge functions by running a Deno server, which fails
      // here: @netlify/edge-functions-dev launches `deno eval --allow-scripts`,
      // and Deno 2.9 rejects that flag on `eval` (still true in its 2.0.2).
      // This project defines no edge functions, so the emulator only ever
      // produced an unhandled rejection on `astro dev`.
      edgeFunctions: false,
    },
  }),
  integrations: [mdx(), sitemap(), react()],
  markdown: {
    processor: satteri({
      features: { math: true },
      hastPlugins: [katexPlugin],
    }),
  },
  compressHTML: true,
  build: {
    inlineStylesheets: 'auto',
  },
  vite: {
    plugins: [tailwindcss(), stripHeadInjectDirective],
    build: {
      cssMinify: true,
    },
  },
});
