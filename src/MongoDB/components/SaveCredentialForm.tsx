import React, { useState } from 'react';
import { saveCredential } from '../utils/saveCredential';
import { useWallet } from "@solana/wallet-adapter-react";

type CredentialType = 'Skill' | 'Degree' | 'Employment' | 'Project' | 'Certification';

const SaveCredentialForm: React.FC = () => {
  const [credentialType, setCredentialType] = useState<CredentialType>('Skill');
  const [pdf, setPdf] = useState<File | null>(null);
  const { publicKey } = useWallet();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey || !pdf) {
      alert('Wallet not connected or PDF not selected.');
      return;
    }

    try {
      await saveCredential(
        credentialType,
        publicKey.toBase58(),
        pdf
      );
      alert('Credential saved successfully.');
      setPdf(null);
    } catch (error) {
      console.error('Failed to save credential:', error);
      alert('Failed to save credential.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Credential Type:</label>
        <select 
          value={credentialType} 
          onChange={(e) => setCredentialType(e.target.value as CredentialType)}
        >
          <option value="Skill">Skill</option>
          <option value="Degree">Degree</option>
          <option value="Employment">Employment</option>
          <option value="Project">Project</option>
          <option value="Certification">Certification</option>
        </select>
      </div>
      <div>
        <label>Upload PDF:</label>
        <input
          type="file"
          accept=".pdf"
          onChange={(e) => setPdf(e.target.files ? e.target.files[0] : null)}
          required
        />
      </div>
      <button type="submit" disabled={!publicKey || !pdf}>
        Save Credential
      </button>
    </form>
  );
};

export default SaveCredentialForm;
