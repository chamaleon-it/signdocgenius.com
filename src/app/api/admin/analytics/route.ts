import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { Document } from '@/models/Document';
import { Application } from '@/models/Application';

export async function GET() {
  try {
    await connectToDatabase();
    
    const totalDocuments = await Document.countDocuments();
    const totalApplications = await Application.countDocuments();
    const signedApplications = await Application.countDocuments({ status: 'SIGNED' });
    
    // Get recent applications
    const recentApplications = await Application.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('documentId');

    return NextResponse.json({
      totalDocuments,
      totalApplications,
      signedApplications,
      recentApplications
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
