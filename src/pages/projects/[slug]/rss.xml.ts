import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export const prerender = true;

export async function getStaticPaths() {
  const projects = await getCollection('projects');
  return projects.map((project) => ({
    params: { slug: project.slug },
    props: { project },
  }));
}

export async function GET(context: APIContext) {
  const { project } = context.props;
  const updates = await getCollection(
    'updates',
    ({ data }) => !data.draft && data.project === project.slug
  );

  const sortedUpdates = updates.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

  return rss({
    title: `${project.data.title} Updates - Yousif Abood`,
    description: `Latest updates from ${project.data.title}`,
    site: context.site!,
    items: sortedUpdates.map((update) => ({
      title: update.data.title,
      description: update.data.summary,
      pubDate: update.data.date,
      link: `/projects/${project.slug}/updates/${update.slug}/`,
      categories: [update.data.phase, ...update.data.tags],
      author: 'Yousif Abood',
    })),
  });
}
