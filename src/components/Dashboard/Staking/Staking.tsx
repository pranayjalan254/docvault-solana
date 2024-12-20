import React, { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { AnchorProvider } from "@project-serum/anchor";
import { CredentialModalProps } from "../Profile/CredentialModal/CredentialModal";
import { fetchAllUnverifiedCredentials } from "../../../utils/allCredentialUtils";
import "./Staking.css";
import { Connection } from "@solana/web3.js";

const Staking: React.FC = () => {
  const [unverifiedCredentials, setUnverifiedCredentials] = useState<
    CredentialModalProps[]
  >([]);
  const [loading, setLoading] = useState(true);
  const { connected } = useWallet();
  const connection = new Connection(
    "https://api.devnet.solana.com",
    "confirmed"
  );
  const provider = new AnchorProvider(connection, window as any, {
    commitment: "confirmed",
  });

  useEffect(() => {
    const loadCredentials = async () => {
      if (!connected || !provider) return;

      try {
        setLoading(true);
        const credentials = await fetchAllUnverifiedCredentials(provider);
        setUnverifiedCredentials(credentials);
      } catch (error) {
        console.error("Error loading unverified credentials:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCredentials();
  }, [connected, provider]);

  if (!connected) {
    return (
      <div>Please connect your wallet to view unverified credentials.</div>
    );
  }

  if (loading) {
    return <div>Loading unverified credentials...</div>;
  }

  return (
    <div className="staking-container">
      <h2>Verify Credentials</h2>
      <div className="credentials-grid">
        {unverifiedCredentials.map((credential, index) => (
          <div key={index} className="credential-card">
            <h3>{credential.type}</h3>
            <p>
              <strong>Title:</strong> {credential.title}
            </p>
            <p>
              <strong>Date:</strong> {credential.dateIssued}
            </p>

            <button className="verify-button">Stake to Verify</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Staking;
