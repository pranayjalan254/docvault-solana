import mongoose, { Schema, Document } from 'mongoose';

export interface IEmploymentUpload extends Document {
  type: string;
  credentialAccountPublicKey: string;
  pdf: {
    data: Buffer,
    contentType: string,
    filename: string
  };
  uploadedAt: Date;
}

const EmploymentUploadSchema = new Schema({
  type: { type: String, default: 'Employment' },
  credentialAccountPublicKey: { type: String, required: true },
  pdf: {
    data: Buffer,
    contentType: String,
    filename: String
  },
  uploadedAt: { type: Date, default: Date.now }
});

export default mongoose.model<IEmploymentUpload>('EmploymentUpload', EmploymentUploadSchema);
