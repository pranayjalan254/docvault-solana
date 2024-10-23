import React, { useState } from "react";
import CredentialFormBase from "./CredentialFormBase";

const DegreeForm: React.FC = () => {
  const [degreeName, setDegreeName] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [passoutYear, setPassoutYear] = useState("");
  const [proof, setProof] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log({ degreeName, collegeName, passoutYear, proof });
  };

  return (
    <CredentialFormBase
      title="Upload Your College Degree"
      onSubmit={handleSubmit}
    >
      <div className="form-group">
        <label>Degree Name</label>
        <input
          type="text"
          placeholder="Enter your degree name"
          value={degreeName}
          onChange={(e) => setDegreeName(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>College Name</label>
        <input
          type="text"
          placeholder="Enter your college name"
          value={collegeName}
          onChange={(e) => setCollegeName(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Passout Year</label>
        <input
          type="text"
          placeholder="Enter your passout year"
          value={passoutYear}
          onChange={(e) => setPassoutYear(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Upload Proofs (Transcripts/ID)</label>
        <input
          type="file"
          onChange={(e) => setProof(e.target.files?.[0] || null)}
        />
      </div>
    </CredentialFormBase>
  );
};

export default DegreeForm;
