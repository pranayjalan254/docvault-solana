export const IDL = {
  version: "0.1.0",
  name: "pablo",
  instructions: [
    {
      name: "submitCredential",
      accounts: [
        { name: "credential", isMut: true, isSigner: true },
        { name: "user", isMut: true, isSigner: true },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [
        { name: "degreeName", type: "string" },
        { name: "collegeName", type: "string" },
        { name: "passoutYear", type: "i64" },
      ],
    },
  ],
  accounts: [
    {
      name: "UserCredential",
      type: {
        kind: "struct",
        fields: [
          { name: "userAddress", type: "publicKey" },
          { name: "degreeName", type: "string" },
          { name: "collegeName", type: "string" },
          { name: "passoutYear", type: "i64" },
          { name: "status", type: { defined: "VerificationStatus" } },
          { name: "timestamp", type: "i64" },
          { name: "verifiers", type: { vec: "publicKey" } },
        ],
      },
    },
  ],
  types: [
    {
      name: "VerificationStatus",
      type: {
        kind: "enum",
        variants: [
          { name: "Pending" },
          { name: "Verified" },
          { name: "Rejected" },
        ],
      },
    },
  ],
  events: [
    {
      name: "CredentialSubmitted",
      fields: [
        { name: "user", type: "publicKey", index: false },
        { name: "degreeName", type: "string", index: false },
        { name: "collegeName", type: "string", index: false },
        { name: "passoutYear", type: "i64", index: false },
        { name: "timestamp", type: "i64", index: false },
      ],
    },
  ],
} as const;
