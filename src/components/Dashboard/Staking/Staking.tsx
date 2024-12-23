import React, { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection } from "@solana/web3.js";
import { AnchorProvider, Program, web3, BN } from "@project-serum/anchor";
import { toast } from "react-hot-toast";
import { utf8 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import { InfoCircleOutlined } from "@ant-design/icons";
import { Tooltip } from "antd";

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

// Update CredentialState interface to include authenticVotes
interface CredentialState {
  verifierCount: number;
  isFinalized: boolean;
  authenticVotes: number; // Add this
}

// Update VerifierInfo to include the user's vote
interface VerifierInfo {
  hasVoted: boolean;
  hasClaimed: boolean;
  votedAuthentic: boolean; // Add this
}

interface TransactionState {
  signature?: string;
  confirmed: boolean;
  error?: string;
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
  const [credentialStates, setCredentialStates] = useState<
    Record<string, CredentialState>
  >({});
  const [stakedCredentials, setStakedCredentials] = useState<Set<string>>(
    new Set()
  );
  const [verifierStates, setVerifierStates] = useState<
    Record<string, VerifierInfo>
  >({});
  const [_transactions, setTransactions] = useState<
    Record<string, TransactionState>
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

        // Store in localStorage
        localStorage.setItem(
          "unverified-credentials",
          JSON.stringify({
            credentials: fetchedCredentials,
            timestamp: Date.now(),
          })
        );
        setError(null);
        // @ts-ignore
        setUnverifiedCredentials(fetchedCredentials);
        // Immediately update on-chain states
        await updateCredentialStates();
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

  const getStakingProgress = (credentialId: string) => {
    const state = credentialStates[credentialId];
    if (!state) return 0;
    return Math.min((state.verifierCount / 10) * 100, 100);
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

  const confirmTransaction = async (signature: string) => {
    const connection = new Connection(DEVNET_ENDPOINT);
    try {
      await connection.confirmTransaction(signature, "confirmed");
      return true;
    } catch (error) {
      console.error("Transaction confirmation error:", error);
      return false;
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

      const tx = await program.methods
        .stakeForCredential()
        .accounts({
          credential: credentialPDA,
          verifier: verifierPDA,
          authority: publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .rpc();

      setTransactions((prev) => ({
        ...prev,
        [credentialId]: { signature: tx, confirmed: false },
      }));

      const confirmed = await confirmTransaction(tx);
      if (confirmed) {
        setTransactions((prev) => ({
          ...prev,
          [credentialId]: { signature: tx, confirmed: true },
        }));
        toast.success("Successfully staked for credential verification");
        setStakedCredentials((prev) => new Set(prev).add(credentialId));
        await updateCredentialStates();
      } else {
        throw new Error("Transaction failed to confirm");
      }
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

  const fetchCredentialState = async (
    credentialId: string
  ): Promise<CredentialState | null> => {
    const program = initializeProgram();
    if (!program) return null;

    try {
      const credentialPDA = deriveCredentialPDA(program, credentialId);
      const account = await program.account.credential.fetch(credentialPDA);

      // Include authenticVotes in the return object
      return {
        verifierCount: (account as any).verifierCount,
        isFinalized: (account as any).isFinalized,
        authenticVotes: (account as any).authenticVotes,
      };
    } catch {
      return null;
    }
  };

  const checkIfStaked = async (credentialId: string): Promise<boolean> => {
    const program = initializeProgram();
    if (!program || !publicKey) return false;
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
      await program.account.verifier.fetch(verifierPDA);
      return true;
    } catch {
      return false;
    }
  };

  const fetchVerifierInfo = async (credentialId: string) => {
    const program = initializeProgram();
    if (!program || !publicKey) return null;

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
      const account = await program.account.verifier.fetch(verifierPDA);

      // Include votedAuthentic in the return object
      return {
        hasVoted: (account as any).hasVoted,
        hasClaimed: (account as any).hasClaimed,
        votedAuthentic: (account as any).votedAuthentic,
      };
    } catch {
      return null;
    }
  };

  const updateCredentialStates = async () => {
    if (!unverifiedCredentials.length) return;
    const newStates: Record<string, CredentialState> = {};
    const newVerifierStates: Record<string, VerifierInfo> = {};
    const stakedSet = new Set<string>();

    for (const cred of unverifiedCredentials) {
      const [state, isStaked, verifierInfo] = await Promise.all([
        fetchCredentialState(cred.id),
        checkIfStaked(cred.id),
        fetchVerifierInfo(cred.id),
      ]);

      if (state) {
        newStates[cred.id] = state;
      }
      if (isStaked) {
        stakedSet.add(cred.id);
      }
      if (verifierInfo) {
        newVerifierStates[cred.id] = verifierInfo;
      }
    }

    setCredentialStates((prev) => ({ ...prev, ...newStates }));
    setStakedCredentials(stakedSet);
    setVerifierStates((prev) => ({ ...prev, ...newVerifierStates }));
  };

  useEffect(() => {
    if (!publicKey) return;
    const intervalId = setInterval(() => {
      updateCredentialStates();
    }, 10000);
    updateCredentialStates();
    return () => clearInterval(intervalId);
  }, [unverifiedCredentials, publicKey]);

  const canVote = (credentialId: string) => {
    return stakedCredentials.has(credentialId);
  };

  // Fix isUserInMajority logic
  function isUserInMajority(
    credentialState: CredentialState,
    verifier: VerifierInfo
  ): boolean {
    if (!credentialState || !verifier || !verifier.hasVoted) return false;

    const authenticVotes = credentialState.authenticVotes;
    const totalVotes = credentialState.verifierCount;
    const inauthenticVotes = totalVotes - authenticVotes;

    // User voted authentic and authentic votes are majority
    if (verifier.votedAuthentic && authenticVotes > inauthenticVotes) {
      return true;
    }

    // User voted inauthentic and inauthentic votes are majority
    if (!verifier.votedAuthentic && inauthenticVotes > authenticVotes) {
      return true;
    }

    return false;
  }

  const getRewardClaimableReason = (
    _credentialId: string,
    credentialState?: CredentialState,
    verifierInfo?: VerifierInfo
  ): string => {
    if (!credentialState) return "Staking not started";
    if (!verifierInfo) return "Must stake before claiming reward";
    if (!verifierInfo.hasVoted) return "Must vote before claiming reward";
    if (verifierInfo.hasClaimed) return "Reward already claimed";
    if (!credentialState.isFinalized) return "Voting period not finished";

    const authenticVotes = credentialState.authenticVotes;
    const totalVotes = credentialState.verifierCount;
    const inauthenticVotes = totalVotes - authenticVotes;

    if (verifierInfo.votedAuthentic && authenticVotes <= inauthenticVotes) {
      return "Your 'authentic' vote is in the minority";
    }
    if (!verifierInfo.votedAuthentic && inauthenticVotes <= authenticVotes) {
      return "Your 'inauthentic' vote is in the minority";
    }

    return "Unknown reason";
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
          getFilteredCredentials().map((credential, index) => {
            const alreadyVoted = verifierStates[credential.id]?.hasVoted;

            const isStaked = stakedCredentials.has(credential.id);
            const credentialState = credentialStates[credential.id];

            // New check: disable staking if consensus is met
            const isConsensusMet =
              credentialState?.verifierCount >= 10 ||
              credentialState?.isFinalized;

            const state = credentialStates[credential.id];
            const verifierInfo = verifierStates[credential.id];
            const canClaimReward = isUserInMajority(state, verifierInfo);
            const rewardReason = getRewardClaimableReason(
              credential.id,
              state,
              verifierInfo
            );

            return (
              <div key={index} className="credential-card-wrapper">
                <div className="credential-content">
                  <CredentialCard
                    type={credential.type}
                    title={credential.title}
                    dateIssued={credential.dateIssued}
                    status={credential.status}
                    details={credential.details}
                    hideViewDetails={true}
                    progress={getStakingProgress(credential.id)}
                    progressColor={
                      filters.find((f) => f.type === credential.type)?.color
                    }
                  />
                </div>
                <div className="staking-actions">
                  <button
                    className="stake-button"
                    onClick={() => handleStake(credential.id)}
                    disabled={
                      stakingState[credential.id]?.isStaking ||
                      isStaked ||
                      isConsensusMet
                    }
                  >
                    {isConsensusMet
                      ? "Consensus Met"
                      : stakingState[credential.id]?.isStaking
                      ? "Staking..."
                      : isStaked
                      ? "Staked"
                      : "Stake"}
                  </button>
                  <div className="voting-buttons">
                    <button
                      className="vote-authentic"
                      onClick={() => handleVote(credential.id, true)}
                      disabled={
                        !canVote(credential.id) ||
                        alreadyVoted ||
                        stakingState[credential.id]?.isVoting
                      }
                    >
                      {alreadyVoted ? "Voted" : "IsTrue"}
                    </button>
                    <button
                      className="vote-inauthentic"
                      onClick={() => handleVote(credential.id, false)}
                      disabled={
                        !canVote(credential.id) ||
                        alreadyVoted ||
                        stakingState[credential.id]?.isVoting
                      }
                    >
                      {alreadyVoted ? "Voted" : "IsFalse"}
                    </button>
                  </div>
                  <div className="claim-button-wrapper">
                    <button
                      className={`claim-button ${
                        verifierInfo?.hasClaimed ? "claimed" : ""
                      }`}
                      onClick={() => handleClaim(credential.id)}
                      disabled={!canClaimReward || verifierInfo?.hasClaimed}
                    >
                      {verifierInfo?.hasClaimed
                        ? "Reward Claimed"
                        : stakingState[credential.id]?.isClaiming
                        ? "Claiming..."
                        : "Claim Reward"}
                    </button>
                    <Tooltip title={rewardReason} placement="top">
                      <InfoCircleOutlined className="info-icon" />
                    </Tooltip>
                  </div>
                </div>
              </div>
            );
          })
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
