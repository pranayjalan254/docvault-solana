import React, { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection } from "@solana/web3.js";
import { AnchorProvider } from "@project-serum/anchor";
import { toast } from "react-hot-toast";
import { CredentialModalProps as Credential } from "../Profile/CredentialModal/CredentialModal";
import { fetchUnverifiedCredentials } from "../../../utils/allCredentialUtils";
import CredentialCard from "../Profile/CredentialCard/CredentialCard";
import "./Staking.css";

type CredentialType =
  | "Degree"
  | "Employment History"
  | "Project"
  | "Certificate"
  | "Skill";

interface CredentialFilter {
  type: CredentialType;
  active: boolean;
  color: string;
}

const CACHE_DURATION = 0.5 * 60 * 1000;
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

const Staking: React.FC = () => {
  const { wallet } = useWallet();
  const [unverifiedCredentials, setUnverifiedCredentials] = useState<
    Credential[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<CredentialFilter[]>([
    { type: "Degree", active: true, color: "#4CAF50" },
    { type: "Employment History", active: false, color: "#2196F3" },
    { type: "Project", active: false, color: "#FF9800" },
    { type: "Certificate", active: false, color: "#9C27B0" },
    { type: "Skill", active: false, color: "#F44336" },
  ]);
  const [activeType, setActiveType] = useState<CredentialType>("Degree");

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
        const connection = new Connection(
          "https://devnet.helius-rpc.com/?api-key=ea94ee9f-e6ca-4248-ae8a-65938ad4c6b4",
          "confirmed"
        );
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

  const handleFilterClick = (type: CredentialType) => {
    setActiveType(type);
    setFilters(
      filters.map((filter) => ({
        ...filter,
        active: filter.type === type,
      }))
    );
  };

  const getFilteredCredentials = () => {
    return unverifiedCredentials.filter((cred) => cred.type === activeType);
  };

  // Dummy progress data - replace with blockchain data later
  const getStakingProgress = (_credential: Credential) => {
    return Math.floor(Math.random() * 100);
  };

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
      <div>
        <div className="staking-container"></div>
        <h2>Error: {error}</h2>
      </div>
    );
  }

  return (
    <div className="staking-container">
      <h2>Verify Credentials</h2>

      <div className="filter-toggles">
        {filters.map((filter) => (
          <button
            key={filter.type}
            className={`filter-toggle ${
              filter.type === activeType ? "active" : ""
            }`}
            style={{
              backgroundColor:
                filter.type === activeType ? filter.color : "transparent",
              borderColor: filter.color,
              color: filter.type === activeType ? "white" : filter.color,
            }}
            onClick={() => handleFilterClick(filter.type)}
          >
            <span className="filter-label">{filter.type}</span>
            <span className="credential-count">
              (
              {
                unverifiedCredentials.filter((c) => c.type === filter.type)
                  .length
              }
              )
            </span>
          </button>
        ))}
      </div>

      <div className="credentials-grid">
        {getFilteredCredentials().length > 0 ? (
          getFilteredCredentials().map((credential, index) => (
            <div key={index}>
              <CredentialCard
                type={credential.type}
                title={credential.title}
                dateIssued={credential.dateIssued}
                status={credential.status}
                details={credential.details}
                showVerifyButton={true}
                hideViewDetails={true}
                progress={getStakingProgress(credential)}
                progressColor={
                  filters.find((f) => f.type === credential.type)?.color
                }
              />
            </div>
          ))
        ) : (
          <div className="no-credentials">
            <p>No {activeType} credentials found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Staking;
