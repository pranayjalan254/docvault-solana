export const IDL = {
  version: "0.1.0",
  name: "bablu",
  instructions: [
    {
      name: "submitDegree",
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
    {
      name: "submitProject",
      accounts: [
        { name: "project", isMut: true, isSigner: true },
        { name: "user", isMut: true, isSigner: true },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [
        { name: "projectName", type: "string" },
        { name: "projectDescription", type: "string" },
        { name: "collaborators", type: { vec: "string" } },
        { name: "startDate", type: "i64" },
        { name: "endDate", type: { option: "i64" } },
        { name: "currentlyWorking", type: "bool" },
        { name: "projectLink", type: "string" },
        { name: "projectFile", type: { option: "string" } },
      ],
    },
    {
      name: "submitSkill",
      accounts: [
        { name: "skill", isMut: true, isSigner: true },
        { name: "user", isMut: true, isSigner: true },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [
        { name: "skillName", type: "string" },
        { name: "proficiencyLevel", type: { defined: "ProficiencyLevel" } },
        { name: "proofLink", type: "string" },
        { name: "proofFiles", type: { option: "string" } },
      ],
    },
    {
      name: "submitEmployment",
      accounts: [
        { name: "employment", isMut: true, isSigner: true },
        { name: "user", isMut: true, isSigner: true },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [
        { name: "companyName", type: "string" },
        { name: "jobTitle", type: "string" },
        { name: "startDate", type: "i64" },
        { name: "endDate", type: { option: "i64" } },
        { name: "proofs", type: { vec: "string" } },
      ],
    },
    {
      name: "submitCertificate",
      accounts: [
        { name: "certificate", isMut: true, isSigner: true },
        { name: "user", isMut: true, isSigner: true },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [
        { name: "certificationName", type: "string" },
        { name: "issuer", type: "string" },
        { name: "dateOfIssue", type: "i64" },
        { name: "proofLink", type: "string" },
      ],
    },
  ],
  accounts: [
    {
      name: "UserDegreeCredential",
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
    {
      name: "ProjectCredential",
      type: {
        kind: "struct",
        fields: [
          { name: "userAddress", type: "publicKey" },
          { name: "projectName", type: "string" },
          { name: "projectDescription", type: "string" },
          { name: "collaborators", type: { vec: "string" } },
          { name: "startDate", type: "i64" },
          { name: "endDate", type: { option: "i64" } },
          { name: "currentlyWorking", type: "bool" },
          { name: "projectLink", type: "string" },
          { name: "projectFile", type: { option: "string" } },
          { name: "timestamp", type: "i64" },
          { name: "status", type: { defined: "VerificationStatus" } },
          { name: "verifiers", type: { vec: "publicKey" } },
        ],
      },
    },
    {
      name: "SkillCredential",
      type: {
        kind: "struct",
        fields: [
          { name: "userAddress", type: "publicKey" },
          { name: "skillName", type: "string" },
          { name: "proficiencyLevel", type: { defined: "ProficiencyLevel" } },
          { name: "proofLink", type: "string" },
          { name: "proofFiles", type: { option: "string" } },
          { name: "timestamp", type: "i64" },
          { name: "status", type: { defined: "VerificationStatus" } },
          { name: "verifiers", type: { vec: "publicKey" } },
        ],
      },
    },
    {
      name: "EmploymentCredential",
      type: {
        kind: "struct",
        fields: [
          { name: "userAddress", type: "publicKey" },
          { name: "companyName", type: "string" },
          { name: "jobTitle", type: "string" },
          { name: "startDate", type: "i64" },
          { name: "endDate", type: { option: "i64" } },
          { name: "proofs", type: { vec: "string" } },
          { name: "timestamp", type: "i64" },
          { name: "status", type: { defined: "VerificationStatus" } },
          { name: "verifiers", type: { vec: "publicKey" } },
        ],
      },
    },
    {
      name: "CertificateCredential",
      type: {
        kind: "struct",
        fields: [
          { name: "userAddress", type: "publicKey" },
          { name: "certificationName", type: "string" },
          { name: "issuer", type: "string" },
          { name: "dateOfIssue", type: "i64" },
          { name: "proofLink", type: "string" },
          { name: "timestamp", type: "i64" },
          { name: "status", type: { defined: "VerificationStatus" } },
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
    {
      name: "ProficiencyLevel",
      type: {
        kind: "enum",
        variants: [
          { name: "Beginner" },
          { name: "Intermediate" },
          { name: "Advanced" },
        ],
      },
    },
  ],
  events: [
    {
      name: "DegreeCredentialSubmitted",
      fields: [
        { name: "user", type: "publicKey", index: false },
        { name: "degreeName", type: "string", index: false },
        { name: "collegeName", type: "string", index: false },
        { name: "passoutYear", type: "i64", index: false },
        { name: "timestamp", type: "i64", index: false },
      ],
    },
    {
      name: "ProjectSubmitted",
      fields: [
        { name: "user", type: "publicKey", index: false },
        { name: "projectName", type: "string", index: false },
        { name: "timestamp", type: "i64", index: false },
      ],
    },
    {
      name: "SkillSubmitted",
      fields: [
        { name: "user", type: "publicKey", index: false },
        { name: "skillName", type: "string", index: false },
        { name: "timestamp", type: "i64", index: false },
      ],
    },
    {
      name: "EmploymentSubmitted",
      fields: [
        { name: "user", type: "publicKey", index: false },
        { name: "companyName", type: "string", index: false },
        { name: "timestamp", type: "i64", index: false },
      ],
    },
    {
      name: "CertificateSubmitted",
      fields: [
        { name: "user", type: "publicKey", index: false },
        { name: "certificationName", type: "string", index: false },
        { name: "timestamp", type: "i64", index: false },
      ],
    },
  ],
} as const;
