import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { Document } from '@/models/Document';
import mongoose from 'mongoose';
import { parseSignatureFields } from '@/lib/signature-fields';

export const runtime = 'nodejs';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id || !mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid document ID' }, { status: 400 });
    }

    const body: unknown = await request.json();
    if (typeof body !== 'object' || body === null) {
      return NextResponse.json(
        { error: 'Invalid payload' },
        { status: 400 }
      );
    }

    const updates: { isActive?: boolean; signatureFields?: ReturnType<typeof parseSignatureFields> } = {};
    const payload = body as Record<string, unknown>;
    if ('isActive' in payload) {
      if (typeof payload.isActive !== 'boolean') {
        return NextResponse.json({ error: 'isActive must be a boolean' }, { status: 400 });
      }
      updates.isActive = payload.isActive;
    }
    if ('signatureFields' in payload) {
      const signatureFields = parseSignatureFields(payload.signatureFields);
      if (!signatureFields) {
        return NextResponse.json(
          { error: 'At least one valid signature position is required' },
          { status: 400 }
        );
      }
      updates.signatureFields = signatureFields;
    }
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid document updates provided' }, { status: 400 });
    }

    await connectToDatabase();

    const document = await Document.findByIdAndUpdate(
      id,
      updates,
      { new: true }
    );

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      document: {
        ...document.toObject(),
        isActive: document.isActive !== false,
      },
    });
  } catch (error) {
    console.error('Error updating document status:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id || !mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid document ID' }, { status: 400 });
    }

    await connectToDatabase();
    const document = await Document.findById(id);

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    return NextResponse.json({
      document: {
        ...document.toObject(),
        isActive: document.isActive !== false,
      },
    });
  } catch (error) {
    console.error('Error fetching admin document:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
