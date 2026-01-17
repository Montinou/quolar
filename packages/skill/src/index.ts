/**
 * @quolar/skill - Claude Code skill for Quolar
 *
 * This package provides the Claude Code skill implementation
 * for the Quolar test automation workflow.
 *
 * @example
 * ```
 * /test-ticket ENG-123
 * /heal-test tests/login.spec.ts
 * /analyze-failures --last 10
 * ```
 */

export {
  executeTestTicket,
  formatResult,
  type TestTicketArgs,
  type CommandContext,
} from './commands/test-ticket.js'

// Re-export core types for convenience
export type {
  WorkflowResult,
  WorkflowOptions,
  WorkflowProviders,
  QuolarConfig,
} from '@quolar/core'
