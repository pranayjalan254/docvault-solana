import React, { useState } from "react";
import CredentialFormBase from "./CredentialFormBase";

const EmploymentHistoryForm: React.FC = () => {
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentlyWorking, setCurrentlyWorking] = useState(false);
  const [projectFiles, setProjectFiles] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({
      companyName,
      startDate,
      endDate: currentlyWorking ? "Currently Working" : endDate,
      projectFiles,
    });
  };

  return (
    <CredentialFormBase title="Employment History" onSubmit={handleSubmit}>
      <div className="project-form-group">
        <label className="form-label">Company Name</label>
        <input
          type="text"
          className="form-input"
          placeholder="Enter your company name"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          required
        />
      </div>

      <div className="project-form-group">
        <label className="form-label">Job Title</label>
        <input
          type="text"
          className="form-input"
          placeholder="Enter your designation"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          required
        />
      </div>

      {/* Start Date and End Date Section */}
      <div className="project-form-group timeline-group">
        <div className="date-input">
          <label className="form-label">Start Date</label>
          <input
            type="date"
            className="form-input date-picker"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>

        <div className="date-input">
          <label className="form-label">End Date</label>
          <input
            type="date"
            className="form-input date-picker"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            disabled={currentlyWorking}
          />
        </div>
      </div>

      {/* Checkbox for Currently Working */}
      <div className="project-form-group checkbox-group">
        <label className="form-checkbox">
          <input
            type="checkbox"
            className="checkbox-input"
            checked={currentlyWorking}
            onChange={(e) => setCurrentlyWorking(e.target.checked)}
          />
          Currently Working
        </label>
      </div>

      <div className="project-form-group">
        <label className="form-label">Proofs (Employment/Offer Letter)</label>
        <input
          type="file"
          className="form-input file-input"
          onChange={(e) => setProjectFiles(e.target.files?.[0] || null)}
          required
        />
      </div>
    </CredentialFormBase>
  );
};

export default EmploymentHistoryForm;
