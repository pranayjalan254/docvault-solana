import mongoose, { Schema, Document } from 'mongoose';

export interface IDegreeUpload extends Document {
  type: string;
  credentialAccountPublicKey: string;
  pdf: {
    data: Buffer,
    contentType: string,
    filename: string
  };
  uploadedAt: Date;
}

const DegreeUploadSchema = new Schema({
  type: { type: String, default: 'Degree' },
  credentialAccountPublicKey: { type: String, required: true },
  pdf: {
    data: Buffer,
    contentType: String,
    filename: String
  },
  uploadedAt: { type: Date, default: Date.now }
});

export default mongoose.model<IDegreeUpload>('DegreeUpload', DegreeUploadSchema);
