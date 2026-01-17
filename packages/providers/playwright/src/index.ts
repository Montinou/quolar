/**
 * @quolar/provider-playwright - Playwright test framework provider
 *
 * @example
 * ```typescript
 * import { PlaywrightAdapter } from '@quolar/provider-playwright'
 *
 * const adapter = new PlaywrightAdapter(shell, fs, '/path/to/project')
 * const results = await adapter.execute({ grep: 'login' })
 * ```
 */

export { PlaywrightAdapter, type ShellExecutor, type FileSystem } from './adapter.js'
