import CertificateUpload from '../models/CertificationUpload';
import { readFileAsBase64 } from './readFileAsBase64';

export async function saveCredentialUpload(
  type: string,
  publicKey: string,
  file: File
): Promise<string> {
  try {
    // Convert file to base64
    const base64Data = await readFileAsBase64(file);
    const buffer = Buffer.from(base64Data.split(',')[1], 'base64');

    // Create new document
    const upload = new CertificateUpload({
      type,
      credentialAccountPublicKey: publicKey,
      pdf: {
        data: buffer,
        contentType: file.type,
        filename: file.name
      }
    });

    // Save to database
    await upload.save();
    return upload._id;

  } catch (error) {
    console.error('Error saving credential:', error);
    throw error;
  }
}
