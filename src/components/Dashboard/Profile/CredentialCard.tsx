import React, { useState } from "react";
import CredentialModal from "./CredentialModal";
import "./CredentialCard.css";

interface CredentialCardProps {
  type: string;
  title: string;
  dateIssued: string;
  status: string;
  // Add all possible credential details
  details?: {
    university?: string;
    cgpa?: string;
    projectUrl?: string;
    description?: string;
    skillLevel?: string;
    company?: string;
    position?: string;
    certificationProvider?: string;
    // Add other possible fields
  };
}

const CredentialCard: React.FC<CredentialCardProps> = ({
  type,
  title,
  dateIssued,
  status,
  details,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [buttonPosition, setButtonPosition] = useState<
    { x: number; y: number } | undefined
  >();

  const handleViewMore = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const viewportX = rect.left + rect.width / 2;
    const viewportY = rect.top + rect.height / 2;

    // Calculate position as percentages of viewport
    const posX = (viewportX / window.innerWidth) * 100;
    const posY = (viewportY / window.innerHeight) * 100;

    setButtonPosition({ x: posX, y: posY });
    setIsModalOpen(true);
  };

  return (
    <>
      <div className={`credential-card ${type.toLowerCase()}-card`}>
        <div className="card-header">
          <span className="card-type">{type}</span>
        </div>
        <div className="card-content">
          <h3>{title}</h3>
          <p>Date Issued: {dateIssued}</p>
          <p>Status: {status}</p>
          <button className="view-more-btn" onClick={handleViewMore}>
            View More
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
        buttonPosition={buttonPosition}
      />
    </>
  );
};

export default CredentialCard;
