// app/api/chat/route.ts - Enhanced search
import { google } from '@ai-sdk/google'
import { convertToModelMessages, streamText, UIMessage, tool, stepCountIs } from 'ai'
import { z } from 'zod'
import { searchDocuments } from '@/lib/search'

type KnowledgeBaseResult = {
  content: string;
  similarity: number;
};

const tools = {
  searchKnowledgeBase: tool({
    description: "Search the company knowledge base for relevant information, policies, procedures, products, services, or internal documentation",
    inputSchema: z.object({
      query: z.string().describe("The search query to find relevant company documents"),
    }),
    execute: async ({ query }) => {
      try {
        console.log('🔍 Searching knowledge base for:', query);
        
        // Search with increased chunk limit to leverage Gemini's larger context window
        const results = await searchDocuments(query, 30, 0.2);

        if (results.length === 0) {
          return "No relevant information found in the knowledge base for this query.";
        }

        // Format results with similarity scores
        const formattedResults = (results as KnowledgeBaseResult[])
          .map((r, i: number) => 
            `[Document ${i + 1}, Similarity: ${(r.similarity * 100).toFixed(1)}%]\n${r.content}`
          )
          .join("\n\n");

        console.log(`📚 Found ${results.length} relevant documents`);
        return formattedResults;
      } catch (error) {
        console.error("Search error:", error);
        return "Error searching the knowledge base. Please try again.";
      }
    },
  }),
};

export async function POST(req: Request) {
    try {
        const { messages } : { messages: UIMessage[] } = await req.json()

        const result = streamText({
            model: google('gemini-2.5-flash'),
            messages: await convertToModelMessages(messages),
            tools,
            system: `You are a helpful company knowledge assistant.
                    When users ask questions about the organization, its products, services, policies, procedures, documentation, or any company-specific information,
                    always search the knowledge base first using the search tool.
                    
                    Important instructions:
                    - Search before answering any question that may depend on company-specific knowledge
                    - Base your answer on relevant information returned from the knowledge base
                    - If no relevant information is found, say that the knowledge base does not contain the answer and provide general guidance only when appropriate
                    - Be concise, professional, and practical
                    - If you are not sure, say you do not know rather than making up information
                    - If the user is asking in Khmer, translate to English before searching, then translate the search results back to Khmer in your response`,
            stopWhen: stepCountIs(3),
        })

        return result.toUIMessageStreamResponse();
    } catch (error) {
        console.error(error);
        return new Response('Internal Server Error', { status: 500 });
    }
}
