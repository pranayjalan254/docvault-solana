import React, { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection } from "@solana/web3.js";
import { AnchorProvider, Program, web3, BN } from "@project-serum/anchor";
import { toast } from "react-hot-toast";
import { CredentialModalProps } from "../Profile/CredentialModal/CredentialModal";
import { utf8 } from "@project-serum/anchor/dist/cjs/utils/bytes";

import { fetchUnverifiedCredentials } from "../../../utils/allCredentialUtils";
import CredentialCard from "../Profile/CredentialCard/CredentialCard";
import "./Staking.css";
import { IDL } from "../../../../smart contracts/stakeidl";
import { Credential } from "./Credential";

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
const STAKE_AMOUNT = 0.01 * web3.LAMPORTS_PER_SOL;
const DEVNET_ENDPOINT = "https://api.devnet.solana.com";

interface StakingState {
  isStaking: boolean;
  isVoting: boolean;
  isClaiming: boolean;
  stakingError: string | null;
}

const Staking: React.FC = () => {
  const { publicKey, signTransaction, signAllTransactions } = useWallet();
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
  const [stakingState, setStakingState] = useState<
    Record<string, StakingState>
  >({});

  useEffect(() => {
    const fetchCredentialsWithRetry = async (retryCount = 0) => {
      if (!publicKey) {
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
        const connection = new Connection(DEVNET_ENDPOINT, "confirmed");
        const wallet = {
          publicKey,
          signTransaction,
          signAllTransactions,
        };
        const provider = new AnchorProvider(connection, wallet as any, {
          commitment: "confirmed",
        });

        const fetchedCredentials = await fetchUnverifiedCredentials(provider);

        // Generate unique IDs using timestamp and index
        const credentials = fetchedCredentials.map(
          (cred: CredentialModalProps, index: number) => ({
            ...cred,
            id: `${Date.now()}-${index}`, // Unique ID
            publicKey: cred.publicKey || `credential-${Date.now()}-${index}`, // Fallback public key
          })
        );

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
  }, [publicKey]);

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

  const initializeProgram = () => {
    if (!publicKey || !signTransaction || !signAllTransactions) return null;

    const wallet = {
      publicKey,
      signTransaction,
      signAllTransactions,
    };

    const devnetConnection = new Connection(DEVNET_ENDPOINT, {
      commitment: "confirmed",
      confirmTransactionInitialTimeout: 60000,
    });

    const provider = new AnchorProvider(devnetConnection, wallet, {
      commitment: "confirmed",
      preflightCommitment: "confirmed",
      skipPreflight: false,
    });

    return new Program(
      IDL as any,
      "HEqjbSEneAypSr9p8RhrjuK4wz98jfDZykmEDyjBcX4m",
      provider
    );
  };

  const deriveCredentialPDA = (program: Program, credentialId: string) => {
    const credentialSeed = utf8.encode(credentialId);
    const [credentialPDA] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("credential"), credentialSeed],
      program.programId
    );
    return credentialPDA;
  };

  const checkCredentialAccountExists = async (
    credentialPDA: web3.PublicKey
  ) => {
    const program = initializeProgram();
    if (!program) return false;
    try {
      await program.account.credential.fetch(credentialPDA);
      return true;
    } catch (error) {
      return false;
    }
  };

  const initializeCredentialAccount = async (credentialId: string) => {
    const program = initializeProgram();
    if (!program || !publicKey) return null;
    try {
      const credentialPDA = deriveCredentialPDA(program, credentialId);
      console.log("Initializing credential with ID:", credentialId);
      console.log("Derived PDA:", credentialPDA.toBase58());

      // Check if credential account already exists
      const exists = await checkCredentialAccountExists(credentialPDA);
      if (exists) {
        console.log("Credential account already exists");
        return credentialPDA;
      }

      await program.methods
        .initializeCredential(credentialId, new BN(STAKE_AMOUNT))
        .accounts({
          credential: credentialPDA,
          authority: publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .rpc();

      return credentialPDA;
    } catch (error) {
      console.error("Initialization error:", error);
      return null;
    }
  };

  const handleStake = async (credentialId: string) => {
    const program = initializeProgram();
    if (!program || !publicKey) {
      toast.error("Please connect your wallet");
      return;
    }

    setStakingState((prev) => ({
      ...prev,
      [credentialId]: {
        ...prev[credentialId],
        isStaking: true,
        stakingError: null,
      },
    }));

    try {
      const credentialPDA = deriveCredentialPDA(program, credentialId);
      const [verifierPDA] = web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("verifier"),
          credentialPDA.toBuffer(),
          publicKey.toBuffer(),
        ],
        program.programId
      );

      // Check if verifier account already exists
      try {
        await program.account.verifier.fetch(verifierPDA);
        toast.error("You have already staked for this credential");
        return;
      } catch (error) {}

      // Initialize credential if it doesn't exist
      if (!(await checkCredentialAccountExists(credentialPDA))) {
        await initializeCredentialAccount(credentialId);
      }

      await program.methods
        .stakeForCredential()
        .accounts({
          credential: credentialPDA,
          verifier: verifierPDA,
          authority: publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .rpc();

      toast.success("Successfully staked for credential verification");
    } catch (error) {
      console.error("Staking error:", error);
      setStakingState((prev) => ({
        ...prev,
        [credentialId]: {
          ...prev[credentialId],
          stakingError: "Failed to stake",
        },
      }));
      toast.error("Failed to stake");
    } finally {
      setStakingState((prev) => ({
        ...prev,
        [credentialId]: { ...prev[credentialId], isStaking: false },
      }));
    }
  };

  const handleVote = async (credentialId: string, isAuthentic: boolean) => {
    const program = initializeProgram();
    if (!program || !publicKey) {
      toast.error("Please connect your wallet");
      return;
    }

    setStakingState((prev) => ({
      ...prev,
      [credentialId]: {
        ...prev[credentialId],
        isVoting: true,
        stakingError: null,
      },
    }));

    try {
      const credentialPDA = deriveCredentialPDA(program, credentialId);
      const [verifierPDA] = web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("verifier"),
          credentialPDA.toBuffer(),
          publicKey.toBuffer(),
        ],
        program.programId
      );

      await program.methods
        .makeDecision(isAuthentic)
        .accounts({
          credential: credentialPDA,
          verifier: verifierPDA,
          authority: publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .rpc();

      toast.success("Successfully voted on credential");
    } catch (error) {
      console.error("Voting error:", error);
      toast.error("Failed to vote");
    } finally {
      setStakingState((prev) => ({
        ...prev,
        [credentialId]: { ...prev[credentialId], isVoting: false },
      }));
    }
  };

  const handleClaim = async (credentialId: string) => {
    const program = initializeProgram();
    if (!program || !publicKey) {
      toast.error("Please connect your wallet");
      return;
    }

    setStakingState((prev) => ({
      ...prev,
      [credentialId]: {
        ...prev[credentialId],
        isClaiming: true,
        stakingError: null,
      },
    }));

    try {
      const credentialPDA = deriveCredentialPDA(program, credentialId);
      const [verifierPDA] = web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("verifier"),
          credentialPDA.toBuffer(),
          publicKey.toBuffer(),
        ],
        program.programId
      );

      await program.methods
        .claimReward()
        .accounts({
          credential: credentialPDA,
          verifier: verifierPDA,
          authority: publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .rpc();

      toast.success("Successfully claimed reward");
    } catch (error) {
      console.error("Claim error:", error);
      toast.error("Failed to claim reward");
    } finally {
      setStakingState((prev) => ({
        ...prev,
        [credentialId]: { ...prev[credentialId], isClaiming: false },
      }));
    }
  };

  if (!publicKey) {
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
            <div key={index} className="credential-card-wrapper">
              <div className="credential-content">
                <CredentialCard
                  type={credential.type}
                  title={credential.title}
                  dateIssued={credential.dateIssued}
                  status={credential.status}
                  details={credential.details}
                  hideViewDetails={true}
                  progress={getStakingProgress(credential)}
                  progressColor={
                    filters.find((f) => f.type === credential.type)?.color
                  }
                />
              </div>
              <div className="staking-actions">
                <button
                  className="stake-button"
                  onClick={() => handleStake(credential.id)}
                  disabled={stakingState[credential.id]?.isStaking}
                >
                  {stakingState[credential.id]?.isStaking
                    ? "Staking..."
                    : "Stake"}
                </button>
                <div className="voting-buttons">
                  <button
                    className="vote-authentic"
                    onClick={() => handleVote(credential.id, true)}
                    disabled={stakingState[credential.id]?.isVoting}
                  >
                    Verify
                  </button>
                  <button
                    className="vote-inauthentic"
                    onClick={() => handleVote(credential.id, false)}
                    disabled={stakingState[credential.id]?.isVoting}
                  >
                    Reject
                  </button>
                </div>
                <button
                  className="claim-button"
                  onClick={() => handleClaim(credential.id)}
                  disabled={stakingState[credential.id]?.isClaiming}
                >
                  {stakingState[credential.id]?.isClaiming
                    ? "Claiming..."
                    : "Claim Reward"}
                </button>
              </div>
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
