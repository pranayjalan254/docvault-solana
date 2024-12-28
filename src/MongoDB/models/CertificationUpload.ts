import mongoose, { Schema, Document } from 'mongoose';

export interface ICertificateUpload extends Document {
  type: string;
  credentialAccountPublicKey: string;
  pdf: {
    data: Buffer,
    contentType: string,
    filename: string
  };
  uploadedAt: Date;
}

const CertificateUploadSchema = new Schema({
  type: { type: String, default: 'Certificate' },
  credentialAccountPublicKey: { type: String, required: true },
  pdf: {
    data: Buffer,
    contentType: String,
    filename: String
  },
  uploadedAt: { type: Date, default: Date.now }
});

export default mongoose.model<ICertificateUpload>('CertificateUpload', CertificateUploadSchema);
