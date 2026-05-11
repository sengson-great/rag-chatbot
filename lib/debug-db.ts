// app/api/debug-db/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db-config';
import { documents } from '@/lib/db-schema';

export async function GET() {
  try {
    const allDocs = await db.select().from(documents).limit(10);
    
    return NextResponse.json({
      totalDocuments: allDocs.length,
      documents: allDocs.map(doc => ({
        id: doc.id,
        content_length: doc.content.length,
        content_preview: doc.content.substring(0, 200) + '...',
        embedding_length: doc.embedding?.length || 0
      }))
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}