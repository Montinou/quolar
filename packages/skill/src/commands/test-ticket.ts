/**
 * /test-ticket command implementation
 *
 * This command orchestrates the full test automation workflow:
 * 1. Analyze Linear ticket
 * 2. Search Quoth for patterns
 * 3. Generate test plan
 * 4. Generate Playwright tests
 * 5. Execute tests
 * 6. Auto-heal failures
 * 7. Create PR
 */

import type {
  WorkflowOptions,
  WorkflowResult,
  WorkflowProviders,
  QuolarConfig,
} from '@quolar/core'
import { WorkflowOrchestrator } from '@quolar/core'

export interface TestTicketArgs {
  ticketId: string
  dryRun?: boolean
  skipPr?: boolean
  verbose?: boolean
}

export interface CommandContext {
  providers: WorkflowProviders
  config: QuolarConfig
  log: (message: string) => void
}

/**
 * Execute the test-ticket command
 */
export async function executeTestTicket(
  args: TestTicketArgs,
  context: CommandContext
): Promise<WorkflowResult> {
  const { ticketId, dryRun, skipPr, verbose } = args
  const { providers, config, log } = context

  if (verbose) {
    log(`Starting workflow for ticket: ${ticketId}`)
    log(`Dry run: ${dryRun ? 'yes' : 'no'}`)
    log(`Skip PR: ${skipPr ? 'yes' : 'no'}`)
  }

  const orchestrator = new WorkflowOrchestrator(providers, config)

  const options: WorkflowOptions = {
    ticketId,
    dryRun,
    skipPR: skipPr,
    maxRetries: config.workflow?.maxRetries,
  }

  const result = await orchestrator.execute(options)

  if (verbose) {
    log(`\nWorkflow completed in ${result.totalDuration}ms`)
    log(`Success: ${result.success}`)
    log(`Steps completed: ${result.steps.length}`)

    for (const step of result.steps) {
      const status = step.success ? '✓' : '✗'
      log(`  ${status} ${step.step} (${step.duration}ms)`)
      if (!step.success) {
        log(`    Error: ${step.message}`)
      }
    }
  }

  return result
}

/**
 * Format workflow result for display
 */
export function formatResult(result: WorkflowResult): string {
  const lines: string[] = []

  if (result.success) {
    lines.push('## Test Automation Complete')
    lines.push('')
    lines.push(`**Ticket:** ${result.context.ticketId}`)
    lines.push(`**Duration:** ${result.totalDuration}ms`)
  } else {
    lines.push('## Test Automation Failed')
    lines.push('')
    lines.push('### Errors')
    for (const error of result.context.errors) {
      lines.push(`- **${error.step}:** ${error.message}`)
    }
  }

  lines.push('')
  lines.push('### Workflow Steps')

  for (const step of result.steps) {
    const icon = step.success ? '✅' : '❌'
    lines.push(`${icon} ${step.step} (${step.duration}ms)`)
  }

  if (result.context.prResult) {
    lines.push('')
    lines.push(`### Pull Request`)
    lines.push(`[${result.context.prResult.url}](${result.context.prResult.url})`)
  }

  if (result.context.testResults) {
    const tr = result.context.testResults
    lines.push('')
    lines.push('### Test Results')
    lines.push(`- Passed: ${tr.passed}`)
    lines.push(`- Failed: ${tr.failed}`)
    lines.push(`- Skipped: ${tr.skipped}`)
  }

  return lines.join('\n')
}
