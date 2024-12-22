import Credential, { ICredential } from '../models/Credential';

export const saveCredential = async (
  credentialType: ICredential['credentialType'],
  credentialAccountPublicKey: string,
  pdfFile: File
): Promise<void> => {
  try {
    const arrayBuffer = await pdfFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const credential = new Credential({
      credentialType,
      credentialAccountPublicKey,
      pdf: {
        data: buffer,
        contentType: pdfFile.type,
        filename: pdfFile.name
      }
    });

    await credential.save();
    console.log(`${credentialType} credential saved successfully`);
  } catch (error) {
    console.error(`Error saving ${credentialType} credential:`, error);
    throw error;
  }
};
