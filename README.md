# Yabood Blog

A production-ready Astro blog with excellent SEO, performance, and developer experience.

## Features

- ⚡️ **Lightning Fast** - Zero JavaScript by default, perfect Core Web Vitals
- 🎨 **Tailwind CSS v4** - Modern styling with minimal bundle size
- 📝 **MDX Support** - Write content with components
- 🔍 **SEO Optimized** - JSON-LD structured data for rich snippets
- 📱 **Responsive** - Mobile-first design
- 🚀 **GitHub Pages** - Automated deployment via GitHub Actions
- 📰 **RSS Feed** - Automatic RSS generation
- 🗺️ **Sitemap** - Auto-generated sitemap for search engines
- 🖼️ **Image Optimization** - Automatic image optimization with Astro
- ⌨️ **TypeScript** - Full type safety

## Tech Stack

- [Astro](https://astro.build) - Static site generator
- [Tailwind CSS v4](https://tailwindcss.com) - Utility-first CSS
- [MDX](https://mdxjs.com) - Markdown with JSX
- [TypeScript](https://www.typescriptlang.org) - Type safety

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yabood/yabood.git
cd yabood
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:4321](http://localhost:4321) in your browser

## Project Structure

```
/
├── public/
│   ├── favicon.svg
│   ├── robots.txt
│   └── og-image.jpg
├── src/
│   ├── components/
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   ├── Prose.astro
│   │   └── Seo.astro
│   ├── content/
│   │   ├── blog/
│   │   │   └── hello-world.mdx
│   │   └── config.ts
│   ├── layouts/
│   │   ├── BaseLayout.astro
│   │   └── PostLayout.astro
│   ├── pages/
│   │   ├── blog/
│   │   │   ├── [...slug].astro
│   │   │   └── index.astro
│   │   ├── index.astro
│   │   ├── about.mdx
│   │   ├── projects.astro
│   │   ├── contact.astro
│   │   ├── 404.astro
│   │   └── rss.xml.ts
│   └── styles/
│       └── global.css
├── .github/
│   └── workflows/
│       └── deploy.yml
├── astro.config.mjs
├── tailwind.config.js
├── postcss.config.cjs
├── tsconfig.json
└── package.json
```

## Configuration

### Site Configuration

Edit `astro.config.mjs` to configure your site:

```js
export default defineConfig({
  site: 'https://yabood.com', // Your domain
  // For GitHub Pages project sites, add:
  // base: '/repo-name',
});
```

### GitHub Pages Deployment

This site is configured to deploy automatically to GitHub Pages when you push to the `main` branch.

#### Setup Instructions:

1. **Enable GitHub Pages** in your repository settings:
   - Go to Settings → Pages
   - Source: GitHub Actions

2. **For Custom Domain**:
   - Add a CNAME file in the `public` directory with your domain
   - Configure DNS settings with your domain provider

3. **For Project Pages** (username.github.io/repo):
   - Update `astro.config.mjs`:
   ```js
   site: 'https://username.github.io',
   base: '/repo-name',
   ```

## Writing Content

### Blog Posts

Create new blog posts in `src/content/blog/`:

```mdx
---
title: 'My New Post'
description: 'A description of my post'
pubDate: 2025-08-11
tags: ['astro', 'blogging']
heroImage: '/blog-image.jpg'
---

Your content here...
```

### Custom Pages

Pages can be created as `.astro` or `.mdx` files in `src/pages/`.

## Commands

| Command | Action |
|---------|--------|
| `npm run dev` | Start development server at `localhost:4321` |
| `npm run build` | Build production site to `./dist/` |
| `npm run preview` | Preview production build locally |
| `npm run astro` | Run Astro CLI commands |

## SEO & Structured Data

The site automatically generates:

- Meta tags for SEO
- Open Graph tags for social sharing
- Twitter Card tags
- JSON-LD structured data for:
  - Blog posts (BlogPosting)
  - Website (WebSite)
  - Breadcrumbs (BreadcrumbList)
  - Author (Person)

## Performance

Target metrics:
- Lighthouse Score: 95+ (all categories)
- First Contentful Paint: < 1s
- Largest Contentful Paint: < 2.5s
- Cumulative Layout Shift: < 0.1

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Author

**Yousif Abood**
- Website: [yabood.com](https://yabood.com)
- GitHub: [@yabood](https://github.com/yabood)
- Twitter: [@yabood](https://twitter.com/yabood)
