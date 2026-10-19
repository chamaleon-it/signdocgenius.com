import mongoose from 'mongoose';

const SignatureFieldSchema = new mongoose.Schema({
  id: { type: String, required: true },
  page: { type: Number, required: true },
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  width: { type: Number, required: true },
  height: { type: Number, required: true },
}, { _id: false });

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
  isActive: {
    type: Boolean,
    default: true,
  },
  signatureFields: {
    type: [SignatureFieldSchema],
    default: [],
  },
}, { timestamps: true });

export const Document = mongoose.models.Document || mongoose.model('Document', DocumentSchema);
