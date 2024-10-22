import React from "react";
import "./Dashboard.css";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletDisconnectButton } from "@solana/wallet-adapter-react-ui";

const Dashboard: React.FC = () => {
  const { publicKey } = useWallet();

  const handleDisconnect = () => {
    localStorage.removeItem("publicKey");
  };

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <h1 className="dashboard-title">DocVault Dashboard</h1>
        <WalletDisconnectButton onClick={handleDisconnect}>
          Disconnected
        </WalletDisconnectButton>
      </nav>

      <div className="dashboard-content">
        <section className="profile-section">
          <div className="profile-card fade-in">
            <h2>Profile Information</h2>
            <p>Wallet Address: {publicKey?.toString()}</p>
            <p>Status: Verified</p>
          </div>
        </section>

        <section className="credentials-section fade-in">
          <div className="credentials-card">
            <h2>Issued Credentials</h2>
            <ul>
              <li>Degree: Bachelor's in Computer Science</li>
              <li>Date Issued: 01/09/2023</li>
              <li>Status: Verified</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
