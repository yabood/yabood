import type { APIRoute } from 'astro';
import { GitHubService } from '../../../../../services/github-service';

const GITHUB_TOKEN = import.meta.env.GITHUB_TOKEN;
const GITHUB_OWNER = import.meta.env.GITHUB_OWNER;
const GITHUB_REPO = import.meta.env.GITHUB_REPO;

export const DELETE: APIRoute = async ({ params }) => {
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
    const github = new GitHubService({
      token: GITHUB_TOKEN,
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
    });

    const branchName = `draft/${slug}`;

    // Check if draft branch exists
    const branchExists = await github.branchExists(branchName);
    if (!branchExists) {
      return new Response(JSON.stringify({ error: 'Draft not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Delete the branch (this will also delete all files in that branch)
    await github.deleteBranch(branchName);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Draft deleted successfully',
        slug,
        collection,
        deletedBranch: branchName,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error deleting draft:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to delete draft',
        details: error.message,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
