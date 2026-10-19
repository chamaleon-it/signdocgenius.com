import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { Document } from '@/models/Document';
import { Application } from '@/models/Application';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { PDFDocument } from 'pdf-lib';
import { parseSignatureFields } from '@/lib/signature-fields';

export const maxDuration = 60;
export const runtime = 'nodejs';

export async function GET() {
  try {
    await connectToDatabase();
    
    // Fetch all documents
    const rawDocuments = await Document.find().sort({ createdAt: -1 });
    const documents = rawDocuments.map((doc) => ({
      ...doc.toObject(),
      isActive: doc.isActive !== false,
    }));
    
    // Fetch all applications
    const applications = await Application.find().populate('documentId').sort({ createdAt: -1 });

    return NextResponse.json({ documents, applications });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const title = formData.get('title');
    const signatureFieldsValue = formData.get('signatureFields');

    if (
      !(file instanceof File) ||
      typeof title !== 'string' ||
      !title.trim() ||
      typeof signatureFieldsValue !== 'string'
    ) {
      return NextResponse.json(
        { error: 'Title, PDF file, and signature positions are required' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    let pdfDoc: PDFDocument;
    try {
      pdfDoc = await PDFDocument.load(buffer);
    } catch {
      return NextResponse.json({ error: 'The uploaded file is not a valid PDF' }, { status: 400 });
    }
    let fieldsJson: unknown;
    try {
      fieldsJson = JSON.parse(signatureFieldsValue);
    } catch {
      return NextResponse.json({ error: 'Invalid signature positions' }, { status: 400 });
    }
    const signatureFields = parseSignatureFields(fieldsJson, pdfDoc.getPageCount());
    if (!signatureFields) {
      return NextResponse.json(
        { error: 'At least one valid signature position is required' },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    const safeOriginalName = file.name.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'document.pdf';
    const fileName = `${Date.now()}-${safeOriginalName}`;
    const filePath = join(uploadsDir, fileName);

    await writeFile(filePath, buffer);
    const fileUrl = `/uploads/${fileName}`;

    await connectToDatabase();
    const document = await Document.create({
      title: title.trim(),
      fileUrl,
      isActive: true,
      signatureFields,
    });

    return NextResponse.json({ document });
  } catch (error) {
    console.error('Error uploading document:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
