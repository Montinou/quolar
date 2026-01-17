/**
 * @quolar/provider-linear - Linear ticket provider
 *
 * @example
 * ```typescript
 * import { LinearAdapter } from '@quolar/provider-linear'
 *
 * const adapter = new LinearAdapter(mcpClient)
 * const ticket = await adapter.read('ENG-123')
 * ```
 */

export { LinearAdapter, type LinearMCPClient } from './adapter.js'
