import type { PROptions, PRResult } from '../types/index.js'

/**
 * VCSProvider interface for version control systems.
 *
 * Default implementation: GitHub
 * Alternative implementations: GitLab, Bitbucket, Azure DevOps
 */
export interface VCSProvider {
  /**
   * Provider name for identification and logging
   */
  readonly name: string

  /**
   * Create a new branch
   * @param name - The branch name
   * @param baseBranch - The base branch (defaults to main/master)
   */
  createBranch(name: string, baseBranch?: string): Promise<void>

  /**
   * Commit changes to the repository
   * @param message - The commit message
   * @param files - Array of file paths to commit
   */
  commit(message: string, files: string[]): Promise<void>

  /**
   * Push changes to remote
   * @param branch - The branch to push (optional, defaults to current)
   */
  push(branch?: string): Promise<void>

  /**
   * Create a pull request
   * @param options - PR creation options
   * @returns PR result with URL and number
   */
  createPR(options: PROptions): Promise<PRResult>

  /**
   * Get the current branch name
   */
  getCurrentBranch(): Promise<string>

  /**
   * Check if there are uncommitted changes
   */
  hasChanges(): Promise<boolean>
}
