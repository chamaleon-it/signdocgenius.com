import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { Application } from '@/models/Application';
import { Document } from '@/models/Document';
import mongoose from 'mongoose';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join, resolve, sep } from 'path';
import { existsSync } from 'fs';
import { PDFDocument } from 'pdf-lib';
import { fitSignatureToField, getFieldSignatures, parseSignatureFields } from '@/lib/signature-fields';
import {
  parsePdfTextFieldValues,
  setPdfTextFieldValues,
  type PdfTextFieldValues,
} from '@/lib/pdf-form-fields';

export const maxDuration = 60;
export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const documentId = formData.get('documentId') as string;
    const clientName = formData.get('clientName') as string;
    const clientEmail = formData.get('clientEmail') as string;
    const file = formData.get('file');
    const formFieldValuesEntry = formData.get('formFieldValues');

    if (
      !documentId ||
      typeof clientName !== 'string' ||
      !clientName.trim() ||
      typeof clientEmail !== 'string' ||
      !clientEmail.trim() ||
      !(file instanceof File)
    ) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (formFieldValuesEntry !== null && typeof formFieldValuesEntry !== 'string') {
      return NextResponse.json({ error: 'Invalid PDF form field values' }, { status: 400 });
    }

    let formFieldValues: PdfTextFieldValues | null = null;
    if (typeof formFieldValuesEntry === 'string') {
      try {
        formFieldValues = parsePdfTextFieldValues(JSON.parse(formFieldValuesEntry));
      } catch {
        return NextResponse.json({ error: 'Invalid PDF form field values' }, { status: 400 });
      }
      if (!formFieldValues) {
        return NextResponse.json({ error: 'Invalid PDF form field values' }, { status: 400 });
      }
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

    let buffer: Buffer;
    const configuredFields = document.signatureFields || [];
    if (configuredFields.length > 0) {
      const uploadsDir = resolve(process.cwd(), 'public', 'uploads');
      const storedFileName = /^\/uploads\/([^/\\]+)$/.exec(document.fileUrl)?.[1];
      if (!storedFileName) {
        return NextResponse.json({ error: 'Invalid source document path' }, { status: 500 });
      }
      const originalPdfPath = join(uploadsDir, storedFileName);
      if (!originalPdfPath.startsWith(`${uploadsDir}${sep}`)) {
        return NextResponse.json({ error: 'Invalid source document path' }, { status: 500 });
      }

      const originalPdf = await readFile(originalPdfPath);
      const pdfDoc = await PDFDocument.load(originalPdf);
      if (formFieldValues && !setPdfTextFieldValues(pdfDoc, formFieldValues)) {
        return NextResponse.json(
          { error: 'One or more edited form fields are not valid for this document' },
          { status: 400 }
        );
      }
      const fields = parseSignatureFields(configuredFields, pdfDoc.getPageCount());
      if (!fields) {
        return NextResponse.json({ error: 'Document signature positions are invalid' }, { status: 500 });
      }
      const signatures = getFieldSignatures(formData, fields);
      if (!signatures) {
        return NextResponse.json({ error: 'A separate signature is required for each position' }, { status: 400 });
      }

      const pages = pdfDoc.getPages();
      for (const [index, field] of fields.entries()) {
        const signature = signatures[index];
        let signatureImage;
        try {
          const bytes = await signature.arrayBuffer();
          if (signature.type === 'image/png') {
            signatureImage = await pdfDoc.embedPng(bytes);
          } else if (signature.type === 'image/jpeg' || signature.type === 'image/jpg') {
            signatureImage = await pdfDoc.embedJpg(bytes);
          } else {
            return NextResponse.json({ error: 'Signatures must be PNG or JPEG images' }, { status: 400 });
          }
        } catch {
          return NextResponse.json({ error: 'Could not read a signature image' }, { status: 400 });
        }
        const page = pages[field.page - 1];
        const { width, height } = page.getSize();
        const fieldWidth = field.width * width;
        const fieldHeight = field.height * height;
        const imageFit = fitSignatureToField(
          fieldWidth,
          fieldHeight,
          signatureImage.width,
          signatureImage.height
        );
        page.drawImage(signatureImage, {
          x: field.x * width + imageFit.x,
          y: height - ((field.y + field.height) * height) + imageFit.y,
          width: imageFit.width,
          height: imageFit.height,
        });
      }

      buffer = Buffer.from(await pdfDoc.save());
    } else {
      buffer = Buffer.from(await file.arrayBuffer());
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    const safeTitle = document.title.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'document';
    const fileName = `signed-${Date.now()}-${safeTitle}.pdf`;
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
      clientName: clientName.trim(),
      clientEmail: clientEmail.trim(),
      signedFileUrl,
      status: 'SIGNED',
    });

    return NextResponse.json({ application });
  } catch (error) {
    console.error('Error submitting application:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
