import type { DocsProvider, Document, PatternResult } from '@quolar/core'

/**
 * MCP Client interface for Quoth operations
 */
export interface QuothMCPClient {
  call<T = unknown>(method: string, params: Record<string, unknown>): Promise<T>
}

/**
 * Quoth search result from MCP
 */
interface QuothSearchResult {
  chunks: Array<{
    id: string
    title: string
    content: string
    similarity: number
    doc_id: string
  }>
}

/**
 * Quoth document from MCP
 */
interface QuothDocument {
  id: string
  title: string
  content: string
  path: string
  frontmatter?: {
    category?: string
    tags?: string[]
    updated?: string
  }
}

/**
 * QuothAdapter implements DocsProvider for Quoth via MCP.
 *
 * Uses Quoth MCP tools:
 * - quoth_search_index
 * - quoth_read_doc
 * - quoth_propose_update
 */
export class QuothAdapter implements DocsProvider {
  readonly name = 'quoth'

  constructor(private mcpClient: QuothMCPClient) {}

  async searchPatterns(query: string): Promise<PatternResult[]> {
    const result = await this.mcpClient.call<QuothSearchResult>('quoth_search_index', {
      query,
    })

    return result.chunks.map((chunk) => ({
      id: chunk.id,
      title: chunk.title,
      relevance: chunk.similarity,
      snippet: chunk.content.substring(0, 200),
      documentId: chunk.doc_id,
    }))
  }

  async readDocument(docId: string): Promise<Document> {
    const doc = await this.mcpClient.call<QuothDocument>('quoth_read_doc', {
      doc_id: docId,
    })

    return {
      id: doc.id,
      title: doc.title,
      content: doc.content,
      path: doc.path,
      category: doc.frontmatter?.category || 'uncategorized',
      tags: doc.frontmatter?.tags || [],
      lastUpdated: doc.frontmatter?.updated ? new Date(doc.frontmatter.updated) : new Date(),
    }
  }

  async proposeUpdate(docId: string, content: string): Promise<void> {
    await this.mcpClient.call('quoth_propose_update', {
      doc_id: docId,
      new_content: content,
      evidence_snippet: 'Automated update from Quolar',
      reasoning: 'Documentation update based on test automation patterns',
    })
  }
}
