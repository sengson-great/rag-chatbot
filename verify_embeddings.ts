import { config } from 'dotenv';
import { InferenceClient } from "@huggingface/inference";

config({ path: '.env.local' });

const client = new InferenceClient(process.env.HUGGINGFACE_API_KEY!);

function dotProduct(a: number[], b: number[]) {
  return a.map((x, i) => a[i] * b[i]).reduce((m, n) => m + n);
}

async function generateEmbedding(text: string, isQuery: boolean = false): Promise<number[]> {
    const prefix = isQuery ? "query: " : "passage: ";
    const input = (prefix + text).substring(0, 512);
    const output = await client.featureExtraction({
      model: "intfloat/multilingual-e5-small",
      inputs: input,
    });
    return output as number[];
}

async function test() {
  try {
    console.log("🚀 Initiating model verification test...");

    // 1. Test English retrieval consistency
    console.log("\n--- Testing English Consistency ---");
    const engDoc = await generateEmbedding("The capital of France is Paris.", false);
    const engQuery = await generateEmbedding("What is France's capital city?", true);
    
    console.log(`✅ Model responded successfully! Dimensions: ${engDoc.length}`);
    if (engDoc.length !== 384) throw new Error("Dimensions wrong!");

    const engSim = dotProduct(engDoc, engQuery);
    console.log(`📊 English Query Similarity Score: ${(engSim * 100).toFixed(2)}%`);

    // 2. Test Khmer functionality (even without a PDF, just raw text)
    console.log("\n--- Testing Khmer Native Support ---");
    // "ភ្នំពេញជារាជធានីនៃប្រទេសកម្ពុជា" means "Phnom Penh is the capital of Cambodia"
    const khDoc = await generateEmbedding("ភ្នំពេញជារាជធានីនៃប្រទេសកម្ពុជា", false);
    // "រាជធានីកម្ពុជាគឺជាអ្វី?" means "What is the capital of Cambodia?"
    const khQuery = await generateEmbedding("រាជធានីកម្ពុជាគឺជាអ្វី?", true);
    
    const khSim = dotProduct(khDoc, khQuery);
    console.log(`📊 Khmer Query Similarity Score: ${(khSim * 100).toFixed(2)}%`);

    if (engSim > 0.7 && khSim > 0.7) {
        console.log("\n✨ VERDICT: Both languages are fully functional and providing HIGH semantic matching scores!");
    } else {
        console.warn("\n⚠️ Scores seem low. Double check vector math.");
    }
  } catch (e) {
    console.error("❌ Test failed:", e);
  }
}

test();
