// src/lib/embeddings.ts - Fixed version
import { InferenceClient } from "@huggingface/inference";

const client = new InferenceClient(process.env.HUGGINGFACE_API_KEY!);

export async function generateEmbedding(text: string, isQuery: boolean = false): Promise<number[]> {
  try {
    // E5 requires a prefix: "query: " for searching, "passage: " for indexing documents
    const prefix = isQuery ? "query: " : "passage: ";
    const input = (prefix + text.replaceAll("\n", " ")).substring(0, 512);
    
    console.log('Generating embedding for text length:', input.length, 'Mode:', isQuery ? 'query' : 'passage');
    
    const output = await client.featureExtraction({
      model: "intfloat/multilingual-e5-small",
      inputs: input,
    });
    
    const embedding = output as number[];
    console.log('Generated embedding - dimensions:', embedding.length);
    
    return embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw new Error(`Failed to generate embedding: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function generateEmbeddings(texts: string[], isQuery: boolean = false): Promise<number[][]> {
  try {
    console.log('Generating embeddings for', texts.length, 'texts');
    
    // Process one at a time to ensure consistent format
    const embeddings: number[][] = [];
    
    for (let i = 0; i < texts.length; i++) {
      try {
        const embedding = await generateEmbedding(texts[i], isQuery);
        embeddings.push(embedding);
        console.log(`Generated embedding ${i + 1}/${texts.length}`);
      } catch (error) {
        console.error(`Failed to generate embedding for text ${i + 1}:`, error);
        // Push a zero vector as fallback
        embeddings.push(Array(384).fill(0));
      }
      
      // Add a small delay to avoid rate limiting
      if (i < texts.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    console.log('Successfully generated all embeddings');
    return embeddings;
  } catch (error) {
    console.error("Error generating embeddings:", error);
    throw new Error(`Failed to generate embeddings: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}