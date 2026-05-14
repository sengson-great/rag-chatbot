import { google } from "@ai-sdk/google";
import { embed } from "ai";
import { config } from "dotenv";

config({ path: ".env.local" });

async function test() {
  console.log("Testing gemini-embedding-2 via AI SDK...");
  
  try {
    const startTime = Date.now();
    const { embedding } = await embed({
      model: google.embedding("gemini-embedding-2"),
      value: "Hello world!",
      providerOptions: {
        google: {
          outputDimensionality: 384,
        },
      },
    });
    const endTime = Date.now();
    
    console.log("✅ Success!");
    console.log("Dimensions:", embedding.length);
    console.log("Time Taken:", endTime - startTime, "ms");
    console.log("Sample:", embedding.slice(0, 5));
  } catch (error) {
    console.error("❌ Failed:", error);
  }
}

test();
