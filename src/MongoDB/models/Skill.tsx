
import mongoose, { Schema, Document } from 'mongoose';

export interface ISkill extends Document {
  skillId: string;
  title: string;
  description: string;
  issuer: string;
  issuanceDate: Date;
  holderAddress: string;
  proficiencyLevel: string;
  proofLink?: string;
  pdfUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SkillSchema: Schema = new Schema({
  skillId: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  issuer: { type: String, required: true },
  issuanceDate: { type: Date, required: true },
  holderAddress: { type: String, required: true },
  proficiencyLevel: { type: String, required: true },
  proofLink: { type: String },
  pdfUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Update timestamps on save
SkillSchema.pre<ISkill>('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model<ISkill>('Skill', SkillSchema, 'skills'); // Specify collection name as 'skills'
