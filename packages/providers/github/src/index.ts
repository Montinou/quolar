/**
 * @quolar/provider-github - GitHub VCS provider
 *
 * @example
 * ```typescript
 * import { GitHubAdapter } from '@quolar/provider-github'
 *
 * const adapter = new GitHubAdapter(shellExecutor, '/path/to/repo')
 * await adapter.createBranch('feature/new-tests')
 * ```
 */

export { GitHubAdapter, type ShellExecutor } from './adapter.js'
