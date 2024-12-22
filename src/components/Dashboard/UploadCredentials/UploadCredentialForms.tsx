import React, { useState } from "react";
import { storeCredential } from "../../../MongoDB/credentialService";

interface UploadCredentialFormsProps {
  credentialType: string;
}

const UploadCredentialForms: React.FC<UploadCredentialFormsProps> = ({
  credentialType,
}) => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<any>({});

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPdfFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pdfFile) {
      alert("Please upload a PDF file.");
      return;
    }

    // Convert PDF to base64 or upload to a storage service and get the URL
    const reader = new FileReader();
    reader.readAsDataURL(pdfFile);
    reader.onloadend = async () => {
      const pdfUrl = reader.result as string;

      const credential = {
        userAddress: window.solana.publicKey.toString(),
        credentialType,
        data: formData,
        pdfUrl,
      };

      try {
        await storeCredential(credential);
        alert("Credential uploaded successfully!");
      } catch (error) {
        alert("Failed to upload credential.");
      }
    };
  };

  return (
    <CredentialFormBase title={`Upload ${credentialType}`} onSubmit={handleSubmit}>
      {/* ...existing form fields... */}
      <div>
        <label htmlFor="pdf">Upload PDF:</label>
        <input type="file" id="pdf" accept=".pdf" onChange={handleFileChange} required />
      </div>
      <button type="submit">Submit</button>
    </CredentialFormBase>
  );
};

export default UploadCredentialForms;
