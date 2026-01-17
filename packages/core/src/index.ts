/**
 * @quolar/core - Core workflow orchestrator and provider interfaces
 *
 * @example
 * ```typescript
 * import { defineConfig, WorkflowOrchestrator } from '@quolar/core'
 * import type { TicketProvider, TestFrameworkProvider } from '@quolar/core/interfaces'
 * ```
 */

// Configuration
export { defineConfig } from './config/index.js'
export {
  quolarConfigSchema,
  validateConfig,
  mergeWithDefaults,
  defaultConfig,
  CONFIG_FILE_NAMES,
  type QuolarConfig,
  type TestFrameworkConfig,
  type TicketsConfig,
  type DocumentationConfig,
  type AnalyticsConfig,
  type VCSConfig,
  type WorkflowConfig,
  type LoadConfigOptions,
  type LoadConfigResult,
  type ConfigError,
} from './config/index.js'

// Orchestrator
export {
  WorkflowOrchestrator,
  type WorkflowProviders,
  type WorkflowOptions,
  type StepResult,
  type WorkflowResult,
} from './orchestrator/index.js'

// Types
export type {
  Ticket,
  TicketStatus,
  TicketPriority,
  TicketUpdate,
  Document,
  PatternResult,
  TestFailure,
  Classification,
  FailureCategory,
  TestResults,
  SimilarFailure,
  FlakinessData,
  PROptions,
  PRResult,
  FrameworkConfig,
  TestPlan,
  TestStep,
  ExecutionConfig,
  HealResult,
  WorkflowContext,
  WorkflowError,
  WorkflowStep,
} from './types/index.js'

// Re-export interfaces (for convenience)
export type {
  TicketProvider,
  DocsProvider,
  AnalyticsProvider,
  VCSProvider,
  TestFrameworkProvider,
} from './interfaces/index.js'
