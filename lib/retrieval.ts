// src/lib/retrieval.ts
import { db } from "@/lib/db-config";
import { documents } from "@/lib/db-schema";
import { generateEmbedding } from "@/lib/embeddings";
import { sql } from "drizzle-orm";

export async function findRelevantDocuments(query: string, limit: number = 5) {
  try {
    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);
    
    // Convert the embedding array to the proper format for PostgreSQL
    // This creates a string like '[0.1, 0.2, 0.3, ...]'::vector
    const embeddingString = `[${queryEmbedding.join(',')}]`;
    
    // Search for similar documents using cosine similarity
    const results = await db
      .select({
        id: documents.id,
        content: documents.content,
        similarity: sql<number>`1 - (${documents.embedding} <=> ${sql.raw(embeddingString)}::vector)`
      })
      .from(documents)
      .orderBy(sql`${documents.embedding} <=> ${sql.raw(embeddingString)}::vector`)
      .limit(limit);
    
    console.log(`Found ${results.length} relevant documents for query: "${query}"`);
    results.forEach((doc, index) => {
      console.log(`Doc ${index + 1}: Similarity ${doc.similarity?.toFixed(4)}`);
    });
    
    return results;
  } catch (error) {
    console.error("Error in document retrieval:", error);
    throw new Error(`Failed to retrieve documents: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}