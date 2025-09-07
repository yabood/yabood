import type { APIRoute } from 'astro';
import { GitHubService } from '../../../services/github-service';
import { generateSlug, ensureUniqueSlug, generateShortGuid } from '../../../utils/slug';

const GITHUB_TOKEN = import.meta.env.GITHUB_TOKEN;
const GITHUB_OWNER = import.meta.env.GITHUB_OWNER;
const GITHUB_REPO = import.meta.env.GITHUB_REPO;
const VERCEL_PROJECT_NAME = import.meta.env.VERCEL_PROJECT_NAME || 'yabood';

export const POST: APIRoute = async ({ request, url }) => {
  try {
    // Check for required environment variables
    if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
      return new Response(JSON.stringify({ error: 'GitHub configuration missing' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Determine the base URL for preview links
    const isLocalDev = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
    const baseUrl = isLocalDev
      ? `${url.protocol}//${url.host}`
      : `https://${VERCEL_PROJECT_NAME}-{branch}.vercel.app`;

    const { title, collection = 'blog', description = '', tags = [] } = await request.json();

    if (!title) {
      return new Response(JSON.stringify({ error: 'Title is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Initialize GitHub service
    const github = new GitHubService({
      token: GITHUB_TOKEN,
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
    });

    // Generate slug from title for the file name
    let slug = generateSlug(title);

    // Get existing draft branches to ensure unique slug
    const draftBranches = await github.listBranches('draft/');
    const existingSlugs = draftBranches.map((branch) => branch.replace('draft/', ''));
    slug = ensureUniqueSlug(slug, existingSlugs);

    // Create branch name with short GUID
    const branchId = generateShortGuid();
    const branchName = `draft/${branchId}`;

    await github.createBranch(branchName, 'main');

    // Generate MDX content with frontmatter
    const currentDate = new Date().toISOString().split('T')[0];
    const mdxContent = `---
title: "${title}"
description: "${description}"
pubDate: ${currentDate}
author: "Yousif Abood"
tags: ${JSON.stringify(tags)}
draft: true
---

# ${title}

Start writing your content here...
`;

    // Create the MDX file
    const filePath = `src/content/${collection}/${slug}.mdx`;
    await github.createOrUpdateFile({
      path: filePath,
      content: mdxContent,
      message: `Create draft: ${title}`,
      branch: branchName,
    });

    // Generate preview URL based on environment
    const previewUrl = isLocalDev
      ? `${baseUrl}/${collection}/${slug}`
      : baseUrl.replace('{branch}', branchName.replace('/', '-')) + `/${collection}/${slug}`;

    return new Response(
      JSON.stringify({
        success: true,
        slug,
        collection,
        branch: branchName,
        branchId,
        title,
        filePath,
        previewUrl,
        message: `Draft created successfully`,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error creating content:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to create content',
        details: error.message,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
