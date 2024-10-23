import React from "react";
import "./Navbar.css";
import { WalletDisconnectButton } from "@solana/wallet-adapter-react-ui";

const Navbar: React.FC = () => {
  return (
    <nav className="navbar">
      <h1 className="dashboard-title">DocVault Dashboard</h1>
      <WalletDisconnectButton>Disconnect Wallet</WalletDisconnectButton>
    </nav>
  );
};

export default Navbar;
