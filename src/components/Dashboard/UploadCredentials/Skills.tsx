import React, { useState } from "react";
import CredentialFormBase from "./CredentialFormBase";

const SkillForm: React.FC = () => {
  const [skillName, setSkillName] = useState("");
  const [proficiency, setProficiency] = useState("");
  const [proof, setProof] = useState("");
  const [files, setFiles] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ skillName, proficiency, proof, files });
  };

  return (
    <CredentialFormBase title="Flaunt your skills" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Skill Name</label>
        <input
          type="text"
          value={skillName}
          onChange={(e) => setSkillName(e.target.value)}
          placeholder="Enter the skill name"
          required
        />
      </div>

      <div className="form-group">
        <label>Proficiency Level</label>
        <select
          value={proficiency}
          onChange={(e) => setProficiency(e.target.value)}
          required
        >
          <option value="">Select Proficiency</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
      </div>

      <div className="form-group">
        <label>Proof (e.g. Project/Portfolio Link)</label>
        <input
          type="text"
          value={proof}
          onChange={(e) => setProof(e.target.value)}
          placeholder="Enter proof link or file"
        />
      </div>
      <div className="form-group">
        <label>Upload Files if Any</label>
        <input
          type="file"
          onChange={(e) => setFiles(e.target.files?.[0] || null)}
        />
      </div>
    </CredentialFormBase>
  );
};

export default SkillForm;
