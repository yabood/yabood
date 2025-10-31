export const SITE_CONFIG = {
  name: 'Yabood',
  url: 'https://yabood.com',
  title: 'Yousif Abood - Software Engineer',
  description:
    'Personal website of Yousif Abood, a software engineer passionate about technology, development, and creativity. Sharing insights, tutorials, and thoughts on building better software.',
  author: {
    name: 'Yousif Abood',
    email: 'hello@yabood.com',
    twitter: '@yabood',
    github: 'https://github.com/yabood',
    jobTitle: 'Software Engineer',
    bio: 'Software engineer passionate about technology, development, and creativity. I build modern web applications and explore the intersection of technology and user experience.',
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
    description:
      'Personal technology blog and portfolio showcasing software engineering insights, tutorials, and creative projects.',
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
