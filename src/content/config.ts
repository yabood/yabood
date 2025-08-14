import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      heroImage: image().optional(),
      tags: z.array(z.string()).default([]),
      author: z.string().default('Yousif Abood'),
      draft: z.boolean().default(false),
      showToc: z.boolean().default(false),
    }),
});

const phaseEnum = z.enum(['idea', 'research', 'implementation', 'release', 'iteration', 'archived']);

const projects = defineCollection({
  type: 'content',
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      startDate: z.coerce.date(),
      endDate: z.coerce.date().optional(),
      tags: z.array(z.string()).default([]),
      status: z.enum(['active', 'completed', 'paused', 'archived']).default('active'),
      currentPhase: phaseEnum,
      github: z.string().url().optional(),
      website: z.string().url().optional(),
      cover: image().optional(),
      releases: z.number().default(0),
      contributors: z.number().default(1),
    }),
});

const updates = defineCollection({
  type: 'content',
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.coerce.date(),
      phase: phaseEnum,
      project: z.string(),
      tags: z.array(z.string()).default([]),
      summary: z.string(),
      cover: image().optional(),
      draft: z.boolean().default(false),
    }),
});

export const collections = { blog, projects, updates };
