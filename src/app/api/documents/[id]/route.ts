import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { Document } from '@/models/Document';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    // Await params first in Next.js 15+ 
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const document = await Document.findById(id);

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    return NextResponse.json({ document });
  } catch (error) {
    console.error('Error fetching document:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
