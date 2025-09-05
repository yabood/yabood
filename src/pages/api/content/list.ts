import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async ({ url }) => {
  const searchParams = new URL(url).searchParams;
  const collection = searchParams.get('collection');

  try {
    const collections = ['blog', 'noise', 'updates'];
    const result: Record<string, any[]> = {};

    if (collection && collections.includes(collection)) {
      // Get specific collection
      const entries = await getCollection(collection as any);
      result[collection] = entries.map(entry => ({
        slug: entry.slug,
        collection,
        title: entry.data.title || entry.slug,
        description: entry.data.description || '',
        pubDate: entry.data.pubDate || null,
        draft: entry.data.draft || false,
        tags: entry.data.tags || []
      }));
    } else {
      // Get all collections
      for (const collectionName of collections) {
        try {
          const entries = await getCollection(collectionName as any);
          result[collectionName] = entries.map(entry => ({
            slug: entry.slug,
            collection: collectionName,
            title: entry.data.title || entry.slug,
            description: entry.data.description || '',
            pubDate: entry.data.pubDate || null,
            draft: entry.data.draft || false,
            tags: entry.data.tags || []
          }));
        } catch (error) {
          console.error(`Error loading collection ${collectionName}:`, error);
          result[collectionName] = [];
        }
      }
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error listing content:', error);
    return new Response(JSON.stringify({ error: 'Failed to list content' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};