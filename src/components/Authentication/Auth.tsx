import { FC, useEffect, useState } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useNavigate } from "react-router-dom";
import "./Auth.css";
import { useWallet } from "@solana/wallet-adapter-react";
import Modal from "../Modal/Modal";

export const AuthPage: FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(() => {
    return localStorage.getItem("termsAccepted") === "true";
  });
  const { publicKey } = useWallet();
  const navigate = useNavigate();

  const toggleModal = () => {
    setShowModal((prev) => !prev);
  };

  const toggleTermsModal = () => {
    setShowTermsModal((prev) => !prev);
  };

  const handleTermsAcceptance = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const accepted = event.target.checked;
    setTermsAccepted(accepted);
    localStorage.setItem("termsAccepted", accepted.toString());
  };

  useEffect(() => {
    if (publicKey) {
      navigate("/dashboard");
    }
  }, [publicKey, navigate]);

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1 className="auth-heading">Welcome to DocVault</h1>
        <p className="auth-description">
          Connect your Solana wallet to create your digital profile.
        </p>
        <div className="wallet-buttons">
          <WalletMultiButton
            className="wallet-button-connect"
            disabled={!termsAccepted}
          />
        </div>
        <div className="terms-section">
          <div className="terms-checkbox">
            <input
              type="checkbox"
              id="terms-acceptance"
              checked={termsAccepted}
              onChange={handleTermsAcceptance}
            />
            <div className="terms-label-container">
              <label htmlFor="terms-acceptance">I accept the</label>
              &nbsp;
              <button onClick={toggleTermsModal} className="terms-modal-button">
                Terms and Conditions
              </button>
            </div>
          </div>
        </div>
        <p className="no-wallet">
          Don't have a wallet?{" "}
          <span onClick={toggleModal} className="create-wallet-link">
            Create one here.
          </span>
        </p>
      </div>

      <Modal isOpen={showModal} onClose={toggleModal}>
        <h2>How to Set Up a Solana Wallet</h2>
        <ol>
          <li>
            Go to the{" "}
            <a
              href="https://phantom.app/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Phantom
            </a>
            &nbsp;/&nbsp;
            <a
              href="https://solflare.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Solflare
            </a>
            &nbsp; Wallet.
          </li>
          <li>
            Download and install the wallet extension for your browser or mobile
            device.
          </li>
          <li>Once installed, open the wallet and create a new account.</li>
          <li>Save your recovery phrase in a safe place.</li>
          <li>Return here and click "Connect Wallet" to proceed.</li>
        </ol>
        <button className="modal-close-button" onClick={toggleModal}>
          Got it!
        </button>
      </Modal>

      <Modal isOpen={showTermsModal} onClose={toggleTermsModal}>
        <h2>Terms and Conditions</h2>
        <div className="terms-content">
          <p>By using DocVault, you agree to the following terms:</p>
          <br></br>
          <ol>
            <li>
              Docvault is not responsible for any loss of funds due to bugs as
              it is currently in testing phase.
            </li>
            <li>You will not use this service for any illegal activities.</li>
            <li>
              Your uploaded proofs will be visible to the stakers. Make sure you
              do not expose any personal information in the PDFs
            </li>
          </ol>
        </div>

        <button className="modal-close-button" onClick={toggleTermsModal}>
          Close
        </button>
      </Modal>
    </div>
  );
};

export default AuthPage;
