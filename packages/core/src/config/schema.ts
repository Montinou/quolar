import { z } from 'zod'

/**
 * Zod schema for Quolar configuration validation
 */

export const testFrameworkConfigSchema = z.object({
  provider: z.enum(['playwright', 'vitest', 'cypress', 'custom']),
  config: z.string().optional(),
  testDir: z.string().default('./tests'),
  pageObjectsDir: z.string().optional(),
})

export const ticketsConfigSchema = z.object({
  provider: z.enum(['linear', 'jira', 'github-issues', 'custom']),
  workspace: z.string().optional(), // Linear
  projectKey: z.string().optional(), // Jira
  owner: z.string().optional(), // GitHub Issues
  repo: z.string().optional(), // GitHub Issues
})

export const documentationConfigSchema = z
  .object({
    provider: z.enum(['quoth', 'custom']).nullable(),
    endpoint: z.string().url().optional(),
  })
  .nullable()
  .optional()

export const analyticsConfigSchema = z
  .object({
    provider: z.enum(['exolar', 'datadog', 'custom']).nullable(),
    endpoint: z.string().url().optional(),
  })
  .nullable()
  .optional()

export const vcsConfigSchema = z
  .object({
    provider: z.enum(['github', 'gitlab', 'bitbucket']).default('github'),
    ciSystem: z.enum(['github-actions', 'gitlab-ci', 'jenkins']).optional(),
  })
  .optional()

export const workflowConfigSchema = z
  .object({
    maxRetries: z.number().int().min(0).max(10).default(3),
    autoHealingThreshold: z.number().min(0).max(100).default(70),
    parallelAgents: z.number().int().min(1).max(10).default(3),
  })
  .optional()

export const quolarConfigSchema = z.object({
  testFramework: testFrameworkConfigSchema,
  tickets: ticketsConfigSchema,
  documentation: documentationConfigSchema,
  analytics: analyticsConfigSchema,
  vcs: vcsConfigSchema,
  workflow: workflowConfigSchema,
})

export type QuolarConfig = z.infer<typeof quolarConfigSchema>
export type TestFrameworkConfig = z.infer<typeof testFrameworkConfigSchema>
export type TicketsConfig = z.infer<typeof ticketsConfigSchema>
export type DocumentationConfig = z.infer<typeof documentationConfigSchema>
export type AnalyticsConfig = z.infer<typeof analyticsConfigSchema>
export type VCSConfig = z.infer<typeof vcsConfigSchema>
export type WorkflowConfig = z.infer<typeof workflowConfigSchema>
