export interface StakingState {
  isStaking: boolean;
  isVoting: boolean;
  isClaiming: boolean;
  stakingError: string | null;
}

export interface CredentialState {
  verifierCount: number;
  isFinalized: boolean;
  authenticVotes: number;
  createdAt: number;
}

export interface VerifierInfo {
  hasVoted: boolean;
  hasClaimed: boolean;
  votedAuthentic: boolean;
}

export interface TransactionState {
  signature?: string;
  confirmed: boolean;
  error?: string;
}

export type CredentialType =
  | "Degree"
  | "Employment History"
  | "Project"
  | "Certificate"
  | "Skill";

export interface CredentialFilter {
  type: CredentialType;
  active: boolean;
  color: string;
}
