import React from "react";
import ReactDOM from "react-dom";
import "./Modal.css";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, children }) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="modal-backdrop">
      <div className="modal-wrapper">
        <div className="modal-main">{children}</div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
