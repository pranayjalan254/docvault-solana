import mongoose, { Schema, Document } from "mongoose";

export interface ICredential extends Document {
  credentialType:
    | "Skill"
    | "Degree"
    | "Employment"
    | "Project"
    | "Certification";
  credentialId: string;
  pdf?: {
    data: Buffer;
    contentType: string;
    filename: string;
  };
  proofLink?: string;
  createdAt: Date;
}

const CredentialSchema = new Schema({
  credentialType: {
    type: String,
    required: true,
    enum: ["Skill", "Degree", "Employment", "Project", "Certification"],
  },
  credentialId: { type: String, required: true, index: true },
  pdf: {
    data: { type: mongoose.Schema.Types.Buffer, required: false },
    contentType: { type: String },
    filename: { type: String },
  },
  proofLink: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
});

const CredentialModel = mongoose.model<ICredential>(
  "Credential",
  CredentialSchema,
  "credential"
);
export default CredentialModel;
