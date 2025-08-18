import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const updates = await getCollection('updates', ({ data }) => !data.draft);
  const projects = await getCollection('projects');

  const sortedUpdates = updates.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

  return rss({
    title: 'Project Updates - Yousif Abood',
    description: 'Latest updates from my project journal',
    site: context.site!,
    items: sortedUpdates.map((update) => {
      const project = projects.find((p) => p.slug === update.data.project);
      return {
        title: `${update.data.title} - ${project?.data.title || update.data.project}`,
        description: update.data.summary,
        pubDate: update.data.date,
        link: `/projects/${update.data.project}/updates/${update.slug}/`,
        categories: [update.data.phase, ...update.data.tags],
        author: 'Yousif Abood',
      };
    }),
  });
}
