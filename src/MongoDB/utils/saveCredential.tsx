import Credential from '../models/Credential';

export const saveCredentialWithPDF = async (credentialData: any, pdfUrl: string) => {
  try {
    const credential = new Credential({
      ...credentialData,
      pdfUrl,
    });
    await credential.save();
    console.log('Credential saved successfully.');
  } catch (error) {
    console.error('Error saving credential:', error.stack || error);
    throw error;
  }
};
