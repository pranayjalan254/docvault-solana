export const IDL = {
  version: "0.1.0",
  name: "credential_verifier",
  instructions: [
    {
      name: "initializeCredential",
      accounts: [
        { name: "credential", isMut: true, isSigner: false },
        { name: "authority", isMut: true, isSigner: true },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [
        { name: "credentialId", type: "string" },
        { name: "stakeAmount", type: "u64" },
      ],
    },
    {
      name: "stakeForCredential",
      accounts: [
        { name: "credential", isMut: true, isSigner: false },
        { name: "verifier", isMut: true, isSigner: false },
        { name: "authority", isMut: true, isSigner: true },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [],
    },
    {
      name: "makeDecision",
      accounts: [
        { name: "credential", isMut: true, isSigner: false },
        { name: "verifier", isMut: true, isSigner: false },
        { name: "authority", isMut: false, isSigner: true },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [{ name: "isAuthentic", type: "bool" }],
    },
    {
      name: "claimReward",
      accounts: [
        { name: "credential", isMut: true, isSigner: false },
        { name: "verifier", isMut: true, isSigner: false },
        { name: "authority", isMut: true, isSigner: true },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [],
    },
  ],
  accounts: [
    {
      name: "Credential",
      type: {
        kind: "struct",
        fields: [
          { name: "credentialId", type: "string" },
          { name: "stakeAmount", type: "u64" },
          { name: "verifications", type: "u32" },
          { name: "authenticVotes", type: "u32" },
          { name: "totalStaked", type: "u64" },
          { name: "isFinalized", type: "bool" },
        ],
      },
    },
    {
      name: "Verifier",
      type: {
        kind: "struct",
        fields: [
          { name: "credential", type: "publicKey" },
          { name: "authority", type: "publicKey" },
          { name: "votedAuthentic", type: "bool" },
          { name: "hasVoted", type: "bool" },
          { name: "hasClaimed", type: "bool" },
        ],
      },
    },
  ],
  errors: [
    {
      code: 6000,
      name: "AlreadyFinalized",
      msg: "Credential verification is already finalized",
    },
    {
      code: 6001,
      name: "NotFinalized",
      msg: "Credential verification is not finalized yet",
    },
    { code: 6002, name: "AlreadyClaimed", msg: "Reward already claimed" },
    { code: 6003, name: "AlreadyVoted", msg: "Verifier has already voted" },
    { code: 6004, name: "AlreadyStaked", msg: "Verifier has already staked" },
    {
      code: 6005,
      name: "NotStaked",
      msg: "Verifier has not staked for this credential",
    },
    { code: 6006, name: "NotVoted", msg: "Verifier has not voted yet" },
  ],
};
