import React, { useState } from "react";
import "./Dashboard.css";
import Navbar from "../Navbar/Navbar";
import Sidebar from "../Sidebar/Sidebar";
import Profile from "../Profile/Profile";
import UploadCredentialForms from "../UploadCredentials/UploadCredentialForms";

const Dashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>("Profile");

  return (
    <div className="dashboard-container">
      <Navbar />
      <div className="main-content">
        <Sidebar
          setActiveSection={setActiveSection}
          activeSection={activeSection}
        />
        <div className="dashboard-content">
          {activeSection === "Profile" && <Profile />}
          {activeSection === "Upload Credentials" && (
            <UploadCredentialForms credentialType={""} />
          )}
          {activeSection === "Degree" && (
            <UploadCredentialForms credentialType="Degree" />
          )}
          {activeSection === "Project" && (
            <UploadCredentialForms credentialType="Project" />
          )}
          {activeSection === "Skill" && (
            <UploadCredentialForms credentialType="Skill" />
          )}
          {activeSection === "Employment History" && (
            <UploadCredentialForms credentialType="Employment History" />
          )}
          {activeSection === "Certification" && (
            <UploadCredentialForms credentialType="Certification" />
          )}
          {activeSection === "Staking" && (
            <div className="staking-section">Staking Section Coming Soon!</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
