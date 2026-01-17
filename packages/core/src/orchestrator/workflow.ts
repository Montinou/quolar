import type {
  TicketProvider,
  DocsProvider,
  AnalyticsProvider,
  VCSProvider,
  TestFrameworkProvider,
} from '../interfaces/index.js'
import type { QuolarConfig } from '../config/schema.js'
import type { WorkflowContext, WorkflowStep, WorkflowError } from '../types/index.js'

/**
 * Providers container for the workflow
 */
export interface WorkflowProviders {
  ticket: TicketProvider
  docs?: DocsProvider
  analytics?: AnalyticsProvider
  vcs: VCSProvider
  testFramework: TestFrameworkProvider
}

/**
 * Workflow execution options
 */
export interface WorkflowOptions {
  ticketId: string
  dryRun?: boolean
  skipPR?: boolean
  maxRetries?: number
}

/**
 * Workflow step result
 */
export interface StepResult {
  step: WorkflowStep
  success: boolean
  message: string
  duration: number
  data?: unknown
}

/**
 * Workflow execution result
 */
export interface WorkflowResult {
  success: boolean
  context: WorkflowContext
  steps: StepResult[]
  totalDuration: number
}

/**
 * WorkflowOrchestrator coordinates the test automation workflow.
 *
 * The 7-step workflow:
 * 1. Analyze ticket - Parse ticket and extract acceptance criteria
 * 2. Search patterns - Find relevant documentation and patterns
 * 3. Generate test plan - Create structured test plan
 * 4. Generate code - Generate test code from plan
 * 5. Execute tests - Run the generated tests
 * 6. Heal failures - Auto-heal failing tests if possible
 * 7. Create PR - Create pull request with results
 */
export class WorkflowOrchestrator {
  private providers: WorkflowProviders
  private config: QuolarConfig
  private steps: StepResult[] = []

  constructor(providers: WorkflowProviders, config: QuolarConfig) {
    this.providers = providers
    this.config = config
  }

  /**
   * Execute the full workflow
   */
  async execute(options: WorkflowOptions): Promise<WorkflowResult> {
    const startTime = Date.now()
    const context: WorkflowContext = {
      ticketId: options.ticketId,
      ticket: null!,
      errors: [],
    }

    try {
      // Step 1: Analyze ticket
      await this.runStep('analyze_ticket', context, async () => {
        context.ticket = await this.providers.ticket.read(options.ticketId)
        const criteria = await this.providers.ticket.getAcceptanceCriteria(options.ticketId)
        context.ticket.acceptanceCriteria = criteria
        return { ticket: context.ticket }
      })

      // Step 2: Search patterns (optional)
      if (this.providers.docs) {
        await this.runStep('search_patterns', context, async () => {
          const patterns = await this.providers.docs!.searchPatterns(context.ticket.title)
          return { patternsFound: patterns.length }
        })
      }

      // Step 3: Generate test plan
      await this.runStep('generate_test_plan', context, async () => {
        const plan = {
          name: `test-${context.ticketId.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
          description: context.ticket.title,
          steps: context.ticket.acceptanceCriteria.map((ac) => ({
            action: 'verify',
            assertion: ac,
          })),
          fixtures: [],
          tags: context.ticket.labels,
        }
        context.testPlan = plan
        return { plan }
      })

      // Step 4: Generate code
      await this.runStep('generate_code', context, async () => {
        if (!context.testPlan) {
          throw new Error('Test plan not generated')
        }
        const code = await this.providers.testFramework.generateTest(context.testPlan)
        context.generatedCode = code
        return { codeLength: code.length }
      })

      if (!options.dryRun) {
        // Step 5: Execute tests
        await this.runStep('execute_tests', context, async () => {
          const results = await this.providers.testFramework.execute({})
          context.testResults = results
          return { passed: results.passed, failed: results.failed }
        })

        // Step 6: Heal failures (if any and confidence is high enough)
        if (context.testResults && context.testResults.failed > 0) {
          const threshold = this.config.workflow?.autoHealingThreshold ?? 70
          await this.runStep('heal_failures', context, async () => {
            const healed: string[] = []
            for (const failure of context.testResults!.failures) {
              const result = await this.providers.testFramework.heal(failure)
              if (result.success && result.confidence >= threshold) {
                healed.push(failure.testName)
              }
            }
            return { healedTests: healed }
          })
        }

        // Step 7: Create PR (unless skipped)
        if (!options.skipPR) {
          await this.runStep('create_pr', context, async () => {
            const branchName = `test/${context.ticketId.toLowerCase()}`
            await this.providers.vcs.createBranch(branchName)
            await this.providers.vcs.commit(`test(${context.ticketId}): add automated tests`, [
              // TODO: actual file paths
            ])
            await this.providers.vcs.push(branchName)
            const pr = await this.providers.vcs.createPR({
              title: `test(${context.ticketId}): ${context.ticket.title}`,
              body: this.generatePRBody(context),
              branch: branchName,
            })
            context.prResult = pr
            await this.providers.ticket.linkPR(context.ticketId, pr.url)
            return { prUrl: pr.url }
          })
        }

        // Report results (optional)
        if (this.providers.analytics && context.testResults) {
          await this.runStep('report_results', context, async () => {
            await this.providers.analytics!.reportResults(context.testResults!)
            return { reported: true }
          })
        }
      }

      return {
        success: context.errors.length === 0,
        context,
        steps: this.steps,
        totalDuration: Date.now() - startTime,
      }
    } catch (error) {
      context.errors.push({
        step: 'workflow',
        message: error instanceof Error ? error.message : String(error),
        recoverable: false,
        timestamp: new Date(),
      })

      return {
        success: false,
        context,
        steps: this.steps,
        totalDuration: Date.now() - startTime,
      }
    }
  }

  private async runStep(
    step: WorkflowStep,
    context: WorkflowContext,
    fn: () => Promise<unknown>
  ): Promise<void> {
    const startTime = Date.now()
    try {
      const data = await fn()
      this.steps.push({
        step,
        success: true,
        message: `${step} completed`,
        duration: Date.now() - startTime,
        data,
      })
    } catch (error) {
      const workflowError: WorkflowError = {
        step,
        message: error instanceof Error ? error.message : String(error),
        recoverable: this.isRecoverable(step),
        timestamp: new Date(),
      }
      context.errors.push(workflowError)
      this.steps.push({
        step,
        success: false,
        message: workflowError.message,
        duration: Date.now() - startTime,
      })

      if (!workflowError.recoverable) {
        throw error
      }
    }
  }

  private isRecoverable(step: WorkflowStep): boolean {
    // These steps are recoverable (workflow can continue)
    const recoverableSteps: WorkflowStep[] = ['search_patterns', 'heal_failures', 'report_results']
    return recoverableSteps.includes(step)
  }

  private generatePRBody(context: WorkflowContext): string {
    const results = context.testResults
    const testSummary = results
      ? `- Passed: ${results.passed}\n- Failed: ${results.failed}\n- Skipped: ${results.skipped}`
      : 'Tests not executed (dry run)'

    return `## Summary
Automated tests generated for ticket ${context.ticketId}

## Test Results
${testSummary}

## Acceptance Criteria Covered
${context.ticket.acceptanceCriteria.map((ac) => `- [ ] ${ac}`).join('\n')}

---
Generated by [Quolar](https://github.com/Montinou/quolar)`
  }
}
