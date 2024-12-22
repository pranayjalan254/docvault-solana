import React from "react";
import "./CredentialFormBase.css";

interface CredentialFormBaseProps {
  title: string;
  onSubmit: (e: React.FormEvent) => void;
  children: React.ReactNode;
}

const CredentialFormBase: React.FC<CredentialFormBaseProps> = ({
  title,
  onSubmit,
  children,
}) => {
  return (
    <div className="credential-form-base fade-in">
      <h2>{title}</h2>
      <form onSubmit={onSubmit}>
        {children}
        <button type="submit">Save</button>
      </form>
    </div>
  );
};

export default CredentialFormBase;
