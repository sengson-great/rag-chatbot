// app/api/chat/route.ts - Supercharged Direct RAG
import { google } from '@ai-sdk/google'
import { convertToModelMessages, streamText, UIMessage } from 'ai'
import { searchDocuments } from '@/lib/search'

type KnowledgeBaseResult = {
  content: string;
  similarity: number;
};

export async function POST(req: Request) {
    try {
        const { messages } : { messages: UIMessage[] } = await req.json()

        // 1. Extract latest user message to use as vector query (robust extractor for AI SDK V4/V5 UIMessage)
        const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
        let userQuery = "";
        
        if (lastUserMessage) {
            if (Array.isArray(lastUserMessage.parts)) {
                userQuery = lastUserMessage.parts
                    .filter((p: any) => p.type === 'text')
                    .map((p: any) => p.text || "")
                    .join(" ");
            } else if ((lastUserMessage as any).content) {
                userQuery = (lastUserMessage as any).content;
            }
        }

        let contextDocuments = "No context retrieved.";

        // 2. Directly pre-fetch relevant documents before querying Gemini
        if (userQuery) {
            try {
                console.log('🚀 Direct RAG Searching for:', userQuery);
                // High-Recall sweet spot: Pulling top 15 documents at 0.2 threshold for speed & accuracy
                const results = await searchDocuments(userQuery, 15, 0.2);

                if (results.length > 0) {
                    contextDocuments = (results as KnowledgeBaseResult[])
                      .map((r, i: number) => 
                        `[Document ${i + 1}, Similarity Score: ${(r.similarity * 100).toFixed(1)}%]\n${r.content}`
                      )
                      .join("\n\n");
                } else {
                    contextDocuments = "No strictly relevant matching files found in knowledge base.";
                }
                console.log(`📚 Prefetched ${results.length} chunks successfully.`);
            } catch (searchError) {
                console.error("Error during Direct RAG search:", searchError);
            }
        }

        // 3. Single-hop invocation to stream the answer instantly
        const result = streamText({
            model: google('gemini-2.5-flash'),
            messages: await convertToModelMessages(messages),
            system: `You are an advanced and professional company knowledge assistant.
                    
                    Here is the highly relevant knowledge base documentation retrieved for the current user question:
                    === START KNOWLEDGE BASE DOCUMENTS ===
                    ${contextDocuments}
                    === END KNOWLEDGE BASE DOCUMENTS ===
                    
                    Strict Operational Guidelines:
                    - Formulate your answer ONLY based on the provided Knowledge Base Documents above.
                    - If the answers cannot be derived from the documents, state clearly that you do not have that information. Do not make up facts.
                    - Be highly concise, accurate, and directly address the core user query.
                    - The similarity scores represent system relevance matching. Focus your answer on the highest similarity results first.
                    - If the user asks questions in Khmer (ភាសាខ្មែរ), automatically synthesize your answer and output in professional Khmer.`,
        })

        return result.toUIMessageStreamResponse();
    } catch (error) {
        console.error("Chat route error:", error);
        return new Response('Internal Server Error', { status: 500 });
    }
}
