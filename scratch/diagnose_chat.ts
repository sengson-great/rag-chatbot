async function runDiagnostics() {
  console.log("🚀 Running chat API diagnostics on http://localhost:3001/api/chat...");
  
  const payload = {
    messages: [
      {
        id: "msg_test_123",
        role: "user",
        parts: [{ type: "text", text: "Testing connection" }]
      }
    ]
  };
  
  try {
    const startTime = Date.now();
    const response = await fetch("http://localhost:3001/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    
    console.log(`\n📡 HTTP Status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const text = await response.text();
      console.error("❌ Error response body:", text);
      return;
    }
    
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    console.log("🟢 Stream opened, receiving chunks:\n---");
    
    let chunkCount = 0;
    let fullText = "";
    
    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        console.log(`[Chunk ${++chunkCount}] ->`, JSON.stringify(chunk));
        fullText += chunk;
      }
    }
    
    console.log("\n---\n✅ Diagnostics Complete in", Date.now() - startTime, "ms");
    console.log("📜 Full response data:\n", fullText);
    
  } catch (error) {
    console.error("❌ Network Error connecting to Next.js server:", error);
  }
}

runDiagnostics();
