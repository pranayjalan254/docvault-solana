import React, { useState } from "react";
import CredentialFormBase from "./CredentialFormBase";

const EmploymentHistoryForm: React.FC = () => {
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [proof, setProof] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ companyName, jobTitle, startDate, endDate, proof });
  };

  return (
    <CredentialFormBase
      title="Upload Your Employment History"
      onSubmit={handleSubmit}
    >
      <div className="form-group">
        <label>Company Name</label>
        <input
          type="text"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="Enter the company name"
          required
        />
      </div>

      <div className="form-group">
        <label>Job Title</label>
        <input
          type="text"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          placeholder="Enter your job title"
          required
        />
      </div>

      <div className="form-group">
        <label>Start Date</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label>End Date</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Upload Proofs (Offer Letter, etc)</label>
        <input
          type="file"
          onChange={(e) => setProof(e.target.files?.[0] || null)}
        />
      </div>
    </CredentialFormBase>
  );
};

export default EmploymentHistoryForm;
