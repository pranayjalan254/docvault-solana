import React, { useState } from "react";
import CredentialFormBase from "./CredentialFormBase";
import "./ProjectForm.css";

const ProjectForm: React.FC = () => {
  const [projectName, setProjectName] = useState("");
  const [collaborators, setCollaborators] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentlyWorking, setCurrentlyWorking] = useState(false);
  const [link, setLink] = useState("");
  const [projectDetails, setProjectDetails] = useState("");
  const [projectFiles, setProjectFiles] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({
      projectName,
      collaborators,
      startDate,
      endDate: currentlyWorking ? "Currently Working" : endDate,
      link,
      projectFiles,
    });
  };

  return (
    <CredentialFormBase title="Showcase your Projects" onSubmit={handleSubmit}>
      <div className="project-form-group">
        <label className="form-label">Project Name</label>
        <input
          type="text"
          className="form-input"
          placeholder="Enter your project name"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          required
        />
      </div>

      <div className="project-form-group">
        <label className="form-label">Project Description</label>
        <textarea
          className="form-textarea"
          placeholder="Enter project description"
          value={projectDetails}
          onChange={(e) => setProjectDetails(e.target.value)}
          rows={5}
          required
        />
      </div>

      <div className="project-form-group">
        <label className="form-label">Collaborators (if any)</label>
        <input
          type="text"
          className="form-input"
          placeholder="Enter collaborators"
          value={collaborators}
          onChange={(e) => setCollaborators(e.target.value)}
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
        <label className="form-label">Project Link (GitHub or Live)</label>
        <input
          type="text"
          className="form-input"
          placeholder="Enter project link"
          value={link}
          onChange={(e) => setLink(e.target.value)}
        />
      </div>

      <div className="project-form-group">
        <label className="form-label">Project File (Optional)</label>
        <input
          type="file"
          className="form-input file-input"
          onChange={(e) => setProjectFiles(e.target.files?.[0] || null)}
        />
      </div>
    </CredentialFormBase>
  );
};

export default ProjectForm;
