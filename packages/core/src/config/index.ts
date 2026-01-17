/**
 * Configuration module for Quolar
 */

export {
  quolarConfigSchema,
  testFrameworkConfigSchema,
  ticketsConfigSchema,
  documentationConfigSchema,
  analyticsConfigSchema,
  vcsConfigSchema,
  workflowConfigSchema,
  type QuolarConfig,
  type TestFrameworkConfig,
  type TicketsConfig,
  type DocumentationConfig,
  type AnalyticsConfig,
  type VCSConfig,
  type WorkflowConfig,
} from './schema.js'

export {
  validateConfig,
  mergeWithDefaults,
  defaultConfig,
  CONFIG_FILE_NAMES,
  type LoadConfigOptions,
  type LoadConfigResult,
  type ConfigError,
} from './loader.js'

import type { QuolarConfig } from './schema.js'

/**
 * Define Quolar configuration with type safety
 *
 * @example
 * ```typescript
 * // quolar.config.ts
 * import { defineConfig } from '@quolar/core'
 *
 * export default defineConfig({
 *   testFramework: {
 *     provider: 'playwright',
 *     testDir: './tests',
 *   },
 *   tickets: {
 *     provider: 'linear',
 *     workspace: 'my-workspace',
 *   },
 * })
 * ```
 */
export function defineConfig(config: QuolarConfig): QuolarConfig {
  return config
}
