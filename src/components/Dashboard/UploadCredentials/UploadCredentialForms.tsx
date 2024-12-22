import React, { useState, useCallback } from "react";

interface CredentialData {
  userAddress: string;
  credentialType: string;
  data: Record<string, unknown>;
  pdfUrl: string;
}

interface UploadCredentialFormsProps {
  credentialType: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Temporary mock function - replace with actual implementation later
const storeCredential = async (credential: CredentialData): Promise<void> => {
  console.log('Storing credential:', credential);
  // Implement actual storage logic here
  return Promise.resolve();
};

const UploadCredentialForms: React.FC<UploadCredentialFormsProps> = ({
  credentialType,
}) => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): boolean => {
    if (file.size > MAX_FILE_SIZE) {
      setError("File size should not exceed 5MB");
      return false;
    }
    if (!file.type.includes('pdf')) {
      setError("Only PDF files are allowed");
      return false;
    }
    return true;
  };

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setPdfFile(file);
      } else {
        e.target.value = '';
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      if (!window.solana?.publicKey) {
        throw new Error("Please connect your wallet first.");
      }

      if (!pdfFile) {
        throw new Error("Please upload a PDF file.");
      }

      setIsLoading(true);

      const reader = new FileReader();
      reader.readAsDataURL(pdfFile);
      
      const pdfUrl = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
      });

      const credential: CredentialData = {
        userAddress: window.solana.publicKey.toString(),
        credentialType,
        data: formData,
        pdfUrl,
      };

      await storeCredential(credential);
      alert("Credential uploaded successfully!");
      // Reset form
      setPdfFile(null);
      setFormData({});
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form 
      className="credential-form" 
      onSubmit={handleSubmit}
    >
      <h2 className="form-title">{`Upload ${credentialType}`}</h2>
      {error && <div className="error-message">{error}</div>}
      <div className="form-group">
        <label htmlFor="pdf">Upload PDF:</label>
        <input 
          type="file" 
          id="pdf" 
          accept=".pdf"
          onChange={handleFileChange}
          disabled={isLoading}
          required 
          className="file-input"
        />
      </div>
      <button 
        type="submit" 
        disabled={isLoading}
        className="submit-button"
      >
        {isLoading ? 'Uploading...' : 'Submit'}
      </button>
    </form>
  );
};

export default UploadCredentialForms;
