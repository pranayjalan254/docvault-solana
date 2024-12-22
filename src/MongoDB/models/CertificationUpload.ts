import mongoose, { Schema, Document } from 'mongoose';

export interface ICertificationUpload extends Document {
  type: string;
  credentialAccountPublicKey: string;
  pdf: {
    data: Buffer,
    contentType: string,
    filename: string
  };
  uploadedAt: Date;
}

const CertificationUploadSchema = new Schema({
  type: { type: String, default: 'Certification' },
  credentialAccountPublicKey: { type: String, required: true },
  pdf: {
    data: Buffer,
    contentType: String,
    filename: String
  },
  uploadedAt: { type: Date, default: Date.now }
});

export default mongoose.model<ICertificationUpload>('CertificationUpload', CertificationUploadSchema);
