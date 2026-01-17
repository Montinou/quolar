/**
 * Core type definitions for Quolar
 */

// Ticket-related types
export interface Ticket {
  id: string
  title: string
  description: string
  status: TicketStatus
  priority: TicketPriority
  labels: string[]
  assignee?: string
  acceptanceCriteria: string[]
  metadata: Record<string, unknown>
}

export type TicketStatus = 'backlog' | 'todo' | 'in_progress' | 'in_review' | 'done' | 'cancelled'

export type TicketPriority = 'urgent' | 'high' | 'medium' | 'low' | 'none'

export interface TicketUpdate {
  status?: TicketStatus
  labels?: string[]
  comment?: string
  metadata?: Record<string, unknown>
}

// Documentation-related types
export interface Document {
  id: string
  title: string
  content: string
  path: string
  category: string
  tags: string[]
  lastUpdated: Date
}

export interface PatternResult {
  id: string
  title: string
  relevance: number
  snippet: string
  documentId: string
}

// Analytics-related types
export interface TestFailure {
  testName: string
  error: string
  stackTrace?: string
  screenshot?: string
  timestamp: Date
}

export interface Classification {
  category: FailureCategory
  confidence: number
  suggestion: string
  relatedFailures: string[]
}

export type FailureCategory =
  | 'element_not_found'
  | 'timeout'
  | 'assertion_failed'
  | 'network_error'
  | 'authentication'
  | 'data_mismatch'
  | 'flaky'
  | 'unknown'

export interface TestResults {
  testSuite: string
  passed: number
  failed: number
  skipped: number
  duration: number
  failures: TestFailure[]
  timestamp: Date
}

export interface SimilarFailure {
  testName: string
  error: string
  similarity: number
  resolution?: string
}

export interface FlakinessData {
  testSignature: string
  flakinessScore: number
  totalRuns: number
  failedRuns: number
  lastFailure?: Date
}

// VCS-related types
export interface PROptions {
  title: string
  body: string
  branch: string
  baseBranch?: string
  draft?: boolean
  labels?: string[]
  reviewers?: string[]
}

export interface PRResult {
  url: string
  number: number
  branch: string
}

// Test Framework-related types
export interface FrameworkConfig {
  name: string
  configPath: string
  testDir: string
  baseUrl?: string
}

export interface TestPlan {
  name: string
  description: string
  steps: TestStep[]
  fixtures: string[]
  tags: string[]
}

export interface TestStep {
  action: string
  selector?: string
  value?: string
  assertion?: string
  screenshot?: boolean
}

export interface ExecutionConfig {
  testFiles?: string[]
  grep?: string
  workers?: number
  retries?: number
  timeout?: number
  headed?: boolean
}

export interface HealResult {
  success: boolean
  originalSelector: string
  newSelector?: string
  confidence: number
  explanation: string
}

// Workflow types
export interface WorkflowContext {
  ticketId: string
  ticket: Ticket
  testPlan?: TestPlan
  generatedCode?: string
  testResults?: TestResults
  prResult?: PRResult
  errors: WorkflowError[]
}

export interface WorkflowError {
  step: string
  message: string
  recoverable: boolean
  timestamp: Date
}

export type WorkflowStep =
  | 'analyze_ticket'
  | 'search_patterns'
  | 'generate_test_plan'
  | 'generate_code'
  | 'execute_tests'
  | 'heal_failures'
  | 'create_pr'
  | 'report_results'
