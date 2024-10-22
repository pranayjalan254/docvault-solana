import { FC, useEffect, useState } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useNavigate } from "react-router-dom";
import "./Auth.css";
import { useWallet } from "@solana/wallet-adapter-react";

export const AuthPage: FC = () => {
  const [showModal, setShowModal] = useState(false);
  const { publicKey } = useWallet();
  const navigate = useNavigate();
  const toggleModal = () => {
    setShowModal(!showModal);
  };
  useEffect(() => {
    const storedPublicKey = localStorage.getItem("publicKey");
    if (storedPublicKey) {
      navigate("/dashboard");
    } else if (publicKey) {
      localStorage.setItem("publicKey", publicKey.toString());
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
          <WalletMultiButton className="wallet-button-connect" />
        </div>
        <p className="no-wallet">
          Don't have a wallet?{" "}
          <span onClick={toggleModal} className="create-wallet-link">
            Create one here.
          </span>
        </p>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={toggleModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
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
                Download and install the wallet extension for your browser or
                mobile device.
              </li>
              <li>Once installed, open the wallet and create a new account.</li>
              <li>Save your recovery phrase in a safe place.</li>
              <li>Return here and click "Connect Wallet" to proceed.</li>
            </ol>
            <button className="modal-close-button" onClick={toggleModal}>
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthPage;
