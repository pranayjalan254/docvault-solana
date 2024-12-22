import { CredentialExport } from '../types/credential';

export const exportCredential = (
  name: string,
  credentialAccountPublicKey: string,
  pdfUrl: string
): CredentialExport => {
  return {
    name,
    credentialAccountPublicKey,
    pdfUrl,
    timestamp: Date.now(),
  };
};
