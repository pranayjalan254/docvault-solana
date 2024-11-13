import React, { useState } from "react";
import CredentialFormBase from "./CredentialFormBase";

const CertificationForm: React.FC = () => {
  const [certificationName, setCertificationName] = useState("");
  const [issuer, setIssuer] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [proof, setProof] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proof && !proofFile) {
      alert("Please provide either a proof link or upload a certificate file");
      return;
    }
    console.log({ certificationName, issuer, issueDate, proof, proofFile });
  };

  return (
    <CredentialFormBase
      title="Upload Your Certification"
      onSubmit={handleSubmit}
    >
      <div className="form-group">
        <label>Certification Name</label>
        <input
          type="text"
          value={certificationName}
          onChange={(e) => setCertificationName(e.target.value)}
          placeholder="Enter the certification name"
          required
        />
      </div>

      <div className="form-group">
        <label>Issuer (e.g., Authority/Institution)</label>
        <input
          type="text"
          value={issuer}
          onChange={(e) => setIssuer(e.target.value)}
          placeholder="Enter the issuing authority"
          required
        />
      </div>

      <div className="form-group">
        <label>Date of Issue</label>
        <input
          type="date"
          value={issueDate}
          onChange={(e) => setIssueDate(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label>Proof (e.g., Certificate Link)</label>
        <input
          type="text"
          value={proof}
          onChange={(e) => setProof(e.target.value)}
          placeholder="Enter proof link or upload certificate below"
          required={!proofFile}
        />
      </div>
      <div className="form-group">
        <label>Upload Certificate</label>
        <input
          type="file"
          onChange={(e) => setProofFile(e.target.files?.[0] || null)}
          required={!proof}
        />
      </div>
    </CredentialFormBase>
  );
};

export default CertificationForm;
