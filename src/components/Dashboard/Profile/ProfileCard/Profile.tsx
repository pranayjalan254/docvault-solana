import React, { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection } from "@solana/web3.js";
import { AnchorProvider } from "@project-serum/anchor";
import "./Profile.css";
import CredentialCard from "../CredentialCard/CredentialCard";
import { QRCodeCanvas } from "qrcode.react";
import {
  fetchAllCredentials,
  Credential,
} from "../../../../utils/credentialUtils";

const CACHE_DURATION = 60000;

const Profile: React.FC = () => {
  const { publicKey, wallet } = useWallet();
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const [cachedCredentials, setCachedCredentials] = useState<Credential[]>([]);

  const getShareableLink = () => {
    if (!publicKey) return "";
    return `${window.location.origin}/profile/${publicKey.toString()}`;
  };

  useEffect(() => {
    const fetchCredentials = async () => {
      if (!publicKey || !wallet) {
        setLoading(false);
        return;
      }

      // Check cache
      const now = Date.now();
      if (
        now - lastFetchTime < CACHE_DURATION &&
        cachedCredentials.length > 0
      ) {
        setCredentials(cachedCredentials);
        setLoading(false);
        return;
      }

      try {
        const connection = new Connection(
          "https://api.devnet.solana.com",
          "confirmed"
        );
        const provider = new AnchorProvider(connection, wallet as any, {
          commitment: "confirmed",
        });

        const formattedCredentials = await fetchAllCredentials(
          publicKey,
          provider
        );

        setError(null);
        setCredentials(formattedCredentials);
        setCachedCredentials(formattedCredentials);
        setLastFetchTime(Date.now());
      } catch (error) {
        console.error("Error fetching credentials:", error);
        setError("Failed to load credentials. Please try refreshing the page.");
        setCredentials([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCredentials();
  }, [publicKey, wallet, lastFetchTime, cachedCredentials]);

  if (loading) {
    return (
      <div className="profile-content fade-in">Loading credentials...</div>
    );
  }

  if (error) {
    return <div className="profile-content fade-in error-message">{error}</div>;
  }

  return (
    <div className="profile-content fade-in">
      <h2>Your Uploaded Credentials</h2>
      <div className="credentials-container">
        {credentials.length > 0 ? (
          credentials.map((credential, index) => (
            <CredentialCard
              key={index}
              type={credential.type}
              title={credential.title}
              dateIssued={credential.dateIssued}
              status={credential.status}
              details={credential.details}
            />
          ))
        ) : (
          <p>No credentials found. Start by uploading your first credential!</p>
        )}
      </div>
      <div className="qr-code">
        <QRCodeCanvas value={getShareableLink()} />
      </div>
    </div>
  );
};

export default Profile;
