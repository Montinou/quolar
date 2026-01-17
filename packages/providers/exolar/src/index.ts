/**
 * @quolar/provider-exolar - Exolar analytics provider
 *
 * @example
 * ```typescript
 * import { ExolarAdapter } from '@quolar/provider-exolar'
 *
 * const adapter = new ExolarAdapter(mcpClient)
 * const classification = await adapter.classifyFailure(failure)
 * ```
 */

export { ExolarAdapter, type ExolarMCPClient } from './adapter.js'
