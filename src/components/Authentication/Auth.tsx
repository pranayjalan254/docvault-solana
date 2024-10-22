import { FC, useMemo, useState } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { UnsafeBurnerWalletAdapter } from "@solana/wallet-adapter-wallets";
import {
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import "./Auth.css";
import "@solana/wallet-adapter-react-ui/styles.css";

export const AuthPage: FC = () => {
  const [showModal, setShowModal] = useState(false); // State for modal
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets = useMemo(() => [new UnsafeBurnerWalletAdapter()], [network]);

  // Function to toggle modal visibility
  const toggleModal = () => {
    setShowModal(!showModal);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1 className="auth-heading">Welcome to DocVault</h1>
        <p className="auth-description">
          Connect your Solana wallet to create your digital profile.
        </p>

        <ConnectionProvider endpoint={endpoint}>
          <WalletProvider wallets={wallets} autoConnect>
            <WalletModalProvider>
              <div className="wallet-buttons">
                <WalletMultiButton className="wallet-button-connect" />
              </div>
            </WalletModalProvider>
          </WalletProvider>
        </ConnectionProvider>

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
