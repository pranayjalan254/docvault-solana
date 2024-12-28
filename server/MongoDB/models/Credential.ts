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
    data: { type: mongoose.Schema.Types.Buffer , required: true },
    contentType: { type: String },
    filename: { type: String }
  },
  createdAt: { type: Date, default: Date.now }
});
const CredentialModel = mongoose.model<ICredential>('Credential', CredentialSchema, 'credential');
export default CredentialModel;
