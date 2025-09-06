import type { APIRoute } from 'astro';
import { GitHubService } from '../../../services/github-service';

const GITHUB_TOKEN = import.meta.env.GITHUB_TOKEN;
const GITHUB_OWNER = import.meta.env.GITHUB_OWNER;
const GITHUB_REPO = import.meta.env.GITHUB_REPO;
const VERCEL_PROJECT_NAME = import.meta.env.VERCEL_PROJECT_NAME || 'yabood';

export const GET: APIRoute = async () => {
  if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
    return new Response(JSON.stringify({ error: 'GitHub configuration missing' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const github = new GitHubService({
      token: GITHUB_TOKEN,
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
    });

    // Get all draft branches
    const draftBranches = await github.listBranches('draft/');

    // For each branch, get the content metadata
    const drafts = await Promise.all(
      draftBranches.map(async (branchName) => {
        const slug = branchName.replace('draft/', '');

        try {
          // Try to find the MDX file in different collections
          const collections = ['blog', 'noise', 'updates'];
          let contentData = null;

          for (const collection of collections) {
            const filePath = `src/content/${collection}/${slug}.mdx`;
            try {
              const content = await github.getFileContent(filePath, branchName);

              // Extract metadata from frontmatter
              const titleMatch = content.match(/^title:\s*["'](.+)["']/m);
              const descriptionMatch = content.match(/^description:\s*["'](.+)["']/m);
              const dateMatch = content.match(/^pubDate:\s*(.+)$/m);
              const tagsMatch = content.match(/^tags:\s*\[(.+)\]/m);

              contentData = {
                slug,
                branch: branchName,
                collection,
                title: titleMatch ? titleMatch[1] : slug,
                description: descriptionMatch ? descriptionMatch[1] : '',
                pubDate: dateMatch ? dateMatch[1] : null,
                tags: tagsMatch
                  ? tagsMatch[1].split(',').map((t) => t.trim().replace(/['"]/g, ''))
                  : [],
                previewUrl: `https://${VERCEL_PROJECT_NAME}-${branchName.replace('/', '-')}.vercel.app`,
              };
              break;
            } catch {
              // File not found in this collection, try next
              continue;
            }
          }

          if (contentData) {
            return contentData;
          }

          // If no content found in any collection, return basic info
          return {
            slug,
            branch: branchName,
            collection: 'unknown',
            title: slug,
            description: 'Draft content',
            previewUrl: `https://${VERCEL_PROJECT_NAME}-${branchName.replace('/', '-')}.vercel.app`,
          };
        } catch (error) {
          console.error(`Error processing branch ${branchName}:`, error);
          return null;
        }
      })
    );

    // Filter out any null results
    const validDrafts = drafts.filter((draft) => draft !== null);

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
