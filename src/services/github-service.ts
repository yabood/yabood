import { Octokit } from '@octokit/rest';

export interface GitHubConfig {
  token: string;
  owner: string;
  repo: string;
  defaultBranch?: string;
}

export interface ContentFile {
  path: string;
  content: string;
  message: string;
  branch: string;
}

export interface PullRequestData {
  title: string;
  body: string;
  head: string;
  base: string;
}

export class GitHubService {
  private octokit: Octokit;
  private owner: string;
  private repo: string;
  private defaultBranch: string;

  constructor(config: GitHubConfig) {
    this.octokit = new Octokit({ auth: config.token });
    this.owner = config.owner;
    this.repo = config.repo;
    this.defaultBranch = config.defaultBranch || 'main';
  }

  /**
   * Create a new branch from a base branch
   */
  async createBranch(branchName: string, baseBranch: string = 'drafts'): Promise<void> {
    try {
      // Get the SHA of the base branch
      const { data: baseBranchData } = await this.octokit.git.getRef({
        owner: this.owner,
        repo: this.repo,
        ref: `heads/${baseBranch}`,
      });

      // Create the new branch
      await this.octokit.git.createRef({
        owner: this.owner,
        repo: this.repo,
        ref: `refs/heads/${branchName}`,
        sha: baseBranchData.object.sha,
      });
    } catch (error: any) {
      if (error.status === 422 && error.message?.includes('Reference already exists')) {
        // Branch already exists, which is fine
        return;
      }
      throw error;
    }
  }

  /**
   * Create or update a file in a branch
   */
  async createOrUpdateFile(file: ContentFile): Promise<void> {
    let sha: string | undefined;

    // Try to get the existing file SHA if it exists
    try {
      const { data: existingFile } = await this.octokit.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path: file.path,
        ref: file.branch,
      });

      if ('sha' in existingFile) {
        sha = existingFile.sha;
      }
    } catch (error: any) {
      // File doesn't exist, which is fine for creation
      if (error.status !== 404) {
        throw error;
      }
    }

    // Create or update the file
    await this.octokit.repos.createOrUpdateFileContents({
      owner: this.owner,
      repo: this.repo,
      path: file.path,
      message: file.message,
      content: Buffer.from(file.content).toString('base64'),
      branch: file.branch,
      sha, // Include SHA if updating existing file
    });
  }

  /**
   * Get file content from a branch
   */
  async getFileContent(path: string, branch: string): Promise<string> {
    try {
      const { data } = await this.octokit.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path,
        ref: branch,
      });

      if ('content' in data && data.type === 'file') {
        return Buffer.from(data.content, 'base64').toString('utf-8');
      }

      throw new Error('Invalid file type');
    } catch (error: any) {
      if (error.status === 404) {
        throw new Error('File not found');
      }
      throw error;
    }
  }

  /**
   * Delete a file from a branch
   */
  async deleteFile(path: string, branch: string, message: string): Promise<void> {
    // Get the file SHA first
    const { data: file } = await this.octokit.repos.getContent({
      owner: this.owner,
      repo: this.repo,
      path,
      ref: branch,
    });

    if ('sha' in file) {
      await this.octokit.repos.deleteFile({
        owner: this.owner,
        repo: this.repo,
        path,
        message,
        sha: file.sha,
        branch,
      });
    }
  }

  /**
   * Create a pull request
   */
  async createPullRequest(data: PullRequestData): Promise<number> {
    const { data: pr } = await this.octokit.pulls.create({
      owner: this.owner,
      repo: this.repo,
      title: data.title,
      body: data.body,
      head: data.head,
      base: data.base,
    });

    return pr.number;
  }

  /**
   * Merge a pull request
   */
  async mergePullRequest(pullNumber: number, commitMessage?: string): Promise<void> {
    await this.octokit.pulls.merge({
      owner: this.owner,
      repo: this.repo,
      pull_number: pullNumber,
      commit_title: commitMessage,
      merge_method: 'squash', // Use squash merge for cleaner history
    });
  }

  /**
   * Delete a branch
   */
  async deleteBranch(branchName: string): Promise<void> {
    try {
      await this.octokit.git.deleteRef({
        owner: this.owner,
        repo: this.repo,
        ref: `heads/${branchName}`,
      });
    } catch (error: any) {
      // Ignore if branch doesn't exist
      if (error.status !== 422) {
        throw error;
      }
    }
  }

  /**
   * List all branches matching a pattern
   */
  async listBranches(pattern: string = 'draft/'): Promise<string[]> {
    const { data: branches } = await this.octokit.repos.listBranches({
      owner: this.owner,
      repo: this.repo,
      per_page: 100,
    });

    return branches
      .map(branch => branch.name)
      .filter(name => name.startsWith(pattern));
  }

  /**
   * Check if a branch exists
   */
  async branchExists(branchName: string): Promise<boolean> {
    try {
      await this.octokit.repos.getBranch({
        owner: this.owner,
        repo: this.repo,
        branch: branchName,
      });
      return true;
    } catch (error: any) {
      if (error.status === 404) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Get all files in a directory from a branch
   */
  async getDirectoryContents(path: string, branch: string): Promise<Array<{ name: string; path: string }>> {
    try {
      const { data } = await this.octokit.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path,
        ref: branch,
      });

      if (Array.isArray(data)) {
        return data
          .filter(item => item.type === 'file')
          .map(item => ({
            name: item.name,
            path: item.path,
          }));
      }

      return [];
    } catch (error: any) {
      if (error.status === 404) {
        return [];
      }
      throw error;
    }
  }

  /**
   * Create initial drafts branch if it doesn't exist
   */
  async ensureDraftsBranch(): Promise<void> {
    const exists = await this.branchExists('drafts');
    if (!exists) {
      await this.createBranch('drafts', this.defaultBranch);
    }
  }
}