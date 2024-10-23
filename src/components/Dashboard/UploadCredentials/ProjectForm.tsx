import React, { useState } from "react";
import CredentialFormBase from "./CredentialFormBase";

const ProjectForm: React.FC = () => {
  const [projectName, setProjectName] = useState("");
  const [collaborators, setCollaborators] = useState("");
  const [timeline, setTimeline] = useState("");
  const [link, setLink] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ projectName, collaborators, timeline, link });
  };

  return (
    <CredentialFormBase
      title="Upload Your Project Credential"
      onSubmit={handleSubmit}
    >
      <div className="form-group">
        <label>Project Name</label>
        <input
          type="text"
          placeholder="Enter your project name"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Collaborators (if any)</label>
        <input
          type="text"
          placeholder="Enter collaborators"
          value={collaborators}
          onChange={(e) => setCollaborators(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Timeline</label>
        <input
          type="text"
          placeholder="Enter project timeline"
          value={timeline}
          onChange={(e) => setTimeline(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Project Link (GitHub or Live)</label>
        <input
          type="text"
          placeholder="Enter project link"
          value={link}
          onChange={(e) => setLink(e.target.value)}
        />
      </div>
    </CredentialFormBase>
  );
};

export default ProjectForm;
