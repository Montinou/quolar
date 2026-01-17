import type {
  TicketProvider,
  Ticket,
  TicketUpdate,
  TicketStatus,
  TicketPriority,
} from '@quolar/core'

/**
 * MCP Client interface for Linear operations
 */
export interface LinearMCPClient {
  call<T = unknown>(method: string, params: Record<string, unknown>): Promise<T>
}

/**
 * Linear issue response from MCP
 */
interface LinearIssue {
  id: string
  identifier: string
  title: string
  description?: string
  state?: { name: string }
  priority?: number
  labels?: { nodes: Array<{ name: string }> }
  assignee?: { name: string }
}

/**
 * LinearAdapter implements TicketProvider for Linear via MCP.
 *
 * Uses Linear MCP tools:
 * - linear_read_issue
 * - linear_update_issue
 * - linear_add_comment
 */
export class LinearAdapter implements TicketProvider {
  readonly name = 'linear'

  constructor(private mcpClient: LinearMCPClient) {}

  async read(ticketId: string): Promise<Ticket> {
    const issue = await this.mcpClient.call<LinearIssue>('linear_read_issue', {
      id: ticketId,
    })

    return this.mapToTicket(issue)
  }

  async update(ticketId: string, data: TicketUpdate): Promise<void> {
    const updateParams: Record<string, unknown> = { id: ticketId }

    if (data.status) {
      updateParams.stateId = this.mapStatusToLinearState(data.status)
    }

    if (data.labels) {
      updateParams.labelIds = data.labels
    }

    if (data.comment) {
      // Linear uses separate endpoint for comments
      await this.mcpClient.call('linear_add_comment', {
        issueId: ticketId,
        body: data.comment,
      })
    }

    if (Object.keys(updateParams).length > 1) {
      await this.mcpClient.call('linear_update_issue', updateParams)
    }
  }

  async linkPR(ticketId: string, prUrl: string): Promise<void> {
    // Linear auto-links PRs via branch naming or we can add as comment
    await this.mcpClient.call('linear_add_comment', {
      issueId: ticketId,
      body: `Pull Request: ${prUrl}`,
    })
  }

  async getAcceptanceCriteria(ticketId: string): Promise<string[]> {
    const issue = await this.mcpClient.call<LinearIssue>('linear_read_issue', {
      id: ticketId,
    })

    return this.extractAcceptanceCriteria(issue.description || '')
  }

  private mapToTicket(issue: LinearIssue): Ticket {
    return {
      id: issue.identifier || issue.id,
      title: issue.title,
      description: issue.description || '',
      status: this.mapLinearStateToStatus(issue.state?.name),
      priority: this.mapLinearPriority(issue.priority),
      labels: issue.labels?.nodes?.map((l) => l.name) || [],
      assignee: issue.assignee?.name,
      acceptanceCriteria: this.extractAcceptanceCriteria(issue.description || ''),
      metadata: { linearId: issue.id },
    }
  }

  private mapLinearStateToStatus(state?: string): TicketStatus {
    if (!state) return 'backlog'

    const stateMap: Record<string, TicketStatus> = {
      Backlog: 'backlog',
      Todo: 'todo',
      'In Progress': 'in_progress',
      'In Review': 'in_review',
      Done: 'done',
      Canceled: 'cancelled',
      Cancelled: 'cancelled',
    }

    return stateMap[state] || 'backlog'
  }

  private mapStatusToLinearState(status: TicketStatus): string {
    // This would need to be configured per workspace
    // Linear uses UUIDs for state IDs
    const stateMap: Record<TicketStatus, string> = {
      backlog: 'backlog',
      todo: 'todo',
      in_progress: 'in-progress',
      in_review: 'in-review',
      done: 'done',
      cancelled: 'canceled',
    }

    return stateMap[status]
  }

  private mapLinearPriority(priority?: number): TicketPriority {
    if (priority === undefined) return 'none'

    // Linear uses 0-4: 0=no priority, 1=urgent, 2=high, 3=medium, 4=low
    const priorityMap: Record<number, TicketPriority> = {
      0: 'none',
      1: 'urgent',
      2: 'high',
      3: 'medium',
      4: 'low',
    }

    return priorityMap[priority] || 'none'
  }

  private extractAcceptanceCriteria(description: string): string[] {
    const criteria: string[] = []

    // Look for acceptance criteria patterns:
    // - [ ] checkbox items
    // - Numbered list after "Acceptance Criteria" header
    // - Bullet points after "AC:" or "Acceptance Criteria:"

    // Pattern 1: Markdown checkboxes
    const checkboxPattern = /^[-*]\s*\[[ x]\]\s*(.+)$/gm
    let match
    while ((match = checkboxPattern.exec(description)) !== null) {
      criteria.push(match[1].trim())
    }

    // Pattern 2: Section with AC header
    const acSectionPattern =
      /(?:acceptance\s*criteria|ac)[\s:]*\n((?:[-*\d.]\s*.+\n?)+)/gi
    while ((match = acSectionPattern.exec(description)) !== null) {
      const lines = match[1].split('\n')
      for (const line of lines) {
        const cleaned = line.replace(/^[-*\d.)\]]\s*/, '').trim()
        if (cleaned && !criteria.includes(cleaned)) {
          criteria.push(cleaned)
        }
      }
    }

    return criteria
  }
}
