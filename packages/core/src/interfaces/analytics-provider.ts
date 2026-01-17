import type {
  TestFailure,
  Classification,
  TestResults,
  SimilarFailure,
  FlakinessData,
} from '../types/index.js'

/**
 * AnalyticsProvider interface for test analytics systems.
 *
 * Default implementation: Exolar
 * Alternative implementations: DataDog, Allure, ReportPortal
 */
export interface AnalyticsProvider {
  /**
   * Provider name for identification and logging
   */
  readonly name: string

  /**
   * Classify a test failure
   * @param failure - The test failure to classify
   * @returns Classification with category, confidence, and suggestions
   */
  classifyFailure(failure: TestFailure): Promise<Classification>

  /**
   * Report test execution results
   * @param results - The test results to report
   */
  reportResults(results: TestResults): Promise<void>

  /**
   * Find similar failures in history
   * @param error - The error message to search for
   * @returns Array of similar failures with resolutions
   */
  findSimilarFailures(error: string): Promise<SimilarFailure[]>

  /**
   * Get flakiness data for a test
   * @param testSignature - Unique test identifier (file:testName)
   * @returns Flakiness statistics
   */
  getFlakiness(testSignature: string): Promise<FlakinessData>
}
