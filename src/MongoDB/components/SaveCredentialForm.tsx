import React, { useState } from 'react';
import { saveCredentialWithPDF } from '../utils/saveCredential';
import { useWallet } from "@solana/wallet-adapter-react";

interface Metadata {
  [key: string]: any;
}

const SaveCredentialForm: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [issuer, setIssuer] = useState('');
  const [issuanceDate, setIssuanceDate] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [metadata, setMetadata] = useState('');
  const [pdf, setPdf] = useState<File | null>(null);
  const { publicKey } = useWallet();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey || !pdf) {
      alert('Wallet not connected or PDF not selected.');
      return;
    }

    try {
      const pdfUrl = await uploadPdf(pdf);

      const credentialData = {
        title,
        description,
        issuer,
        issuanceDate: new Date(issuanceDate),
        expirationDate: expirationDate ? new Date(expirationDate) : undefined,
        holderAddress: publicKey.toBase58(),
        metadata: metadata ? JSON.parse(metadata) : undefined,
      };

      await saveCredentialWithPDF(credentialData, pdfUrl);
      alert('Credential saved successfully.');
      // Reset form
      setTitle('');
      setDescription('');
      setIssuer('');
      setIssuanceDate('');
      setExpirationDate('');
      setMetadata('');
      setPdf(null);
    } catch (error) {
      console.error('Failed to save credential:', error);
      alert('Failed to save credential.');
    }
  };

  const uploadPdf = async (file: File): Promise<string> => {
    // Implement your PDF upload logic here
    // This is a placeholder implementation
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('https://your-upload-endpoint.com/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload PDF');
    }

    const data = await response.json();
    return data.url; // Adjust based on your upload response
  };



export default SaveCredentialForm;
