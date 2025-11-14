import type { APIRoute } from 'astro';
import { getEntry } from 'astro:content';
import fs from 'fs/promises';
import path from 'path';
import { GitHubService } from '../../../../services/github-service';

const GITHUB_TOKEN = import.meta.env.GITHUB_TOKEN;
const GITHUB_OWNER = import.meta.env.GITHUB_OWNER;
const GITHUB_REPO = import.meta.env.GITHUB_REPO;
const NETLIFY_SITE_NAME = import.meta.env.NETLIFY_SITE_NAME || import.meta.env.SITE_URL || 'yabood';

// GET /api/content/:collection/:slug - Get content for editing
export const GET: APIRoute = async ({ params, request, url }) => {
  const { collection, slug } = params;

  if (!collection || !slug) {
    return new Response(JSON.stringify({ error: 'Collection and slug are required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Determine the base URL for preview links
  // Netlify preview URLs: https://[branch]--[site-name].netlify.app
  const isLocalDev = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
  const baseUrl = isLocalDev
    ? `${url.protocol}//${url.host}`
    : `https://{branch}--${NETLIFY_SITE_NAME}.netlify.app`;

  try {
    const searchParams = new URL(request.url).searchParams;
    const isDraft = searchParams.get('draft') === 'true';
    const branchIdParam = searchParams.get('branchId');
    const branchParam = searchParams.get('branch');

    if (isDraft && GITHUB_TOKEN && GITHUB_OWNER && GITHUB_REPO) {
      // Get content from GitHub draft branch
      const github = new GitHubService({
        token: GITHUB_TOKEN,
        owner: GITHUB_OWNER,
        repo: GITHUB_REPO,
      });

      // Prefer explicit branch information when available
      const preferredBranch = branchIdParam
        ? `draft/${branchIdParam}`
        : branchParam && branchParam.startsWith('draft/')
          ? branchParam
          : null;

      const draftBranches = preferredBranch
        ? [preferredBranch]
        : await github.listBranches('draft/');

      for (const branchName of draftBranches) {
        try {
          const filePath = `src/content/${collection}/${slug}.mdx`;
          const content = await github.getFileContent(filePath, branchName);
          const previewUrl = isLocalDev
            ? `${baseUrl}/${collection}/${slug}`
            : baseUrl.replace('{branch}', branchName.replace('/', '-')) + `/${collection}/${slug}`;

          return new Response(
            JSON.stringify({
              slug,
              collection,
              content,
              branch: branchName,
              branchId: branchName.replace('draft/', ''),
              previewUrl,
              isDraft: true,
            }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        } catch (error: any) {
          // Try the next branch
          continue;
        }
      }

      // If not found in any draft branch, fall back to local file system
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
export const PUT: APIRoute = async ({ params, request, url }) => {
  const { collection, slug } = params;

  if (!collection || !slug) {
    return new Response(JSON.stringify({ error: 'Collection and slug are required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Determine the base URL for preview links
  // Netlify preview URLs: https://[branch]--[site-name].netlify.app
  const isLocalDev = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
  const baseUrl = isLocalDev
    ? `${url.protocol}//${url.host}`
    : `https://{branch}--${NETLIFY_SITE_NAME}.netlify.app`;

  try {
    const { content, branch, branchId } = await request.json();

    if (typeof content !== 'string' || content.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Content must be a non-empty string' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const resolvedBranch = branch ?? (branchId ? `draft/${branchId}` : null);

    // If branch is specified and GitHub is configured, update via GitHub
    if (resolvedBranch && GITHUB_TOKEN && GITHUB_OWNER && GITHUB_REPO) {
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
        branch: resolvedBranch,
      });

      const previewUrl = isLocalDev
        ? `${baseUrl}/${collection}/${slug}`
        : baseUrl.replace('{branch}', resolvedBranch.replace('/', '-')) + `/${collection}/${slug}`;

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Draft updated successfully',
          slug,
          collection,
          branch: resolvedBranch,
          branchId: resolvedBranch.replace('draft/', ''),
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
