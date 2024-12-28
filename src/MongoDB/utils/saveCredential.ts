import Credential from '../models/Credential';

export const saveCredential = async (
  credentialType: 'Skill' | 'Degree' | 'Employment' | 'Project' | 'Certification',
  credentialAccountPublicKey: string,
  pdfFile: File
): Promise<void> => {
  try {
    if (!pdfFile || !credentialAccountPublicKey) {
      throw new Error('Missing required fields');
    }

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
    console.log(`${credentialType} saved successfully`);
  } catch (error) {
    console.error('Error saving credential:', error);
    throw error;
  }
};
