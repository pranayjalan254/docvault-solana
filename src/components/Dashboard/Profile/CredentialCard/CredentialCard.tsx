import React, { useState } from "react";
import CredentialModal from "../CredentialModal/CredentialModal";
import "./CredentialCard.css";
import { CredentialModalProps } from "../CredentialModal/CredentialModal";

interface CredentialCardProps extends CredentialModalProps {
  showVerifyButton?: boolean;
  hideViewDetails?: boolean;
  progress?: number; // Add this prop
  progressColor?: string; // Add this prop
}

const CredentialCard: React.FC<CredentialCardProps> = ({
  type,
  title,
  dateIssued,
  status,
  details,
  showVerifyButton,
  hideViewDetails = false,
  progress,
  progressColor,
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

          {progress !== undefined && (
            <div className="progress-container">
              <div className="progress-info">
                <span>Verification Progress</span>
                <span className="progress-percentage">{progress}%</span>
              </div>
              <div className="fancy-progress-bar">
                <div
                  className="fancy-progress-fill"
                  style={{
                    width: `${progress}%`,
                    backgroundColor: progressColor,
                  }}
                >
                  <div className="fancy-progress-glow"></div>
                </div>
              </div>
            </div>
          )}

          {showVerifyButton && <button className="verify-btn">Verify</button>}
          {!hideViewDetails && (
            <button
              className="view-details-btn"
              onClick={() => setIsModalOpen(true)}
            >
              View Details
            </button>
          )}
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
