import { config } from "dotenv";
config({ path: ".env.local" });

async function listModels() {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  
  try {
    const res = await fetch(url);
    const data = await res.json();
    const embedModels = data.models?.filter((m: any) => m.supportedGenerationMethods?.includes("embedContent")) || [];
    console.log("Available Embedding Models:");
    embedModels.forEach((m: any) => console.log(` - ${m.name} (DisplayName: ${m.displayName})`));
  } catch (e) {
    console.error(e);
  }
}
listModels();
