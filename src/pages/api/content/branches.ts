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
                  const summaryMatch = content.match(/^summary:\s*["'](.+)["']/m);
                  const dateMatch = content.match(/^pubDate:\s*(.+)$/m);
                  const publishedAtMatch = content.match(/^publishedAt:\s*["']?(.+?)["']?$/m);
                  const tagsMatch = content.match(/^tags:\s*\[(.+)\]/m);
                  const projectMatch = content.match(/^project:\s*["']?(.+?)["']?$/m);
                  const phaseMatch = content.match(/^phase:\s*["']?(.+?)["']?$/m);

                  // For noise entries without a summary, extract first part of body content
                  let extractedDescription = descriptionMatch
                    ? descriptionMatch[1]
                    : summaryMatch
                      ? summaryMatch[1]
                      : '';
                  if (!extractedDescription && collection === 'noise') {
                    // Extract content after frontmatter (after the second ---)
                    const bodyMatch = content.match(/^---[\s\S]*?---\s*([\s\S]*?)$/m);
                    if (bodyMatch && bodyMatch[1]) {
                      // Get first 150 chars of content, remove markdown formatting
                      const bodyContent = bodyMatch[1]
                        .replace(/!\[.*?\]\(.*?\)/g, '') // Remove images
                        .replace(/\[.*?\]\(.*?\)/g, '') // Remove links
                        .replace(/[#*_`]/g, '') // Remove markdown formatting
                        .trim()
                        .substring(0, 150);
                      extractedDescription = bodyContent;
                    }
                  }

                  // Generate preview URL based on environment and branch
                  let previewUrl;
                  if (collection === 'updates' && projectMatch) {
                    // Special handling for project updates
                    const projectSlug = projectMatch[1];
                    if (branchName === 'main') {
                      previewUrl = isLocalDev
                        ? `${baseUrl}/projects/${projectSlug}/updates/${slug}`
                        : `https://${VERCEL_PROJECT_NAME}.vercel.app/projects/${projectSlug}/updates/${slug}`;
                    } else {
                      previewUrl = isLocalDev
                        ? `${baseUrl}/projects/${projectSlug}/updates/${slug}`
                        : baseUrl.replace('{branch}', branchName.replace('/', '-')) +
                          `/projects/${projectSlug}/updates/${slug}`;
                    }
                  } else if (branchName === 'main') {
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

                  const draftData: any = {
                    slug,
                    branch: branchName,
                    branchId,
                    collection,
                    title: titleMatch ? titleMatch[1] : slug,
                    description: extractedDescription,
                    pubDate: dateMatch
                      ? dateMatch[1]
                      : publishedAtMatch
                        ? publishedAtMatch[1]
                        : null,
                    tags: tagsMatch
                      ? tagsMatch[1].split(',').map((t) => t.trim().replace(/['"]/g, ''))
                      : [],
                    previewUrl,
                  };

                  // Add project-specific fields for updates
                  if (collection === 'updates') {
                    if (projectMatch) draftData.project = projectMatch[1];
                    if (phaseMatch) draftData.phase = phaseMatch[1];
                  }

                  allDraftContent.push(draftData);
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
