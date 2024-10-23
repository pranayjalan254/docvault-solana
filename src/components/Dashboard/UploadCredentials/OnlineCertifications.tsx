import React, { useState } from "react";
import CredentialFormBase from "./CredentialFormBase";

const CertificationForm: React.FC = () => {
  const [certificationName, setCertificationName] = useState("");
  const [issuer, setIssuer] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [proof, setProof] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ certificationName, issuer, issueDate, proof });
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
        <label>Proof (e.g., Certificate Link or Upload)</label>
        <input
          type="text"
          value={proof}
          onChange={(e) => setProof(e.target.value)}
          placeholder="Enter proof link or upload file"
        />
      </div>
    </CredentialFormBase>
  );
};

export default CertificationForm;
