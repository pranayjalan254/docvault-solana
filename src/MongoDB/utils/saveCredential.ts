import Credential, { ICredential } from '../models/Credential';

export const saveCredential = async (
  credentialType: ICredential['credentialType'],
  credentialAccountPublicKey: string,
  name: string,
  pdfFile: File,
  metadata?: Record<string, any>
): Promise<void> => {
  try {
    const arrayBuffer = await pdfFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const credential = new Credential({
      credentialType,
      credentialAccountPublicKey,
      name,
      pdf: {
        data: buffer,
        contentType: pdfFile.type,
        filename: pdfFile.name
      },
      metadata,
      createdAt: new Date()
    });

    await credential.save();
    console.log(`${credentialType} credential saved successfully`);
  } catch (error) {
    console.error(`Error saving ${credentialType} credential:`, error);
    throw error;
  }
};
