import type { APIRoute } from 'astro';
import { GitHubService } from '../../../services/github-service';

const GITHUB_TOKEN = import.meta.env.GITHUB_TOKEN;
const GITHUB_OWNER = import.meta.env.GITHUB_OWNER;
const GITHUB_REPO = import.meta.env.GITHUB_REPO;
const VERCEL_PROJECT_NAME = import.meta.env.VERCEL_PROJECT_NAME || 'yabood';

export const GET: APIRoute = async ({ url }) => {
  if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
    return new Response(JSON.stringify({ error: 'GitHub configuration missing' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Determine the base URL for preview links
  // In development, use localhost; in production, use Vercel preview URLs
  const isLocalDev = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
  const baseUrl = isLocalDev
    ? `${url.protocol}//${url.host}`
    : `https://${VERCEL_PROJECT_NAME}-{branch}.vercel.app`;

  try {
    const github = new GitHubService({
      token: GITHUB_TOKEN,
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
    });

    // Get all draft branches AND main branch
    const draftBranches = await github.listBranches('draft/');
    const allBranches = ['main', ...draftBranches]; // Include main branch to get all drafts

    // For each branch, get the content metadata
    const drafts = await Promise.all(
      allBranches.map(async (branchName) => {
        const branchId = branchName.replace('draft/', '');

        try {
          // Try to find the MDX file in different collections
          const collections = ['blog', 'noise', 'updates'];
          const allDraftContent = [];

          for (const collection of collections) {
            // Get all files in the collection directory
            const files = await github.getDirectoryContents(
              `src/content/${collection}`,
              branchName
            );

            if (files.length > 0) {
              // Get all MDX files in this collection
              const mdxFiles = files.filter(
                (f) => f.name.endsWith('.mdx') || f.name.endsWith('.md')
              );

              for (const mdxFile of mdxFiles) {
                const content = await github.getFileContent(mdxFile.path, branchName);
                const slug = mdxFile.name.replace(/\.(mdx|md)$/, '');

                // Check if this file is marked as draft
                const isDraftMatch = content.match(/^draft:\s*(true|false)/m);
                const isDraft = isDraftMatch ? isDraftMatch[1] === 'true' : false;

                // Only include files that are drafts
                if (isDraft) {
                  // Extract metadata from frontmatter
                  const titleMatch = content.match(/^title:\s*["'](.+)["']/m);
                  const descriptionMatch = content.match(/^description:\s*["'](.+)["']/m);
                  const dateMatch = content.match(/^pubDate:\s*(.+)$/m);
                  const tagsMatch = content.match(/^tags:\s*\[(.+)\]/m);

                  // Generate preview URL based on environment and branch
                  let previewUrl;
                  if (branchName === 'main') {
                    // For main branch drafts, use the regular production URL
                    previewUrl = isLocalDev
                      ? `${baseUrl}/${collection}/${slug}`
                      : `https://${VERCEL_PROJECT_NAME}.vercel.app/${collection}/${slug}`;
                  } else {
                    // For feature branches, use preview URLs
                    previewUrl = isLocalDev
                      ? `${baseUrl}/${collection}/${slug}`
                      : baseUrl.replace('{branch}', branchName.replace('/', '-')) +
                        `/${collection}/${slug}`;
                  }

                  allDraftContent.push({
                    slug,
                    branch: branchName,
                    branchId,
                    collection,
                    title: titleMatch ? titleMatch[1] : slug,
                    description: descriptionMatch ? descriptionMatch[1] : '',
                    pubDate: dateMatch ? dateMatch[1] : null,
                    tags: tagsMatch
                      ? tagsMatch[1].split(',').map((t) => t.trim().replace(/['"]/g, ''))
                      : [],
                    previewUrl,
                  });
                }
              }
            }
          }

          // Return all draft content found in this branch
          return allDraftContent.length > 0 ? allDraftContent : null;
        } catch (error) {
          console.error(`Error processing branch ${branchName}:`, error);
          return null;
        }
      })
    );

    // Flatten the results and filter out any null results
    const validDrafts = drafts.filter((draft) => draft !== null).flat();

    return new Response(
      JSON.stringify({
        drafts: validDrafts,
        total: validDrafts.length,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error listing draft branches:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to list draft branches',
        details: error.message,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
