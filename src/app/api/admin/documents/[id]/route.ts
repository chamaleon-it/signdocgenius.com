import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { Document } from '@/models/Document';
import mongoose from 'mongoose';

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

    const body = await request.json();
    if (typeof body.isActive !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid payload: isActive (boolean) is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const document = await Document.findByIdAndUpdate(
      id,
      { isActive: body.isActive },
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
