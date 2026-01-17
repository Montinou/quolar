import type {
  TestFrameworkProvider,
  FrameworkConfig,
  TestPlan,
  ExecutionConfig,
  TestResults,
  TestFailure,
  HealResult,
} from '@quolar/core'

/**
 * Shell executor interface for running playwright commands
 */
export interface ShellExecutor {
  exec(command: string): Promise<{ stdout: string; stderr: string; exitCode: number }>
}

/**
 * File system interface for reading/writing test files
 */
export interface FileSystem {
  readFile(path: string): Promise<string>
  writeFile(path: string, content: string): Promise<void>
  exists(path: string): Promise<boolean>
}

/**
 * PlaywrightAdapter implements TestFrameworkProvider for Playwright.
 */
export class PlaywrightAdapter implements TestFrameworkProvider {
  readonly name = 'playwright'

  constructor(
    private shell: ShellExecutor,
    private fs: FileSystem,
    private workingDir: string
  ) {}

  async detect(): Promise<FrameworkConfig> {
    // Check for playwright config files
    const configFiles = [
      'playwright.config.ts',
      'playwright.config.js',
      'playwright.config.mjs',
    ]

    for (const configFile of configFiles) {
      const configPath = `${this.workingDir}/${configFile}`
      if (await this.fs.exists(configPath)) {
        return {
          name: 'playwright',
          configPath,
          testDir: './tests', // Could parse from config
        }
      }
    }

    return {
      name: 'playwright',
      configPath: `${this.workingDir}/playwright.config.ts`,
      testDir: './tests',
    }
  }

  async generateTest(plan: TestPlan): Promise<string> {
    const template = await this.getTemplate()
    return this.applyTemplate(template, plan)
  }

  async execute(config: ExecutionConfig): Promise<TestResults> {
    const args = ['npx', 'playwright', 'test', '--reporter=json']

    if (config.testFiles && config.testFiles.length > 0) {
      args.push(...config.testFiles)
    }

    if (config.grep) {
      args.push(`--grep="${config.grep}"`)
    }

    if (config.workers !== undefined) {
      args.push(`--workers=${config.workers}`)
    }

    if (config.retries !== undefined) {
      args.push(`--retries=${config.retries}`)
    }

    if (config.timeout !== undefined) {
      args.push(`--timeout=${config.timeout}`)
    }

    if (config.headed) {
      args.push('--headed')
    }

    const result = await this.shell.exec(args.join(' '))

    return this.parseResults(result.stdout, result.exitCode)
  }

  async heal(failure: TestFailure): Promise<HealResult> {
    // Extract selector from error if possible
    const selectorMatch = failure.error.match(/locator\(['"]([^'"]+)['"]\)/)
    if (!selectorMatch) {
      return {
        success: false,
        originalSelector: 'unknown',
        confidence: 0,
        explanation: 'Could not extract selector from error',
      }
    }

    const originalSelector = selectorMatch[1]

    // Try alternative selectors (simplified healing logic)
    const alternatives = this.generateAlternativeSelectors(originalSelector)

    // In a real implementation, we would:
    // 1. Take a screenshot or use the page snapshot
    // 2. Use AI to find the element
    // 3. Generate a more robust selector

    if (alternatives.length > 0) {
      return {
        success: true,
        originalSelector,
        newSelector: alternatives[0],
        confidence: 60, // Low confidence without actual verification
        explanation: `Suggested alternative selector: ${alternatives[0]}`,
      }
    }

    return {
      success: false,
      originalSelector,
      confidence: 0,
      explanation: 'No alternative selectors found',
    }
  }

  async getTemplate(): Promise<string> {
    return `import { test, expect } from '@playwright/test'

test.describe('{{name}}', () => {
  {{#each steps}}
  test('{{this.assertion}}', async ({ page }) => {
    // TODO: Implement test step
    {{#if this.selector}}
    await page.locator('{{this.selector}}').{{this.action}}({{#if this.value}}'{{this.value}}'{{/if}})
    {{/if}}
    {{#if this.screenshot}}
    await page.screenshot({ path: 'screenshots/{{../name}}-step-{{@index}}.png' })
    {{/if}}
  })
  {{/each}}
})
`
  }

  private applyTemplate(template: string, plan: TestPlan): string {
    // Simple template replacement (in production, use Handlebars)
    let result = template.replace(/\{\{name\}\}/g, plan.name)

    // Generate test cases from steps
    const testCases = plan.steps
      .map((step, index) => {
        return `  test('${step.assertion || `step ${index + 1}`}', async ({ page }) => {
    // Action: ${step.action}
    ${step.selector ? `await page.locator('${step.selector}').${step.action}(${step.value ? `'${step.value}'` : ''})` : '// TODO: Implement'}
    ${step.screenshot ? `await page.screenshot({ path: 'screenshots/${plan.name}-step-${index}.png' })` : ''}
  })`
      })
      .join('\n\n')

    result = `import { test, expect } from '@playwright/test'

test.describe('${plan.name}', () => {
${testCases}
})
`

    return result
  }

  private parseResults(output: string, exitCode: number): TestResults {
    try {
      const json = JSON.parse(output)
      const failures: TestFailure[] = []

      // Parse Playwright JSON report format
      for (const suite of json.suites || []) {
        for (const spec of suite.specs || []) {
          for (const test of spec.tests || []) {
            if (test.status === 'failed' || test.status === 'timedOut') {
              failures.push({
                testName: `${suite.title} > ${spec.title}`,
                error: test.results?.[0]?.error?.message || 'Unknown error',
                stackTrace: test.results?.[0]?.error?.stack,
                timestamp: new Date(),
              })
            }
          }
        }
      }

      return {
        testSuite: 'playwright',
        passed: json.stats?.expected || 0,
        failed: json.stats?.unexpected || 0,
        skipped: json.stats?.skipped || 0,
        duration: json.stats?.duration || 0,
        failures,
        timestamp: new Date(),
      }
    } catch {
      // If JSON parsing fails, estimate from exit code
      return {
        testSuite: 'playwright',
        passed: exitCode === 0 ? 1 : 0,
        failed: exitCode !== 0 ? 1 : 0,
        skipped: 0,
        duration: 0,
        failures:
          exitCode !== 0
            ? [
                {
                  testName: 'unknown',
                  error: output || 'Test execution failed',
                  timestamp: new Date(),
                },
              ]
            : [],
        timestamp: new Date(),
      }
    }
  }

  private generateAlternativeSelectors(original: string): string[] {
    const alternatives: string[] = []

    // If it's an ID selector, try data-testid
    if (original.startsWith('#')) {
      const id = original.slice(1)
      alternatives.push(`[data-testid="${id}"]`)
      alternatives.push(`[data-test="${id}"]`)
    }

    // If it's a class selector, try text content or role
    if (original.startsWith('.')) {
      // Could use AI to determine text content
      alternatives.push(`role=button[name="${original}"]`)
    }

    // If it's an attribute selector, try alternative attributes
    if (original.includes('[') && original.includes(']')) {
      const attrMatch = original.match(/\[([^=]+)=["']([^"']+)["']\]/)
      if (attrMatch) {
        const [, attr, value] = attrMatch
        if (attr !== 'data-testid') {
          alternatives.push(`[data-testid="${value}"]`)
        }
        if (attr !== 'aria-label') {
          alternatives.push(`[aria-label="${value}"]`)
        }
      }
    }

    return alternatives
  }
}
