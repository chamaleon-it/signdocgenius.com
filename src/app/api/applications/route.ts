import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { Application } from '@/models/Application';
import { Document } from '@/models/Document';
import mongoose from 'mongoose';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export const maxDuration = 60;
export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const documentId = formData.get('documentId') as string;
    const clientName = formData.get('clientName') as string;
    const clientEmail = formData.get('clientEmail') as string;
    const file = formData.get('file') as File;

    if (!documentId || !clientName || !clientEmail || !file) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!mongoose.isValidObjectId(documentId)) {
      return NextResponse.json({ error: 'Invalid document ID' }, { status: 400 });
    }

    await connectToDatabase();

    // Verify document exists and is active before processing
    const document = await Document.findById(documentId);
    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    if (document.isActive === false) {
      return NextResponse.json(
        { error: 'This signing link is inactive or has already been used.' },
        { status: 403 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    const fileName = `signed-${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    const filePath = join(uploadsDir, fileName);

    await writeFile(filePath, buffer);
    const signedFileUrl = `/uploads/${fileName}`;

    // Atomically deactivate the link to enforce one-time use
    const updatedDoc = await Document.findOneAndUpdate(
      { _id: documentId, isActive: { $ne: false } },
      { isActive: false }
    );

    if (!updatedDoc) {
      return NextResponse.json(
        { error: 'This signing link is inactive or has already been used.' },
        { status: 403 }
      );
    }

    const application = await Application.create({
      documentId,
      clientName,
      clientEmail,
      signedFileUrl,
      status: 'SIGNED',
    });

    return NextResponse.json({ application });
  } catch (error) {
    console.error('Error submitting application:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
