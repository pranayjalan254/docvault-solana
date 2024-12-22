
import React, { useState } from 'react';
import { saveCredentialWithPDF } from '../utils/saveCredential';
import { AnchorProvider } from "@project-serum/anchor";
import { useWallet } from "@solana/wallet-adapter-react";

const SaveCredentialForm: React.FC = () => {
  const [credentialId, setCredentialId] = useState('');
  const [stakeAmount, setStakeAmount] = useState(0);
  const [pdf, setPdf] = useState<File | null>(null);
  const { publicKey } = useWallet();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey || !pdf) return;

    // Upload PDF to storage and get URL (implementation not shown)
    const pdfUrl = await uploadPdf(pdf);

    const credentialData = {
      credentialId,
      stakeAmount,
      verifications: [],
      authenticVotes: 0,
      totalStaked: stakeAmount,
      isFinalized: false,
    };

    try {
      await saveCredentialWithPDF(credentialData, pdfUrl);
      alert('Credential saved successfully.');
      // Reset form
      setCredentialId('');
      setStakeAmount(0);
      setPdf(null);
    } catch (error) {
      console.error('Failed to save credential:', error);
      alert('Failed to save credential.');
    }
  };

  const uploadPdf = async (file: File): Promise<string> => {
    // Implement PDF upload logic here
    // Return the URL of the uploaded PDF
    return 'https://example.com/path-to-uploaded-pdf.pdf';
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Credential ID:</label>
        <input
          type="text"
          value={credentialId}
          onChange={(e) => setCredentialId(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Stake Amount:</label>
        <input
          type="number"
          value={stakeAmount}
          onChange={(e) => setStakeAmount(Number(e.target.value))}
          required
        />
      </div>
      <div>
        <label>PDF Document:</label>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setPdf(e.target.files ? e.target.files[0] : null)}
          required
        />
      </div>
      <button type="submit">Save Credential</button>
    </form>
  );
};

export default SaveCredentialForm;
