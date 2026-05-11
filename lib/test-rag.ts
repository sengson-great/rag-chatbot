// // src/lib/test-rag.ts
// import { checkDatabase } from "./debug-db";
// import { findRelevantDocuments } from "./retrieval";

// export async function testRAGPipeline() {
//   console.log("=== Testing RAG Pipeline ===");
  
//   // 1. Check database
//   console.log("\n1. Checking database...");
//   const dbCheck = await checkDatabase();
  
//   if (dbCheck.count === 0) {
//     console.error("❌ No documents in database! Upload may have failed.");
//     return;
//   }
  
//   // 2. Test retrieval with a simple query
//   console.log("\n2. Testing document retrieval...");
//   const testQuery = "What is the main topic of the document?";
//   const results = await findRelevantDocuments(testQuery);
  
//   if (results.length === 0) {
//     console.error("❌ No relevant documents found!");
//     return;
//   }
  
//   // 3. Test with content from the document
//   console.log("\n3. Testing with document content...");
//   const sampleContent = dbCheck.sampleDocs[0]?.content;
//   if (sampleContent) {
//     const words = sampleContent.split(' ').slice(0, 10).join(' ');
//     const contentQuery = `Tell me about "${words}"`;
//     const contentResults = await findRelevantDocuments(contentQuery);
//     console.log(`Found ${contentResults.length} documents for content-based query`);
//   }
  
//   console.log("\n✅ RAG pipeline test completed");
// }