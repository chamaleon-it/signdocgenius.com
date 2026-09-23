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

    if (!id) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
    }

    const document = await Document.findById(id);

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Check if the link is inactive
    if (document.isActive === false) {
      return NextResponse.json(
        {
          error: 'This signing link is inactive or has already been used.',
          isActive: false,
          title: document.title,
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      document: {
        ...document.toObject(),
        isActive: true,
      },
    });
  } catch (error) {
    console.error('Error fetching document:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
