import React from "react";
import "./CredentialCard.css";

interface CredentialCardProps {
  type: string;
  title: string;
  dateIssued: string;
  status: string;
}

const CredentialCard: React.FC<CredentialCardProps> = ({
  type,
  title,
  dateIssued,
  status,
}) => {
  return (
    <div className={`credential-card ${type.toLowerCase()}-card`}>
      <div className="card-header">
        <span className="card-type">{type}</span>
      </div>
      <div className="card-content">
        <h3>{title}</h3>
        <p>Date Issued: {dateIssued}</p>
        <p>Status: {status}</p>
      </div>
    </div>
  );
};

export default CredentialCard;
