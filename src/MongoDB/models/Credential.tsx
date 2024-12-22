import mongoose, { Schema, Document } from 'mongoose';

export interface ICredential extends Document {
  credentialType: 'Skill' | 'Degree' | 'Employment' | 'Project' | 'Certification';
  credentialAccountPublicKey: string;
  name: string;
  pdf: {
    data: Buffer;
    contentType: string;
    filename: string;
  };
  metadata?: Record<string, any>;
  createdAt: Date;
}

const CredentialSchema = new Schema({
  credentialType: { 
    type: String, 
    required: true, 
    enum: ['Skill', 'Degree', 'Employment', 'Project', 'Certification'] 
  },
  credentialAccountPublicKey: { type: String, required: true, index: true },
  name: { type: String, required: true },
  pdf: {
    data: Buffer,
    contentType: String,
    filename: String
  },
  metadata: { type: Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<ICredential>('Credential', CredentialSchema, 'credentials');
