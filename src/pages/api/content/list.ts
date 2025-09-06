import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

function mapEntryData(entry: any, collectionName: string) {
  switch (collectionName) {
    case 'blog':
      return {
        slug: entry.slug,
        collection: collectionName,
        title: entry.data.title,
        description: entry.data.description,
        pubDate: entry.data.pubDate,
        draft: entry.data.draft,
        tags: entry.data.tags,
      };
    case 'noise':
      return {
        slug: entry.slug,
        collection: collectionName,
        title: entry.data.id || entry.slug,
        description: entry.data.summary || '',
        pubDate: entry.data.publishedAt,
        draft: entry.data.draft,
        tags: [],
      };
    case 'updates':
      return {
        slug: entry.slug,
        collection: collectionName,
        title: entry.data.title,
        description: entry.data.summary,
        pubDate: entry.data.date,
        draft: entry.data.draft,
        tags: entry.data.tags,
      };
    case 'projects':
      return {
        slug: entry.slug,
        collection: collectionName,
        title: entry.data.title,
        description: entry.data.description,
        pubDate: entry.data.startDate,
        draft: entry.data.draft,
        tags: entry.data.tags,
      };
    default:
      return {
        slug: entry.slug,
        collection: collectionName,
        title: entry.slug,
        description: '',
        pubDate: null,
        draft: false,
        tags: [],
      };
  }
}

export const GET: APIRoute = async ({ url }) => {
  const searchParams = new URL(url).searchParams;
  const collection = searchParams.get('collection');

  try {
    const collections = ['blog', 'noise', 'updates', 'projects'];
    const result: Record<string, any[]> = {};

    if (collection && collections.includes(collection)) {
      // Get specific collection
      const entries = await getCollection(collection as 'blog' | 'noise' | 'updates' | 'projects');
      result[collection] = entries.map((entry) => mapEntryData(entry, collection));
    } else {
      // Get all collections
      for (const collectionName of collections) {
        try {
          const entries = await getCollection(
            collectionName as 'blog' | 'noise' | 'updates' | 'projects'
          );
          result[collectionName] = entries.map((entry) => mapEntryData(entry, collectionName));
        } catch (error) {
          console.error(`Error loading collection ${collectionName}:`, error);
          result[collectionName] = [];
        }
      }
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error listing content:', error);
    return new Response(JSON.stringify({ error: 'Failed to list content' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
