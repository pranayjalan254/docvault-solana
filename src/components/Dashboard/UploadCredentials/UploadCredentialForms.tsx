import React from "react";
import DegreeForm from "./DegreeForm";
import ProjectForm from "./ProjectForm";
import SkillForm from "./Skills";
import EmploymentHistoryForm from "./EmployHistory";
import CertificationForm from "./OnlineCertifications";

interface UploadCredentialFormsProps {
  credentialType: string;
}

const UploadCredentialForms: React.FC<UploadCredentialFormsProps> = ({
  credentialType,
}) => {
  switch (credentialType) {
    case "Degree":
      return <DegreeForm />;
    case "Project":
      return <ProjectForm />;
    case "Skill":
      return <SkillForm />;
    case "Employment History":
      return <EmploymentHistoryForm />;
    case "Certification":
      return <CertificationForm />;
    default:
      return <div>Please select a credential type to upload.</div>;
  }
};

export default UploadCredentialForms;
