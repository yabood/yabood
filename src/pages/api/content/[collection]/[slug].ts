import type { APIRoute } from 'astro';
import { getEntry } from 'astro:content';
import fs from 'fs/promises';
import path from 'path';
import { GitHubService } from '../../../../services/github-service';

const GITHUB_TOKEN = import.meta.env.GITHUB_TOKEN;
const GITHUB_OWNER = import.meta.env.GITHUB_OWNER;
const GITHUB_REPO = import.meta.env.GITHUB_REPO;
const VERCEL_PROJECT_NAME = import.meta.env.VERCEL_PROJECT_NAME || 'yabood';

// GET /api/content/:collection/:slug - Get content for editing
export const GET: APIRoute = async ({ params, request }) => {
  const { collection, slug } = params;

  if (!collection || !slug) {
    return new Response(JSON.stringify({ error: 'Collection and slug are required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Check if this is a draft (from a draft branch)
    const isDraft = request.url.includes('draft=true');

    if (isDraft && GITHUB_TOKEN && GITHUB_OWNER && GITHUB_REPO) {
      // Get content from GitHub draft branch
      const github = new GitHubService({
        token: GITHUB_TOKEN,
        owner: GITHUB_OWNER,
        repo: GITHUB_REPO,
      });

      const branchName = `draft/${slug}`;
      const filePath = `src/content/${collection}/${slug}.mdx`;

      try {
        const content = await github.getFileContent(filePath, branchName);
        const previewUrl = `https://${VERCEL_PROJECT_NAME}-${branchName.replace('/', '-')}.vercel.app`;

        return new Response(
          JSON.stringify({
            slug,
            collection,
            content,
            branch: branchName,
            previewUrl,
            isDraft: true,
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      } catch (error: any) {
        if (error.message === 'File not found') {
          // Fall back to local file system
        } else {
          throw error;
        }
      }
    }

    // Get from local file system (published content or no GitHub config)
    const entry = await getEntry(collection as any, slug);

    if (!entry) {
      return new Response(JSON.stringify({ error: 'Content not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Read the raw file content
    const filePath = path.join(process.cwd(), 'src', 'content', collection, `${slug}.mdx`);
    const rawContent = await fs.readFile(filePath, 'utf-8');

    return new Response(
      JSON.stringify({
        slug,
        collection,
        content: rawContent,
        data: entry.data,
        isDraft: false,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error loading content:', error);
    return new Response(JSON.stringify({ error: 'Failed to load content' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// PUT /api/content/:collection/:slug - Update content
export const PUT: APIRoute = async ({ params, request }) => {
  const { collection, slug } = params;

  if (!collection || !slug) {
    return new Response(JSON.stringify({ error: 'Collection and slug are required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { content, branch } = await request.json();

    if (typeof content !== 'string') {
      return new Response(JSON.stringify({ error: 'Content must be a string' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // If branch is specified and GitHub is configured, update via GitHub
    if (branch && GITHUB_TOKEN && GITHUB_OWNER && GITHUB_REPO) {
      const github = new GitHubService({
        token: GITHUB_TOKEN,
        owner: GITHUB_OWNER,
        repo: GITHUB_REPO,
      });

      const filePath = `src/content/${collection}/${slug}.mdx`;

      await github.createOrUpdateFile({
        path: filePath,
        content,
        message: `Update draft: ${slug}`,
        branch,
      });

      const previewUrl = `https://${VERCEL_PROJECT_NAME}-${branch.replace('/', '-')}.vercel.app`;

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Draft updated successfully',
          slug,
          collection,
          branch,
          previewUrl,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Otherwise, update local file (for backward compatibility)
    const filePath = path.join(process.cwd(), 'src', 'content', collection, `${slug}.mdx`);
    await fs.writeFile(filePath, content, 'utf-8');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Content updated successfully',
        slug,
        collection,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error updating content:', error);
    return new Response(JSON.stringify({ error: 'Failed to update content' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
