import React from "react";
import "./Profile.css";
import CredentialCard from "./CredentialCard";

const Profile: React.FC = () => {
  const dummyCredentials = [
    {
      type: "Degree",
      title: "Bachelor's in Computer Science",
      dateIssued: "01/09/2023",
      status: "Verified",
    },
    {
      type: "Project",
      title: "Blockchain Development",
      dateIssued: "01/07/2023",
      status: "Verified",
    },
    {
      type: "Skill",
      title: "React & TypeScript Development",
      dateIssued: "15/08/2023",
      status: "Verified",
    },
    {
      type: "Employment History",
      title: "Software Engineer at ABC Corp",
      dateIssued: "01/10/2022 - Present",
      status: "Verified",
    },
    {
      type: "Certification",
      title: "Solidity Smart Contract Development",
      dateIssued: "12/06/2023",
      status: "Verified",
    },
  ];

  return (
    <div className="profile-content fade-in">
      <h2>Your Uploaded Credentials</h2>
      <div className="credentials-container">
        {dummyCredentials.map((credential, index) => (
          <CredentialCard
            key={index}
            type={credential.type}
            title={credential.title}
            dateIssued={credential.dateIssued}
            status={credential.status}
          />
        ))}
      </div>
    </div>
  );
};

export default Profile;
