// src/app/upload/actions.ts - Updated for pdf-parse v2
"use server";

import { db } from "@/lib/db-config";
import { documents } from "@/lib/db-schema";
import { generateEmbeddings } from "@/lib/embeddings";
import { chunkContent } from "@/lib/chunking";

// PDF extraction for pdf-parse v2
async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  try {
    // For pdf-parse v2 - use PDFParse class
    const pdfParseModule = await import('pdf-parse');
    const { PDFParse } = pdfParseModule;
    
    // Create parser instance with the buffer
    const parser = new PDFParse({
      data: buffer // Use 'data' for buffer input instead of 'url'
    });
    
    // Extract text
    const result = await parser.getText();
    return result.text || '';
    
  } catch (error: any) {
    console.error('PDF parse v2 failed:', error.message);
    
    // Fallback for v2 compatibility issues
    return extractTextFromPDFFallback(buffer);
  }
}

// Basic fallback PDF text extraction
function extractTextFromPDFFallback(buffer: Buffer): string {
  const text = buffer.toString('utf8');
  console.log('Raw PDF text sample (first 500 chars):', text.substring(0, 500));
  
  // Extract text between parentheses (most common PDF text format)
  const parenMatches = text.match(/\(([^)]+)\)/g) || [];
  let extractedText = parenMatches.map(match => 
    match.slice(1, -1)
      .replace(/\\\(/g, '(')
      .replace(/\\\)/g, ')')
      .replace(/\\n/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  ).filter(text => text.length > 3).join(' ');
  
  if (extractedText.trim()) {
    console.log('Fallback extraction found text length:', extractedText.length);
    return extractedText;
  }
  
  // Simple character filtering for any readable text
  const cleanText = text.split('')
    .filter(char => {
      const code = char.charCodeAt(0);
      return code >= 32 || char === '\n' || char === '\r' || char === '\t';
    })
    .join('')
    .replace(/\s+/g, ' ')
    .trim();
  
  return cleanText.substring(0, 5000);
}

export async function processFile(formData: FormData) {
  try {
    console.log('=== PROCESS FILE START ===');
    
    const file = formData.get("file") as File;
    
    if (!file || file.size === 0) {
      return {
        success: false,
        error: "No file provided or file is empty.",
      };
    }

    console.log('File details:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    let fullText = '';

    // Check file type and process accordingly
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      console.log('Processing as PDF file');
      fullText = await extractTextFromPDF(file);
    } else if (file.type.startsWith('text/') || file.name.toLowerCase().endsWith('.txt')) {
      console.log('Processing as text file');
      fullText = await file.text();
    } else {
      return {
        success: false,
        error: "Unsupported file type. Please upload a PDF or text file.",
      };
    }

    console.log('Extracted text length:', fullText.length);
    
    if (fullText.length > 0) {
      console.log('First 200 chars:', fullText.substring(0, 200));
    }

    if (!fullText.trim()) {
      return {
        success: false,
        error: "File appears to be empty or contains no readable text.",
      };
    }

    // Clean up the text - remove excessive whitespace
    fullText = fullText.replace(/\s+/g, ' ').trim();

    // Process the text
    const chunks = await chunkContent(fullText);
    console.log('Created chunks:', chunks.length);

    if (chunks.length === 0) {
      return {
        success: false,
        error: "No content chunks could be created from the file.",
      };
    }

    // Limit chunks to avoid overwhelming the API
    const limitedChunks = chunks.slice(0, 100);
    
    const embeddings = await generateEmbeddings(limitedChunks);
    console.log('Generated embeddings:', embeddings.length);

    // Validate embeddings before insertion
    const validRecords = [];
    for (let i = 0; i < limitedChunks.length; i++) {
      if (embeddings[i] && Array.isArray(embeddings[i]) && embeddings[i].length === 384) {
        validRecords.push({
          content: limitedChunks[i],
          source: file.name,
          embedding: embeddings[i]
        });
      } else {
        console.warn(`Invalid embedding for chunk ${i}, skipping`);
      }
    }

    console.log(`Valid records to insert: ${validRecords.length}`);

    if (validRecords.length === 0) {
      return {
        success: false,
        error: "No valid embeddings generated. Please try again.",
      };
    }

    // Insert records one by one
    let successfulInserts = 0;
    
    for (const record of validRecords) {
      try {
        await db.insert(documents).values(record);
        successfulInserts++;
        console.log(`Inserted record ${successfulInserts}`);
      } catch (insertError) {
        console.error('Failed to insert record:', insertError);
      }
    }

    console.log(`Successfully inserted ${successfulInserts} out of ${validRecords.length} records`);

    if (successfulInserts === 0) {
      return {
        success: false,
        error: "Failed to insert any documents into the database.",
      };
    }

    return {
      success: true,
      message: `✅ Success! Created ${successfulInserts} searchable chunks from "${file.name}"`,
    };

  } catch (error) {
    console.error("File processing error:", error);
    return {
      success: false,
      error: `❌ Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

export async function debugFormData(formData: FormData) {
  const entries = Array.from(formData.entries());
  const files = entries.filter(([_, value]) => value instanceof File).map(([key, value]) => {
    const file = value as File;
    return {
      key,
      name: file.name,
      size: file.size,
      type: file.type,
      extension: file.name.split('.').pop()?.toLowerCase()
    };
  });
  
  return {
    success: true,
    entries: entries.length,
    keys: entries.map(([key]) => key),
    files
  };
}

export async function clearKnowledgeBase() {
  try {
    const { auth } = await import("@clerk/nextjs/server");
    const { sessionClaims } = await auth();
    
    if (sessionClaims?.metadata?.role !== "admin") {
      return { success: false, error: "Unauthorized: Admin access required." };
    }

    const { sql } = await import("drizzle-orm");
    await db.delete(documents);
    
    console.log('✅ Knowledge base cleared');
    return { success: true, message: "Knowledge base cleared successfully." };
  } catch (error) {
    console.error("Clear error:", error);
    return { 
      success: false, 
      error: `Failed to clear knowledge base: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}

export async function getSources() {
  try {
    const { auth } = await import("@clerk/nextjs/server");
    const { sessionClaims } = await auth();
    
    if (sessionClaims?.metadata?.role !== "admin") {
      return { success: false, error: "Unauthorized." };
    }

    const { sql } = await import("drizzle-orm");
    const results = await db.select({ 
      source: documents.source 
    })
    .from(documents)
    .groupBy(documents.source);
    
    // Filter out null and return unique sources
    const sources = results
      .map(r => r.source)
      .filter((s): s is string => s !== null && s !== "");
      
    return { success: true, sources };
  } catch (error) {
    console.error("Get sources error:", error);
    return { success: false, error: "Failed to fetch document sources." };
  }
}

export async function deleteSource(sourceName: string) {
  try {
    const { auth } = await import("@clerk/nextjs/server");
    const { sessionClaims } = await auth();
    
    if (sessionClaims?.metadata?.role !== "admin") {
      return { success: false, error: "Unauthorized." };
    }

    const { eq } = await import("drizzle-orm");
    await db.delete(documents).where(eq(documents.source, sourceName));
    
    console.log(`✅ Deleted source: ${sourceName}`);
    return { success: true, message: `Deleted all data from "${sourceName}".` };
  } catch (error) {
    console.error("Delete source error:", error);
    return { success: false, error: `Failed to delete "${sourceName}".` };
  }
}