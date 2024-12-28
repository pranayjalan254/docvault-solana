import CredentialModel from '../models/Credential';
import { readFileAsBase64 } from './readFileAsBase64';

export async function saveCredentialUpload(
  type: 'Skill' | 'Degree' | 'Employment' | 'Project' | 'Certification',
  publicKey: string,
  file: File
): Promise<string> {
  try {

    const base64Data = await readFileAsBase64(file);
    const buffer = Buffer.from(base64Data.split(',')[1], 'base64');

    const newCredential = new CredentialModel({
      credentialType: type,
      credentialAccountPublicKey: publicKey,
      pdf: {
        data: buffer,
        contentType: file.type,
        filename: file.name
      }
    });

    const savedCredential = await newCredential.save();
    return savedCredential._id.toString();

  } catch (error) {
    console.error('Error saving credential:', error);
    throw error;
  }
}
