import type { APIRoute } from 'astro';
import { getCollection, getEntry } from 'astro:content';
import fs from 'fs/promises';
import path from 'path';

// GET /api/content/:collection/:slug - Get content for editing
export const GET: APIRoute = async ({ params, request }) => {
  const { collection, slug } = params;
  
  if (!collection || !slug) {
    return new Response(JSON.stringify({ error: 'Collection and slug are required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Get the entry metadata
    const entry = await getEntry(collection as any, slug);
    
    if (!entry) {
      return new Response(JSON.stringify({ error: 'Content not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Read the raw file content
    const filePath = path.join(process.cwd(), 'src', 'content', collection, `${slug}.mdx`);
    const rawContent = await fs.readFile(filePath, 'utf-8');

    return new Response(JSON.stringify({
      slug,
      collection,
      content: rawContent,
      data: entry.data
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error loading content:', error);
    return new Response(JSON.stringify({ error: 'Failed to load content' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// PUT /api/content/:collection/:slug - Update content
export const PUT: APIRoute = async ({ params, request }) => {
  const { collection, slug } = params;
  
  if (!collection || !slug) {
    return new Response(JSON.stringify({ error: 'Collection and slug are required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { content } = await request.json();
    
    if (typeof content !== 'string') {
      return new Response(JSON.stringify({ error: 'Content must be a string' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Write the updated content
    const filePath = path.join(process.cwd(), 'src', 'content', collection, `${slug}.mdx`);
    await fs.writeFile(filePath, content, 'utf-8');

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Content updated successfully',
      slug,
      collection 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error updating content:', error);
    return new Response(JSON.stringify({ error: 'Failed to update content' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};