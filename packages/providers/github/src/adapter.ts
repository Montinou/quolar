import type { VCSProvider, PROptions, PRResult } from '@quolar/core'

/**
 * Shell executor interface for running git/gh commands
 */
export interface ShellExecutor {
  exec(command: string): Promise<{ stdout: string; stderr: string; exitCode: number }>
}

/**
 * GitHubAdapter implements VCSProvider using git and gh CLI.
 *
 * Requires:
 * - git CLI installed and configured
 * - gh CLI installed and authenticated
 */
export class GitHubAdapter implements VCSProvider {
  readonly name = 'github'

  constructor(
    private shell: ShellExecutor,
    private workingDir: string
  ) {}

  async createBranch(name: string, baseBranch?: string): Promise<void> {
    const base = baseBranch || (await this.getDefaultBranch())

    // Fetch latest from remote
    await this.shell.exec(`git -C "${this.workingDir}" fetch origin ${base}`)

    // Create and checkout new branch
    await this.shell.exec(`git -C "${this.workingDir}" checkout -b ${name} origin/${base}`)
  }

  async commit(message: string, files: string[]): Promise<void> {
    if (files.length === 0) {
      // Stage all changes if no specific files
      await this.shell.exec(`git -C "${this.workingDir}" add -A`)
    } else {
      // Stage specific files
      const fileList = files.map((f) => `"${f}"`).join(' ')
      await this.shell.exec(`git -C "${this.workingDir}" add ${fileList}`)
    }

    // Commit with message (using heredoc for multiline support)
    const escapedMessage = message.replace(/'/g, "'\\''")
    await this.shell.exec(`git -C "${this.workingDir}" commit -m '${escapedMessage}'`)
  }

  async push(branch?: string): Promise<void> {
    const currentBranch = branch || (await this.getCurrentBranch())
    await this.shell.exec(`git -C "${this.workingDir}" push -u origin ${currentBranch}`)
  }

  async createPR(options: PROptions): Promise<PRResult> {
    const args = [
      'pr',
      'create',
      `--title "${options.title.replace(/"/g, '\\"')}"`,
      `--body "${options.body.replace(/"/g, '\\"')}"`,
      `--head ${options.branch}`,
    ]

    if (options.baseBranch) {
      args.push(`--base ${options.baseBranch}`)
    }

    if (options.draft) {
      args.push('--draft')
    }

    if (options.labels && options.labels.length > 0) {
      args.push(`--label "${options.labels.join(',')}"`)
    }

    if (options.reviewers && options.reviewers.length > 0) {
      args.push(`--reviewer "${options.reviewers.join(',')}"`)
    }

    const result = await this.shell.exec(`gh ${args.join(' ')}`)

    // Parse PR URL from output
    const urlMatch = result.stdout.match(/https:\/\/github\.com\/[^\s]+/)
    const url = urlMatch ? urlMatch[0] : result.stdout.trim()

    // Extract PR number from URL
    const numberMatch = url.match(/\/pull\/(\d+)/)
    const number = numberMatch ? parseInt(numberMatch[1], 10) : 0

    return {
      url,
      number,
      branch: options.branch,
    }
  }

  async getCurrentBranch(): Promise<string> {
    const result = await this.shell.exec(
      `git -C "${this.workingDir}" rev-parse --abbrev-ref HEAD`
    )
    return result.stdout.trim()
  }

  async hasChanges(): Promise<boolean> {
    const result = await this.shell.exec(`git -C "${this.workingDir}" status --porcelain`)
    return result.stdout.trim().length > 0
  }

  private async getDefaultBranch(): Promise<string> {
    try {
      const result = await this.shell.exec(
        `git -C "${this.workingDir}" symbolic-ref refs/remotes/origin/HEAD`
      )
      // refs/remotes/origin/main -> main
      return result.stdout.trim().replace('refs/remotes/origin/', '')
    } catch {
      // Fallback to main
      return 'main'
    }
  }
}
