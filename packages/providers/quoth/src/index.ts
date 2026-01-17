/**
 * @quolar/provider-quoth - Quoth documentation provider
 *
 * @example
 * ```typescript
 * import { QuothAdapter } from '@quolar/provider-quoth'
 *
 * const adapter = new QuothAdapter(mcpClient)
 * const patterns = await adapter.searchPatterns('login test patterns')
 * ```
 */

export { QuothAdapter, type QuothMCPClient } from './adapter.js'
