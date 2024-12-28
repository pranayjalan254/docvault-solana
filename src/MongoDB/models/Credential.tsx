import mongoose, { Schema, Document } from 'mongoose';

export interface ICredential extends Document {
  credentialType: 'Skill' | 'Degree' | 'Employment' | 'Project' | 'Certification';
  credentialAccountPublicKey: string;
  pdf: {
    data: Buffer;
    contentType: string;
    filename: string;
  };
  createdAt: Date;
}

const CredentialSchema = new Schema({
  credentialType: { 
    type: String, 
    required: true, 
    enum: ['Skill', 'Degree', 'Employment', 'Project', 'Certification'] 
  },
  credentialAccountPublicKey: { type: String, required: true, index: true },
  pdf: {
    data: Buffer,
    contentType: String,
    filename: String
  },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<ICredential>('Credential', CredentialSchema, 'credentials');
