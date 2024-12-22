import mongoose, { Schema, Document } from 'mongoose';

export interface ISkillUpload extends Document {
  type: string;
  credentialAccountPublicKey: string;
  pdf: {
    data: Buffer,
    contentType: string,
    filename: string
  };
  uploadedAt: Date;
}

const SkillUploadSchema = new Schema({
  type: { type: String, default: 'Skills' },
  credentialAccountPublicKey: { type: String, required: true },
  pdf: {
    data: Buffer,
    contentType: String,
    filename: String
  },
  uploadedAt: { type: Date, default: Date.now }
});

export default mongoose.model<ISkillUpload>('SkillUpload', SkillUploadSchema);
