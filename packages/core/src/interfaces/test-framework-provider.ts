import type {
  FrameworkConfig,
  TestPlan,
  ExecutionConfig,
  TestResults,
  TestFailure,
  HealResult,
} from '../types/index.js'

/**
 * TestFrameworkProvider interface for test frameworks.
 *
 * Default implementation: Playwright
 * Alternative implementations: Vitest, Cypress, WebdriverIO
 */
export interface TestFrameworkProvider {
  /**
   * Provider name for identification and logging
   */
  readonly name: string

  /**
   * Detect and return framework configuration
   * @returns Framework configuration details
   */
  detect(): Promise<FrameworkConfig>

  /**
   * Generate test code from a test plan
   * @param plan - The test plan to generate code for
   * @returns Generated test code as a string
   */
  generateTest(plan: TestPlan): Promise<string>

  /**
   * Execute tests with given configuration
   * @param config - Execution configuration options
   * @returns Test execution results
   */
  execute(config: ExecutionConfig): Promise<TestResults>

  /**
   * Attempt to heal a failing test
   * @param failure - The test failure to heal
   * @returns Heal result with new selector and confidence
   */
  heal(failure: TestFailure): Promise<HealResult>

  /**
   * Get the template for generating tests (optional)
   * @returns Template string (e.g., Handlebars template)
   */
  getTemplate?(): Promise<string>
}
