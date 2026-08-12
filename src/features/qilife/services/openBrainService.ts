import { qiApiRequest } from "../../../lib/qiApiClient";
import type { EntityLink, MemoryState, QiBit, QiBitType } from "../types";

export interface MemoryQueryOptions {
  types?: QiBitType[];
  memoryState?: MemoryState;
  queryText?: string;
  limit?: number;
  useVectorSearch?: boolean;
}

/**
 * Open Brain Memory Engine (ADR 0002 & ADR 0006)
 * Manages durable context, memory promotion, provenance graph traversal, and semantic search.
 */
export class OpenBrainService {
  private bits: Map<string, QiBit> = new Map();
  private links: EntityLink[] = [];

  constructor(initialBits: QiBit[] = [], initialLinks: EntityLink[] = []) {
    initialBits.forEach((bit) => this.bits.set(bit.id, bit));
    this.links = [...initialLinks];
  }

  /**
   * Register or update a QiBit in the Open Brain
   */
  public registerBit(bit: QiBit): QiBit {
    const updated: QiBit = {
      ...bit,
      updatedAt: new Date().toISOString(),
      provenance: {
        ...bit.provenance,
        updatedAt: new Date().toISOString(),
      },
    };
    this.bits.set(updated.id, updated);
    return updated;
  }

  /**
   * Retrieve a QiBit by ID
   */
  public getBit(id: string): QiBit | undefined {
    return this.bits.get(id);
  }

  /**
   * Promote a QiBit from transient capture to durable promoted memory
   */
  public promoteMemory(id: string, reasoning?: string): QiBit {
    const bit = this.bits.get(id);
    if (!bit) throw new Error(`QiBit with ID ${id} not found in Open Brain.`);

    const promoted: QiBit = {
      ...bit,
      memoryState: "promoted",
      updatedAt: new Date().toISOString(),
      provenance: {
        ...bit.provenance,
        reasoning: reasoning ?? "Promoted to durable memory",
        updatedAt: new Date().toISOString(),
      },
    };

    this.bits.set(id, promoted);
    return promoted;
  }

  /**
   * Link two QiBits with a typed bi-directional relation
   */
  public createLink(
    sourceBitId: string,
    targetBitId: string,
    relationshipType: EntityLink["relationshipType"],
    sourceType = "qibit",
    targetType = "qibit",
  ): EntityLink {
    const link: EntityLink = {
      id: `link_${Math.random().toString(36).slice(2)}`,
      sourceEntityType: sourceType,
      sourceId: sourceBitId,
      targetEntityType: targetType,
      targetId: targetBitId,
      relationshipType,
      createdAt: new Date().toISOString(),
    };

    this.links.push(link);
    return link;
  }

  /**
   * Retrieve all graph connections for a given QiBit
   */
  public getRelatedBits(bitId: string): { link: EntityLink; bit?: QiBit }[] {
    const relatedLinks = this.links.filter(
      (l) => l.sourceId === bitId || l.targetId === bitId,
    );

    return relatedLinks.map((link) => {
      const otherId = link.sourceId === bitId ? link.targetId : link.sourceId;
      return {
        link,
        bit: this.bits.get(otherId),
      };
    });
  }

  /**
   * Search Open Brain memory using query text and filter criteria
   */
  public searchMemory(options: MemoryQueryOptions = {}): QiBit[] {
    let results = Array.from(this.bits.values()).filter((b) => !b.archivedAt);

    if (options.types && options.types.length > 0) {
      results = results.filter((b) => options.types!.includes(b.type));
    }

    if (options.memoryState) {
      results = results.filter((b) => b.memoryState === options.memoryState);
    }

    if (options.queryText && options.queryText.trim().length > 0) {
      const q = options.queryText.toLowerCase();
      results = results.filter((b) => {
        const titleMatch = b.title.toLowerCase().includes(q);
        const bodyMatch = b.body ? b.body.toLowerCase().includes(q) : false;
        const tagMatch = Array.isArray(b.metadata.tags)
          ? (b.metadata.tags as string[]).some((t) => t.toLowerCase().includes(q))
          : false;
        return titleMatch || bodyMatch || tagMatch;
      });
    }

    results.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    if (options.limit && options.limit > 0) {
      return results.slice(0, options.limit);
    }

    return results;
  }

  /**
   * Performs vector semantic retrieval against centralized 251_QiApi with local fallback
   */
  public async searchMemoryVector(queryText: string, limit = 5): Promise<QiBit[]> {
    try {
      const remoteResults = await qiApiRequest<QiBit[]>(
        `/v1/brain/search?query=${encodeURIComponent(queryText)}&limit=${limit}`,
      );
      if (Array.isArray(remoteResults) && remoteResults.length > 0) {
        return remoteResults;
      }
    } catch {
      // Fallback to in-memory search if offline or remote API unconfigured
    }
    return this.searchMemory({ queryText, limit });
  }

  /**
   * Get all active promoted memories
   */
  public getPromotedMemories(): QiBit[] {
    return this.searchMemory({ memoryState: "promoted" });
  }
}
