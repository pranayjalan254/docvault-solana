export interface CredentialUpload {
  publicKey: string;
  ipfsHash: string;
  fileName: string;
  fileType: string;
  uploadDate: Date;
  createdAt: Date;
}

export interface APIResponse {
  success: boolean;
  id?: string;
  error?: string;
}
