import type { Document, PatternResult } from '../types/index.js'

/**
 * DocsProvider interface for documentation systems.
 *
 * Default implementation: Quoth
 * Alternative implementations: Confluence, Notion, GitBook
 */
export interface DocsProvider {
  /**
   * Provider name for identification and logging
   */
  readonly name: string

  /**
   * Search for patterns and documentation
   * @param query - Natural language search query
   * @returns Array of relevant pattern results
   */
  searchPatterns(query: string): Promise<PatternResult[]>

  /**
   * Read full document content
   * @param docId - The document identifier or path
   */
  readDocument(docId: string): Promise<Document>

  /**
   * Propose an update to documentation (optional)
   * @param docId - The document identifier or path
   * @param content - The new content to propose
   */
  proposeUpdate?(docId: string, content: string): Promise<void>
}
