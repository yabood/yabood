export const SITE_CONFIG = {
  name: 'Yousif Abood',
  url: 'https://yabood.com',
  title: 'Yousif Abood',
  description:
    'Personal website of Yousif Abood. Writing about building products, side projects, cooking, and whatever else I find interesting.',
  author: {
    name: 'Yousif Abood',
    email: 'hello@yabood.com',
    twitter: '@yabood',
    github: 'https://github.com/yabood',
    jobTitle: 'Founder, Product Leader',
    bio: 'Technical founder and product leader with 15+ years building enterprise SaaS products. Currently fractional Head of Customer Success at Elastio.',
    image: '/author-avatar.jpg', // Add when available
  },
  social: {
    twitter: 'https://twitter.com/yabood',
    github: 'https://github.com/yabood',
  },
  ogImage: '/og-image.jpg',
  favicon: '/favicon.svg',
  // SEO defaults
  defaultMetaTags: {
    viewport: 'width=device-width, initial-scale=1',
    charset: 'utf-8',
    generator: 'Astro',
  },
  // Schema.org structured data
  organization: {
    '@type': 'Organization' as const,
    name: 'Yabood',
    url: 'https://yabood.com',
    logo: {
      '@type': 'ImageObject' as const,
      url: 'https://yabood.com/favicon.svg',
      width: '32',
      height: '32',
    },
    sameAs: ['https://twitter.com/yabood', 'https://github.com/yabood'],
    founder: {
      '@type': 'Person' as const,
      name: 'Yousif Abood',
    },
  },
} as const;
