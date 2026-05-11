// lib/search.ts
import { db } from './db-config';
import { documents } from './db-schema';
import { generateEmbedding } from './embeddings';
import { sql } from 'drizzle-orm';

export async function searchDocuments(query: string, limit: number = 5, similarityThreshold: number = 0.5) {
  try {
    console.log('Searching for:', query);
    
    // Generate embedding from the query
    const queryEmbedding = await generateEmbedding(query, true);
    console.log('Generated query embedding, dimensions:', queryEmbedding.length);
    
    // Convert to PostgreSQL vector format
    const vectorStr = `[${queryEmbedding.join(',')}]`;
    
    console.log('Executing vector search...');
    
    // Use raw SQL for vector search
    const results = await db.execute(sql`
      SELECT 
        id, 
        content,
        1 - (embedding <=> ${vectorStr}::vector) as similarity
      FROM documents 
      WHERE 1 - (embedding <=> ${vectorStr}::vector) > ${similarityThreshold}
      ORDER BY embedding <=> ${vectorStr}::vector
      LIMIT ${limit}
    `);

    console.log(`Found ${results.rows.length} relevant documents`);
    
    if (results.rows.length > 0) {
      results.rows.forEach((row: any, i: number) => {
        console.log(`Result ${i + 1}: similarity=${row.similarity}, content: ${row.content.substring(0, 100)}...`);
      });
    }

    return results.rows;
  } catch (error) {
    console.error('Search error:', error);
    throw new Error(`Failed to search: ${error}`);
  }
}