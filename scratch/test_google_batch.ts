import { google } from "@ai-sdk/google";
import { embedMany } from "ai";
import { config } from "dotenv";

config({ path: ".env.local" });

async function testBatch() {
  console.log("Testing batch embedMany via AI SDK...");
  
  const texts = ["Chunk one content is here.", "Second piece of documentation.", "Third chunk details."];
  
  try {
    const startTime = Date.now();
    const { embeddings } = await embedMany({
      model: google.embedding("gemini-embedding-2"),
      values: texts,
      providerOptions: {
        google: {
          outputDimensionality: 384,
        },
      },
    });
    const endTime = Date.now();
    
    console.log("✅ Batch Success!");
    console.log("Count:", embeddings.length);
    console.log("Dimensions per vector:", embeddings[0].length);
    console.log("Total Batch Time Taken:", endTime - startTime, "ms");
  } catch (error) {
    console.error("❌ Failed:", error);
  }
}

testBatch();
