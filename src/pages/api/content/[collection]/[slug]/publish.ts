import type { APIRoute } from 'astro';
import { GitHubService } from '../../../../../services/github-service';

const GITHUB_TOKEN = import.meta.env.GITHUB_TOKEN;
const GITHUB_OWNER = import.meta.env.GITHUB_OWNER;
const GITHUB_REPO = import.meta.env.GITHUB_REPO;

export const POST: APIRoute = async ({ params, request }) => {
  const { collection, slug } = params;

  if (!collection || !slug) {
    return new Response(JSON.stringify({ error: 'Collection and slug are required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
    return new Response(JSON.stringify({ error: 'GitHub configuration missing' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { branchId } = body;

    const github = new GitHubService({
      token: GITHUB_TOKEN,
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
    });

    // Use branchId if provided (new GUID system), otherwise fall back to slug (legacy)
    const branchName = branchId ? `draft/${branchId}` : `draft/${slug}`;
    const filePath = `src/content/${collection}/${slug}.mdx`;

    // Check if draft branch exists
    const branchExists = await github.branchExists(branchName);
    if (!branchExists) {
      return new Response(JSON.stringify({ error: 'Draft not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get the content from the draft branch to extract title for PR
    const content = await github.getFileContent(filePath, branchName);

    // Extract title from frontmatter
    const titleMatch = content.match(/^title:\s*["'](.+)["']/m);
    const title = titleMatch ? titleMatch[1] : slug;

    // Extract additional metadata for PR description
    const descriptionMatch = content.match(/^description:\s*["'](.+)["']/m);
    const dateMatch = content.match(/^pubDate:\s*(.+)$/m);
    const tagsMatch = content.match(/^tags:\s*\[(.+)\]/m);

    const description = descriptionMatch ? descriptionMatch[1] : '';
    const pubDate = dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0];
    const tags = tagsMatch ? tagsMatch[1].split(',').map((t) => t.trim().replace(/['"]/g, '')) : [];

    // Create pull request with detailed information
    const prNumber = await github.createPullRequest({
      title: `Publish: ${title}`,
      body: `## Publishing Content

**Title:** ${title}
**Collection:** ${collection}
**Slug:** ${slug}
**Publication Date:** ${pubDate}
${description ? `**Description:** ${description}\n` : ''}
${tags.length > 0 ? `**Tags:** ${tags.join(', ')}\n` : ''}

### Content Summary
This pull request publishes the draft content from the \`${branchName}\` branch to production.

### Branch Details
- Branch: \`${branchName}\`
- File: \`${filePath}\`
- Created: ${new Date().toISOString()}

---
*This PR was automatically created by the content management system.*`,
      head: branchName,
      base: 'main',
    });

    // Auto-merge the pull request
    try {
      await github.mergePullRequest(prNumber, `Publish: ${title}`);

      // Delete the draft branch after successful merge
      await github.deleteBranch(branchName);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Content published successfully',
          slug,
          collection,
          pullRequest: prNumber,
          productionUrl: `/${collection}/${slug}`,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } catch (mergeError: any) {
      // If auto-merge fails, still return success but with a note
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Pull request created successfully. Manual merge may be required.',
          slug,
          collection,
          pullRequest: prNumber,
          requiresManualMerge: true,
          mergeError: mergeError.message,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error: any) {
    console.error('Error publishing content:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to publish content',
        details: error.message,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
