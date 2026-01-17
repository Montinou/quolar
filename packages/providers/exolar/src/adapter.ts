import type {
  AnalyticsProvider,
  TestFailure,
  Classification,
  TestResults,
  SimilarFailure,
  FlakinessData,
  FailureCategory,
} from '@quolar/core'

/**
 * MCP Client interface for Exolar operations
 */
export interface ExolarMCPClient {
  call<T = unknown>(method: string, params: Record<string, unknown>): Promise<T>
}

/**
 * Exolar classification response
 */
interface ExolarClassification {
  category: string
  confidence: number
  suggestion: string
  related_ids: string[]
}

/**
 * Exolar similar failure response
 */
interface ExolarSimilarFailure {
  test_name: string
  error: string
  similarity: number
  resolution?: string
}

/**
 * Exolar flakiness response
 */
interface ExolarFlakinessData {
  test_signature: string
  flakiness_score: number
  total_runs: number
  failed_runs: number
  last_failure?: string
}

/**
 * ExolarAdapter implements AnalyticsProvider for Exolar via MCP.
 *
 * Uses Exolar MCP tools:
 * - query_exolar_data
 * - perform_exolar_action
 */
export class ExolarAdapter implements AnalyticsProvider {
  readonly name = 'exolar'

  constructor(private mcpClient: ExolarMCPClient) {}

  async classifyFailure(failure: TestFailure): Promise<Classification> {
    const result = await this.mcpClient.call<ExolarClassification>('query_exolar_data', {
      operation: 'classify_failure',
      data: {
        test_name: failure.testName,
        error: failure.error,
        stack_trace: failure.stackTrace,
      },
    })

    return {
      category: this.mapCategory(result.category),
      confidence: result.confidence,
      suggestion: result.suggestion,
      relatedFailures: result.related_ids,
    }
  }

  async reportResults(results: TestResults): Promise<void> {
    await this.mcpClient.call('perform_exolar_action', {
      action: 'report_test_results',
      data: {
        test_suite: results.testSuite,
        passed: results.passed,
        failed: results.failed,
        skipped: results.skipped,
        duration: results.duration,
        failures: results.failures.map((f) => ({
          test_name: f.testName,
          error: f.error,
          stack_trace: f.stackTrace,
          screenshot: f.screenshot,
        })),
        timestamp: results.timestamp.toISOString(),
      },
    })
  }

  async findSimilarFailures(error: string): Promise<SimilarFailure[]> {
    const result = await this.mcpClient.call<{ failures: ExolarSimilarFailure[] }>(
      'query_exolar_data',
      {
        operation: 'find_similar_failures',
        data: { error },
      }
    )

    return result.failures.map((f) => ({
      testName: f.test_name,
      error: f.error,
      similarity: f.similarity,
      resolution: f.resolution,
    }))
  }

  async getFlakiness(testSignature: string): Promise<FlakinessData> {
    const result = await this.mcpClient.call<ExolarFlakinessData>('query_exolar_data', {
      operation: 'get_flakiness',
      data: { test_signature: testSignature },
    })

    return {
      testSignature: result.test_signature,
      flakinessScore: result.flakiness_score,
      totalRuns: result.total_runs,
      failedRuns: result.failed_runs,
      lastFailure: result.last_failure ? new Date(result.last_failure) : undefined,
    }
  }

  private mapCategory(category: string): FailureCategory {
    const categoryMap: Record<string, FailureCategory> = {
      element_not_found: 'element_not_found',
      timeout: 'timeout',
      assertion_failed: 'assertion_failed',
      network_error: 'network_error',
      authentication: 'authentication',
      data_mismatch: 'data_mismatch',
      flaky: 'flaky',
    }

    return categoryMap[category] || 'unknown'
  }
}
