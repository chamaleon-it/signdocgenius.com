import mongoose from 'mongoose';

const ApplicationSchema = new mongoose.Schema({
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true,
  },
  clientName: {
    type: String,
    required: true,
  },
  clientEmail: {
    type: String,
    required: true,
  },
  signedFileUrl: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['PENDING', 'SIGNED', 'REJECTED'],
    default: 'SIGNED',
  }
}, { timestamps: true });

export const Application = mongoose.models.Application || mongoose.model('Application', ApplicationSchema);
