import mongoose, { Schema, Document } from 'mongoose';

export interface IProjectUpload extends Document {
  type: string;
  credentialAccountPublicKey: string;
  pdf: {
    data: Buffer,
    contentType: string,
    filename: string
  };
  uploadedAt: Date;
}

const ProjectUploadSchema = new Schema({
  type: { type: String, default: 'Project' },
  credentialAccountPublicKey: { type: String, required: true },
  pdf: {
    data: Buffer,
    contentType: String,
    filename: String
  },
  uploadedAt: { type: Date, default: Date.now }
});

export default mongoose.model<IProjectUpload>('ProjectUpload', ProjectUploadSchema);
