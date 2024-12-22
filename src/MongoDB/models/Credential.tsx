import mongoose, { Schema, Document } from 'mongoose';

export interface ICredential extends Document {
  credentialId: string;
  stakeAmount: number;
  verifications: string[];
  authenticVotes: number;
  totalStaked: number;
  isFinalized: boolean;
  pdfUrl: string;
}

const CredentialSchema: Schema = new Schema({
  credentialId: { type: String, required: true, unique: true, index: true }, // Added index
  stakeAmount: { type: Number, required: true },
  verifications: { type: [String], required: true },
  authenticVotes: { type: Number, required: true },
  totalStaked: { type: Number, required: true },
  isFinalized: { type: Boolean, required: true },
  pdfUrl: { type: String, required: true },
});

export default mongoose.model<ICredential>('Credential', CredentialSchema);
