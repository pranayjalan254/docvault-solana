import React, { useRef, useEffect, useState } from "react";
import "./CredentialModal.css";

export interface CredentialModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  type: string;
  title: string;
  dateIssued: string;
  status: string;
  credentialId?: string;
  buttonPosition?: { x: number; y: number };
  publicKey?: string;
  details?: {
    university?: string;
    passoutYear?: string;
    projectUrl?: string;
    description?: string;
    skillLevel?: string;
    company?: string;
    position?: string;
    certificationProvider?: string;
  };
}

const CredentialModal: React.FC<CredentialModalProps> = ({
  isOpen,
  onClose,
  type,
  title,
  dateIssued,
  status,
  buttonPosition,
  details,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [animationClass, setAnimationClass] = useState("");

  useEffect(() => {
    if (isOpen) {
      setAnimationClass("modal-open");
    } else {
      setAnimationClass("modal-close");
    }
  }, [isOpen]);

  if (!isOpen && animationClass !== "modal-open") return null;

  const modalStyle = buttonPosition
    ? ({
        "--origin-x": `${buttonPosition.x}%`,
        "--origin-y": `${buttonPosition.y}%`,
      } as React.CSSProperties)
    : {};

  const renderDetails = () => {
    switch (type) {
      case "Degree":
        return (
          <>
            <p>
              <strong>University:</strong> {details?.university}
            </p>
            <p>
              <strong>Passout Year:</strong> {details?.passoutYear}
            </p>
          </>
        );
      case "Project":
        return (
          <>
            <p>
              <strong>Project URL:</strong>{" "}
              <a
                href={details?.projectUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {details?.projectUrl}
              </a>
            </p>
            <p>
              <strong>Description:</strong> {details?.description}
            </p>
          </>
        );
      case "Skill":
        return (
          <>
            <p>
              <strong>Skill Level:</strong> {details?.skillLevel}
            </p>
            <p>
              <strong>Description:</strong> {details?.description}
            </p>
          </>
        );
      case "Employment History":
        return (
          <>
            <p>
              <strong>Company:</strong> {details?.company}
            </p>
            <p>
              <strong>Position:</strong> {details?.position}
            </p>
            <p>
              <strong>Description:</strong> {details?.description}
            </p>
          </>
        );
      case "Certification":
        return (
          <>
            <p>
              <strong>Provider:</strong> {details?.certificationProvider}
            </p>
            <p>
              <strong>Description:</strong> {details?.description}
            </p>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        ref={modalRef}
        className={`modal-content ${animationClass}`}
        style={modalStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
        <h2>{type}</h2>
        <h3>{title}</h3>
        <p>
          <strong>Date Issued:</strong> {dateIssued}
        </p>
        <p>
          <strong>Verification Status:</strong> {status}
        </p>
        <div className="credential-details">{renderDetails()}</div>
      </div>
    </div>
  );
};

export default CredentialModal;
