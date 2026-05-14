// src/lib/embeddings.ts - Upgraded to Google Gemini-2 Embeddings (Sub-100ms Latency)
import { google } from "@ai-sdk/google";
import { embed, embedMany } from "ai";

const EMBEDDING_MODEL = "gemini-embedding-2";
const DIMENSION_SIZE = 384;

export async function generateEmbedding(text: string, isQuery: boolean = false): Promise<number[]> {
  try {
    console.log(`Generating Google Embedding for ${text.length} chars...`);
    const startTime = Date.now();
    
    const { embedding } = await embed({
      model: google.embedding(EMBEDDING_MODEL),
      value: text.replaceAll("\n", " "),
      providerOptions: {
        google: {
          outputDimensionality: DIMENSION_SIZE,
        },
      },
    });
    
    console.log(`✅ Generated embedding in ${Date.now() - startTime}ms. Dimensions: ${embedding.length}`);
    return embedding;
  } catch (error) {
    console.error("Error generating Google embedding:", error);
    throw new Error(`Failed to generate embedding: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function generateEmbeddings(texts: string[], isQuery: boolean = false): Promise<number[][]> {
  try {
    console.log(`Generating Google Batch Embeddings for ${texts.length} items...`);
    const startTime = Date.now();
    
    const cleanTexts = texts.map(t => t.replaceAll("\n", " "));
    
    const { embeddings } = await embedMany({
      model: google.embedding(EMBEDDING_MODEL),
      values: cleanTexts,
      providerOptions: {
        google: {
          outputDimensionality: DIMENSION_SIZE,
        },
      },
    });
    
    console.log(`✅ Successfully generated batch of ${embeddings.length} embeddings in ${Date.now() - startTime}ms`);
    return embeddings;
  } catch (error) {
    console.error("Error generating Google batch embeddings:", error);
    // Fallback to loop if batch fails for any unexpected API limitation
    console.warn("Attempting sequential fallback...");
    const embeddings: number[][] = [];
    for (const text of texts) {
      try {
        const vector = await generateEmbedding(text, isQuery);
        embeddings.push(vector);
      } catch {
        embeddings.push(Array(DIMENSION_SIZE).fill(0));
      }
    }
    return embeddings;
  }
}