import React, { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection } from "@solana/web3.js";
import { AnchorProvider } from "@project-serum/anchor";
import { toast } from "react-hot-toast";
import { CredentialModalProps as Credential } from "../Profile/CredentialModal/CredentialModal";
import { fetchUnverifiedCredentials } from "../../../utils/allCredentialUtils";
import CredentialCard from "../Profile/CredentialCard/CredentialCard";
import "./Staking.css";

const CACHE_DURATION = 0.5 * 60 * 1000; 
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

const Staking: React.FC = () => {
  const { wallet } = useWallet();
  const [unverifiedCredentials, setUnverifiedCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCredentialsWithRetry = async (retryCount = 0) => {
      if (!wallet) {
        setLoading(false);
        return;
      }

      // Check localStorage cache first
      const cachedData = localStorage.getItem("unverified-credentials");
      if (cachedData) {
        const { credentials: cached, timestamp } = JSON.parse(cachedData);
        if (Date.now() - timestamp < CACHE_DURATION) {
          setUnverifiedCredentials(cached);
          setLoading(false);
          return;
        }
      }

      try {
        const connection = new Connection("https://devnet.helius-rpc.com/?api-key=ea94ee9f-e6ca-4248-ae8a-65938ad4c6b4", "confirmed");
        const provider = new AnchorProvider(connection, wallet as any, {
          commitment: "confirmed",
        });

        const credentials = await fetchUnverifiedCredentials(provider);
        
        
        // Store in localStorage
        localStorage.setItem(
          "unverified-credentials",
          JSON.stringify({
            credentials: credentials,
            timestamp: Date.now(),
          })
        );

        setError(null);
        setUnverifiedCredentials(credentials);
      } catch (error) {
        console.error("Error fetching unverified credentials:", error);
        if (retryCount < MAX_RETRIES) {
          setTimeout(
            () => fetchCredentialsWithRetry(retryCount + 1),
            RETRY_DELAY
          );
        } else {
          setError("Failed to fetch credentials. Please try again later.");
          toast.error("Failed to fetch credentials");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCredentialsWithRetry();
  }, [wallet]);

  if (!wallet) {
    return (
      <div className="staking-container">
        <h2>Please connect your wallet to view unverified credentials</h2>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="staking-container">
        <h2>Loading unverified credentials...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="staking-container">
        <h2>Error: {error}</h2>
      </div>
    );
  }

  return (
    <div className="staking-container">
      <h2>Unverified Credentials</h2>
      <div className="credentials-grid">
        {unverifiedCredentials.length > 0 ? (
          unverifiedCredentials.map((credential, index) => (
            <CredentialCard
              key={index}
              type={credential.type}
              title={credential.title}
              dateIssued={credential.dateIssued}
              status={credential.status}
              details={credential.details}
              showVerifyButton={true}
            />
          ))
        ) : (
          <p>No unverified credentials found.</p>
        )}
      </div>
    </div>
  );
};

export default Staking;