import mongoose, { Schema, Document } from 'mongoose';

export interface ICredential extends Document {
  credentialId: string;
  title: string;
  description: string;
  issuer: string;
  issuanceDate: Date;
  expirationDate?: Date;
  holderAddress: string;
  metadata?: Record<string, any>;
  pdfUrl: string;
  createdAt: Date; // Added field
  updatedAt: Date; // Added field
}

const CredentialSchema: Schema = new Schema({
  credentialId: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  issuer: { type: String, required: true },
  issuanceDate: { type: Date, required: true },
  expirationDate: { type: Date },
  holderAddress: { type: String, required: true },
  metadata: { type: Schema.Types.Mixed },
  pdfUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }, // Added default
  updatedAt: { type: Date, default: Date.now }, // Added default
});

// Update timestamps on save
CredentialSchema.pre<ICredential>('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model<ICredential>('Credential', CredentialSchema);
