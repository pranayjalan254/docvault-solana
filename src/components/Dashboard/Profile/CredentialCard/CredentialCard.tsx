import React, { useState } from "react";
import CredentialModal from "../CredentialModal/CredentialModal";
import "./CredentialCard.css";
import { CredentialModalProps } from "../CredentialModal/CredentialModal";

const CredentialCard: React.FC<CredentialModalProps> = ({
  type,
  title,
  dateIssued,
  status,
  details,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "verified":
        return "status-verified";
      case "rejected":
        return "status-rejected";
      default:
        return "status-pending";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "degree":
        return "Degree 🎓";
      case "project":
        return "Project 💻";
      case "skill":
        return "Skill ⚡";
      case "employment history":
        return "Employment History 💼";
      case "certification":
        return "Certification 📜";
      default:
        return "📄";
    }
  };

  return (
    <>
      <div className="credential-card">
        <div className="card-header">
          <span className="card-icon">{getTypeIcon(type)}</span>
          <span className={`status-badge ${getStatusColor(status)}`}>
            {status}
          </span>
        </div>
        <div className="card-content">
          <h3 className="card-title">{title}</h3>
          <div className="card-details">
            {details?.university && (
              <p className="detail-item">
                <span className="detail-label">University:</span>
                <span className="detail-value">{details.university}</span>
              </p>
            )}
            {details?.company && (
              <p className="detail-item">
                <span className="detail-label">Company:</span>
                <span className="detail-value">{details.company}</span>
              </p>
            )}
            {details?.skillLevel && (
              <p className="detail-item">
                <span className="detail-label">Level:</span>
                <span className="detail-value">{details.skillLevel}</span>
              </p>
            )}
            <p className="detail-item">
              <span className="detail-label">Date Issued:</span>
              <span className="detail-value">{dateIssued}</span>
            </p>
          </div>
          <button
            className="view-details-btn"
            onClick={() => setIsModalOpen(true)}
          >
            View Details
          </button>
        </div>
      </div>

      <CredentialModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        type={type}
        title={title}
        dateIssued={dateIssued}
        status={status}
        details={details}
      />
    </>
  );
};

export default CredentialCard;
