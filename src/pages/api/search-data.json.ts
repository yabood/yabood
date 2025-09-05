import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async ({ request }) => {
  try {
    // Get all blog posts, projects, and noise for search
    // Include drafts only in development mode
    const isDev = import.meta.env.DEV;
    const blogPosts = await getCollection('blog', ({ data }) => isDev || !data.draft);
    const projects = await getCollection('projects');
    const noiseEntries = await getCollection('noise', ({ data }) => isDev || !data.draft);

    // Transform data for the search functionality
    const blogData = blogPosts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      slug: post.slug,
      pubDate: post.data.pubDate,
      tags: post.data.tags || [],
    }));

    const projectData = projects.map((project) => ({
      title: project.data.title,
      description: project.data.description,
      slug: project.slug,
      startDate: project.data.startDate,
      tags: project.data.tags || [],
    }));

    const noiseData = noiseEntries.map((noise) => ({
      id: noise.data.id,
      content: noise.body || '',
      publishedAt: noise.data.publishedAt,
    }));

    return new Response(JSON.stringify({
      blogPosts: blogData,
      projects: projectData,
      noiseEntries: noiseData,
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
      },
    });
  } catch (error) {
    console.error('Error fetching search data:', error);
    return new Response(JSON.stringify({
      error: 'Failed to fetch search data'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};