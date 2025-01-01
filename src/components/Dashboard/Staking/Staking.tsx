import React, { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection } from "@solana/web3.js";
import { AnchorProvider, Program, web3, BN } from "@project-serum/anchor";
import { toast } from "react-hot-toast";
import { utf8 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import { InfoCircleOutlined } from "@ant-design/icons";
import { Tooltip } from "antd";
import {
  CredentialType,
  CredentialFilter,
  CredentialState,
  VerifierInfo,
  TransactionState,
  StakingState,
} from "./Interfaces";
import { fetchUnverifiedCredentials } from "../../../utils/allCredentialUtils";
import CredentialCard from "../Profile/CredentialCard/CredentialCard";
import "./Staking.css";
import { IDL } from "../../../../smart contracts/stakeidl";
import { IDL1 } from "../../../../smart contracts/uploadidl";
import { Credential } from "./Credential";

const CACHE_DURATION = 2000;
const BATCH_SIZE = 2;
const BATCH_DELAY = 2000;
const DEVNET_ENDPOINT =
  "https://devnet.helius-rpc.com/?api-key=ea94ee9f-e6ca-4248-ae8a-65938ad4c6b4";
const STAKE_AMOUNT = 0.01 * web3.LAMPORTS_PER_SOL;

// Add WebSocket connection configuration
const WS_ENDPOINT =
  "wss://devnet.helius-rpc.com/?api-key=ea94ee9f-e6ca-4248-ae8a-65938ad4c6b4";

const RPC_ENDPOINTS = {
  SOLANA: "https://api.devnet.solana.com",
  HELIUS:
    "https://devnet.helius-rpc.com/?api-key=ea94ee9f-e6ca-4248-ae8a-65938ad4c6b4",
  QUICKNODE:
    "https://wider-neat-road.solana-devnet.quiknode.pro/a7bddf172bf613f5530f049c69f0f41d19dfa49e",
  HELIUS_WS:
    "wss://devnet.helius-rpc.com/?api-key=ea94ee9f-e6ca-4248-ae8a-65938ad4c6b4",
};

// RPC load balancer class
class RPCLoadBalancer {
  private endpoints: string[];
  private requestCounts: Map<string, number>;
  private lastResetTime: number;

  constructor(endpoints: string[]) {
    this.endpoints = endpoints;
    this.requestCounts = new Map();
    this.lastResetTime = Date.now();

    endpoints.forEach((endpoint) => {
      this.requestCounts.set(endpoint, 0);
    });
  }

  getNextEndpoint(): string {
    const now = Date.now();
    if (now - this.lastResetTime > 1000) {
      this.requestCounts.forEach((_, key) => this.requestCounts.set(key, 0));
      this.lastResetTime = now;
    }
    let minCount = Infinity;
    let selectedEndpoint = this.endpoints[0];

    this.requestCounts.forEach((count, endpoint) => {
      if (count < minCount) {
        minCount = count;
        selectedEndpoint = endpoint;
      }
    });

    this.requestCounts.set(selectedEndpoint, minCount + 1);
    return selectedEndpoint;
  }
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
  const [isLoadingProof, setIsLoadingProof] = useState<Record<string, boolean>>(
    {}
  );
  const [lastUpdate, setLastUpdate] = useState<number>(0);
  const [wsConnection, setWsConnection] = useState<WebSocket | null>(null);
  const [rpcLoadBalancer] = useState(
    new RPCLoadBalancer([
      RPC_ENDPOINTS.SOLANA,
      RPC_ENDPOINTS.HELIUS,
      RPC_ENDPOINTS.QUICKNODE,
    ])
  );

  // Add cache for each credential type
  const [credentialTypeCache, setCredentialTypeCache] = useState<
    Record<
      string,
      {
        data: Credential[];
        timestamp: number;
      }
    >
  >({});

  // Modified initializeProgram to use load balancer
  const initializeProgram = () => {
    if (!publicKey || !signTransaction || !signAllTransactions) return null;

    const endpoint = rpcLoadBalancer.getNextEndpoint();
    const connection = new Connection(endpoint, {
      commitment: "confirmed",
      confirmTransactionInitialTimeout: 60000,
    });

    const wallet = {
      publicKey,
      signTransaction,
      signAllTransactions,
    };

    const provider = new AnchorProvider(connection, wallet, {
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

  // Modified handleFilterClick to load credentials on demand
  const handleFilterClick = async (type: CredentialType) => {
    setActiveType(type);
    setFilters(
      filters.map((filter) => ({
        ...filter,
        active: filter.type === type,
      }))
    );

    // Check cache for this type
    const cache = credentialTypeCache[type];
    if (cache && Date.now() - cache.timestamp < CACHE_DURATION) {
      setUnverifiedCredentials(cache.data);
      return;
    }

    // Fetch new credentials for this type
    setLoading(true);
    try {
      const endpoint = rpcLoadBalancer.getNextEndpoint();
      const connection = new Connection(endpoint);
      const provider = new AnchorProvider(
        connection,
        { publicKey, signTransaction, signAllTransactions } as any,
        { commitment: "confirmed" }
      );

      const credentials = await fetchUnverifiedCredentials(provider);
      const filteredCredentials = credentials.filter(
        (cred) => cred.type === type
      );

      // @ts-ignore
      setCredentialTypeCache((prev) => ({
        ...prev,
        [type]: {
          data: filteredCredentials,
          timestamp: Date.now(),
        },
      }));
      // @ts-ignore
      setUnverifiedCredentials(filteredCredentials);
    } catch (error) {
      console.error(`Error fetching ${type} credentials:`, error);
      toast.error(`Failed to fetch ${type} credentials`);
    } finally {
      setLoading(false);
    }
  };

  // Initial load for Degree credentials only
  useEffect(() => {
    if (!publicKey) return;

    const loadInitialCredentials = async () => {
      // Check cache first
      const cache = credentialTypeCache["Degree"];
      if (cache && Date.now() - cache.timestamp < CACHE_DURATION) {
        setUnverifiedCredentials(cache.data);
        setLoading(false);
        return;
      }

      try {
        const endpoint = rpcLoadBalancer.getNextEndpoint();
        const connection = new Connection(endpoint);
        const provider = new AnchorProvider(
          connection,
          { publicKey, signTransaction, signAllTransactions } as any,
          { commitment: "confirmed" }
        );

        const credentials = await fetchUnverifiedCredentials(provider);
        const degreeCredentials = credentials.filter(
          (cred) => cred.type === "Degree"
        );
        // @ts-ignore
        setCredentialTypeCache((prev) => ({
          ...prev,
          Degree: {
            data: degreeCredentials,
            timestamp: Date.now(),
          },
        }));
        // @ts-ignore
        setUnverifiedCredentials(degreeCredentials);
      } catch (error) {
        console.error("Error fetching initial credentials:", error);
        setError("Failed to fetch credentials");
      } finally {
        setLoading(false);
      }
    };

    loadInitialCredentials();
  }, [publicKey]);

  const getFilteredCredentials = () => {
    return unverifiedCredentials.filter((cred) => cred.type === activeType);
  };

  const getStakingProgress = (credentialId: string) => {
    const state = credentialStates[credentialId];
    if (!state) return 0;
    return Math.min((state.verifierCount / 10) * 100, 100);
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

  const updateCredentialVerificationStatus = async (
    credentialId: string,
    credentialState: CredentialState
  ) => {
    const wallet = {
      publicKey,
      signTransaction,
      signAllTransactions,
    };

    const devnetConnection = new Connection(DEVNET_ENDPOINT, {
      commitment: "confirmed",
      confirmTransactionInitialTimeout: 60000,
    });

    const provider = new AnchorProvider(devnetConnection, wallet as any, {
      commitment: "confirmed",
      preflightCommitment: "confirmed",
      skipPreflight: false,
    });

    const program = new Program(
      IDL1 as any,
      "AsjDSV316uhQKcGNfCECGBzj7eHwrYXho7CivhiQNJQ1",
      provider
    );

    if (credentialState.isFinalized) {
      const isVerified =
        credentialState.authenticVotes > credentialState.verifierCount / 2;

      try {
        await program.methods
          .updateCredentialStatus(isVerified ? "Verified" : "Rejected")
          .accounts({
            credential: credentialId,
            authority: publicKey,
            systemProgram: web3.SystemProgram.programId,
          })
          .rpc();

        // Remove from unverified credentials if successful
        setUnverifiedCredentials((prev) =>
          prev.filter((cred) => cred.id !== credentialId)
        );
      } catch (error) {
        console.error("Failed to update credential status:", error);
      }
    }
  };

  const getAllVerifiersForCredential = async (credentialId: string) => {
    const program = initializeProgram();
    if (!program) return [];

    try {
      const credentialPDA = deriveCredentialPDA(program, credentialId);
      const verifierAccounts = await program.account.verifier.all([
        {
          memcmp: {
            offset: 8,
            bytes: credentialPDA.toBase58(),
          },
        },
      ]);

      return verifierAccounts.map((account) => account.account);
    } catch (error) {
      console.error("Error fetching verifiers:", error);
      return [];
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

      const credentialStateFetched = await fetchCredentialState(credentialId);
      const nowSeconds = Math.floor(Date.now() / 1000);
      const fiveDaysInSecs = 5 * 24 * 60 * 60;

      // Call refund if 5 days have passed without finalization
      if (
        credentialStateFetched &&
        !credentialStateFetched.isFinalized &&
        credentialStateFetched.verifierCount < 10 &&
        nowSeconds - credentialStateFetched.createdAt >= fiveDaysInSecs
      ) {
        await program.methods
          .refundExpiredStakes()
          .accounts({
            credential: credentialPDA,
            verifier: verifierPDA,
            authority: publicKey,
            systemProgram: web3.SystemProgram.programId,
          })
          .rpc();
        toast.success(
          "Your stake has been refunded as the 5-day window has expired without consensus!"
        );
        return;
      }

      await program.methods
        .claimReward()
        .accounts({
          credential: credentialPDA,
          verifier: verifierPDA,
          authority: publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .rpc();

      // After successful claim, check if all eligible stakers have claimed
      const credentialState = await fetchCredentialState(credentialId);
      if (credentialState && credentialState.isFinalized) {
        const allVerifiers = await getAllVerifiersForCredential(credentialId);
        const allClaimsMade = allVerifiers.every((v: any) => v.hasClaimed);

        if (allClaimsMade) {
          await updateCredentialVerificationStatus(
            credentialId,
            credentialState
          );
        }
      }

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
        createdAt: (account as any).createdAt, // <-- Add createdAt
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
    const now = Date.now();
    if (now - lastUpdate < CACHE_DURATION) {
      return;
    }

    // Only get credentials of active type
    const visibleCredentials = getFilteredCredentials();
    if (!visibleCredentials.length) return;

    try {
      const newStates: Record<string, CredentialState> = {};
      const newVerifierStates: Record<string, VerifierInfo> = {};
      const stakedSet = new Set<string>();

      // Process visible credentials in batches
      for (let i = 0; i < visibleCredentials.length; i += BATCH_SIZE) {
        const batch = visibleCredentials.slice(i, i + BATCH_SIZE);

        await Promise.all(
          batch.map(async (cred) => {
            try {
              const state = await fetchCredentialState(cred.id);
              const isStaked = await checkIfStaked(cred.id);
              const verifierInfo = await fetchVerifierInfo(cred.id);

              if (state) newStates[cred.id] = state;
              if (isStaked) stakedSet.add(cred.id);
              if (verifierInfo) newVerifierStates[cred.id] = verifierInfo;
            } catch (error) {
              console.error(`Error processing credential ${cred.id}:`, error);
            }
          })
        );

        await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY));
      }

      setCredentialStates((prev) => ({ ...prev, ...newStates }));
      setStakedCredentials(stakedSet);
      setVerifierStates((prev) => ({ ...prev, ...newVerifierStates }));
      setLastUpdate(now);
    } catch (error) {
      console.error("Error updating credential states:", error);
    }
  };

  // Modify WebSocket setup
  useEffect(() => {
    if (!publicKey) return;

    let wsRetryCount = 0;
    const MAX_WS_RETRIES = 5;
    let wsKeepAliveInterval: NodeJS.Timeout;
    let reconnectTimeout: NodeJS.Timeout;

    const setupWebSocket = () => {
      const ws = new WebSocket(WS_ENDPOINT);

      ws.onopen = () => {
        console.log("WebSocket Connected");
        wsRetryCount = 0;

        // Subscribe to all visible credentials at once
        const visibleCredentials = getFilteredCredentials();
        const program = initializeProgram();
        if (!program) return;

        const subscriptionRequests = visibleCredentials.map((cred, index) => {
          const credentialPDA = deriveCredentialPDA(program, cred.id);
          return {
            jsonrpc: "2.0",
            id: Date.now() + index,
            method: "accountSubscribe",
            params: [
              credentialPDA.toBase58(),
              { encoding: "jsonParsed", commitment: "processed" }, // Change to 'processed' for faster updates
            ],
          };
        });

        // Send all subscription requests at once
        subscriptionRequests.forEach((req) => ws.send(JSON.stringify(req)));

        // Keep-alive ping with shorter interval
        wsKeepAliveInterval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(
              JSON.stringify({ jsonrpc: "2.0", id: "ping", method: "ping" })
            );
          }
        }, 15000); // Reduce to 15 seconds
      };

      // Optimize message handling with debouncing
      const debouncedUpdate = debounce(async (accountKey: string) => {
        await updateCredentialState(accountKey);
      }, STATUS_UPDATE_DEBOUNCE);

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.method === "accountNotification") {
            const accountKey = data.params.result.value.pubkey;
            debouncedUpdate(accountKey);
          }
        } catch (error) {
          console.error("WebSocket message processing error:", error);
        }
      };

      ws.onclose = () => {
        clearInterval(wsKeepAliveInterval);
        if (wsRetryCount < MAX_WS_RETRIES) {
          wsRetryCount++;
          reconnectTimeout = setTimeout(
            setupWebSocket,
            WS_RETRY_INTERVAL * wsRetryCount
          );
        }
      };

      setWsConnection(ws);
    };

    setupWebSocket();

    return () => {
      if (wsConnection) {
        clearInterval(wsKeepAliveInterval);
        clearTimeout(reconnectTimeout);
        wsConnection.close();
      }
    };
  }, [publicKey, activeType]);

  // Remove or modify other useEffect hooks that might be causing updates
  useEffect(() => {
    if (!publicKey) return;

    // Only update once when credentials load or type changes
    const timeoutId = setTimeout(() => {
      updateCredentialStates();
    }, 500); // Add small delay to prevent immediate updates

    return () => clearTimeout(timeoutId);
  }, [unverifiedCredentials, publicKey, activeType]);

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
      return "Your vote is in the minority";
    }
    if (!verifierInfo.votedAuthentic && inauthenticVotes <= authenticVotes) {
      return "Your vote is in the minority";
    }

    return "Unknown reason";
  };

  const handleViewProof = async (credentialId: string) => {
    setIsLoadingProof((prev) => ({ ...prev, [credentialId]: true }));

    try {
      const response = await fetch(
        `https://docvault.onrender.com/api/credential-proof/${credentialId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch proof");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (error) {
      console.error("Error viewing proof:", error);
      toast.error("Failed to load proof");
    } finally {
      setIsLoadingProof((prev) => ({ ...prev, [credentialId]: false }));
    }
  };

  useEffect(() => {
    if (!publicKey) return;

    const ws = new WebSocket(RPC_ENDPOINTS.HELIUS_WS);
    let wsKeepAliveInterval: NodeJS.Timeout;

    ws.onopen = () => {
      console.log("WebSocket connected");

      // Subscribe to visible credentials
      const visibleCredentials = getFilteredCredentials();
      visibleCredentials.forEach((cred) => {
        const program = initializeProgram();
        if (!program) return;

        const credentialPDA = deriveCredentialPDA(program, cred.id);
        ws.send(
          JSON.stringify({
            jsonrpc: "2.0",
            id: cred.id,
            method: "accountSubscribe",
            params: [
              credentialPDA.toBase58(),
              { encoding: "jsonParsed", commitment: "confirmed" },
            ],
          })
        );
      });

      // Keep-alive ping
      wsKeepAliveInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(
            JSON.stringify({ jsonrpc: "2.0", id: "ping", method: "ping" })
          );
        }
      }, 30000);
    };

    ws.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      if (data.method === "accountNotification") {
        // Debounced update for the specific credential
        await updateCredentialState(data.params.result.value.pubkey);
      }
    };

    return () => {
      clearInterval(wsKeepAliveInterval);
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [publicKey, activeType]);

  // Modified updateCredentialStates to handle single credential updates
  const updateCredentialState = async (credentialPubkey?: string) => {
    if (!publicKey) return;

    const now = Date.now();
    if (now - lastUpdate < 1000) return; // Minimum 1 second between updates

    try {
      const program = initializeProgram();
      if (!program) return;

      const credentials = credentialPubkey
        ? [unverifiedCredentials.find((c) => c.publicKey === credentialPubkey)]
        : getFilteredCredentials();

      if (!credentials.length) return;

      // Process in small batches
      for (let i = 0; i < credentials.length; i += BATCH_SIZE) {
        const batch = credentials.slice(i, i + BATCH_SIZE);
        await Promise.all(
          batch.map(async (cred) => {
            if (!cred) return;
          })
        );

        if (i + BATCH_SIZE < credentials.length) {
          await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY));
        }
      }

      setLastUpdate(now);
    } catch (error) {
      console.error("Error updating credential states:", error);
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
          getFilteredCredentials().map((credential, index) => {
            const alreadyVoted = verifierStates[credential.id]?.hasVoted;

            const isStaked = stakedCredentials.has(credential.id);
            const credentialState = credentialStates[credential.id];
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
                  {isStaked && (
                    <button
                      className="view-proof-button"
                      onClick={() => handleViewProof(credential.id)}
                      disabled={isLoadingProof[credential.id]}
                    >
                      {isLoadingProof[credential.id]
                        ? "Loading..."
                        : "View Proof"}
                    </button>
                  )}
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
                      disabled={
                        !canClaimReward ||
                        verifierInfo?.hasClaimed ||
                        !credentialState.isFinalized
                      }
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

const WS_RETRY_INTERVAL = 3000; // 3 seconds between retries
const STATUS_UPDATE_DEBOUNCE = 500; // 500ms debounce for status updates

// Add this utility function at the top
const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};
