import Credential from '../models/Credential';

interface CredentialData {
  title: string;
  description: string;
  issuer: string;
  issuanceDate: Date;
  expirationDate?: Date;
  holderAddress: string;
  metadata?: Record<string, any>;
}

/**
 * Saves a credential with associated PDF to MongoDB
 * @param credentialData The credential information
 * @param pdfUrl The URL where the PDF is stored
 * @returns Promise<void>
 * @throws Error if validation fails or save operation fails
 */
export const saveCredentialWithPDF = async (
  credentialData: CredentialData, 
  pdfUrl: string
): Promise<void> => {
  try {
    // Validate required fields
    if (!credentialData.title || !credentialData.holderAddress || !pdfUrl) {
      throw new Error('Missing required credential fields');
    }

    const credential = new Credential({
      ...credentialData,
      pdfUrl,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await credential.save();
    console.log('Credential saved successfully');
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error saving credential:', errorMessage);
    throw new Error(`Failed to save credential: ${errorMessage}`);
  }
};
