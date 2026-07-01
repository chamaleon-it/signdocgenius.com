import mongoose from 'mongoose';

const DocumentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  fileUrl: {
    type: String,
    required: true,
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: false, // Make it optional if we only have one admin to simplify
  },
}, { timestamps: true });

export const Document = mongoose.models.Document || mongoose.model('Document', DocumentSchema);
