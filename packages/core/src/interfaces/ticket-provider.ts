import type { Ticket, TicketUpdate } from '../types/index.js'

/**
 * TicketProvider interface for ticket management systems.
 *
 * Default implementation: Linear
 * Alternative implementations: Jira, GitHub Issues, Asana
 */
export interface TicketProvider {
  /**
   * Provider name for identification and logging
   */
  readonly name: string

  /**
   * Read ticket details by ID
   * @param ticketId - The unique identifier of the ticket (e.g., "ENG-123")
   */
  read(ticketId: string): Promise<Ticket>

  /**
   * Update ticket status, labels, or add comments
   * @param ticketId - The unique identifier of the ticket
   * @param data - The update data
   */
  update(ticketId: string, data: TicketUpdate): Promise<void>

  /**
   * Link a pull request to the ticket
   * @param ticketId - The unique identifier of the ticket
   * @param prUrl - The URL of the pull request
   */
  linkPR(ticketId: string, prUrl: string): Promise<void>

  /**
   * Extract acceptance criteria from ticket description
   * @param ticketId - The unique identifier of the ticket
   * @returns Array of acceptance criteria strings
   */
  getAcceptanceCriteria(ticketId: string): Promise<string[]>
}
