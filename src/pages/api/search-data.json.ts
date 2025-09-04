import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async () => {
  try {
    // Include drafts only in development mode
    const isDev = import.meta.env.DEV;
    
    // Get all collections
    const blogPosts = await getCollection('blog', ({ data }) => isDev || !data.draft);
    const projects = await getCollection('projects');
    const noiseEntries = await getCollection('noise', ({ data }) => isDev || !data.draft);

    // Transform data for search
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
      summary: noise.data.summary,
      content: noise.body || '',
      publishedAt: noise.data.publishedAt,
    }));

    const searchData = {
      blogPosts: blogData,
      projects: projectData,
      noiseEntries: noiseData,
    };

    return new Response(JSON.stringify(searchData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'max-age=300', // Cache for 5 minutes
      },
    });
  } catch (error) {
    console.error('Error generating search data:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate search data',
        blogPosts: [],
        projects: [],
        noiseEntries: []
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};