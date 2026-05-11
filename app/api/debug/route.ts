// // src/app/api/debug/route.ts
// import { checkDatabase } from "@/lib/debug-db";
// import { testRAGPipeline } from "@/lib/test-rag";

// export async function GET() {
//   try {
//     const dbResult = await checkDatabase();
//     const ragResult = await testRAGPipeline();
    
//     return Response.json({
//       database: dbResult,
//       ragTest: ragResult
//     });
//   } catch (error) {
//     return Response.json({ 
//       error: error instanceof Error ? error.message : 'Unknown error' 
//     }, { status: 500 });
//   }
// }