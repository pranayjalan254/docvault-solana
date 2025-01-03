export const IDL1 = {
  version: "0.1.0",
  name: "tablu",
  instructions: [
    {
      name: "submitDegree",
      accounts: [
        { name: "credential", isMut: true, isSigner: true },
        { name: "user", isMut: true, isSigner: true },
        { name: "treasury", isMut: true, isSigner: false },
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
        { name: "treasury", isMut: true, isSigner: false },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [
        { name: "projectName", type: "string" },
        { name: "projectDescription", type: "string" },
        { name: "collaborators", type: { option: { vec: "string" } } },
        { name: "startDate", type: "i32" },
        { name: "endDate", type: { option: "i32" } },
        { name: "currentlyWorking", type: { option: "bool" } },
        { name: "projectLink", type: "string" },
      ],
    },
    {
      name: "submitSkill",
      accounts: [
        { name: "skill", isMut: true, isSigner: true },
        { name: "user", isMut: true, isSigner: true },
        { name: "treasury", isMut: true, isSigner: false },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [
        { name: "skillName", type: "string" },
        { name: "proficiencyLevel", type: { defined: "ProficiencyLevel" } },
        { name: "proofLink", type: "string" },
      ],
    },
    {
      name: "submitEmployment",
      accounts: [
        { name: "employment", isMut: true, isSigner: true },
        { name: "user", isMut: true, isSigner: true },
        { name: "treasury", isMut: true, isSigner: false },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [
        { name: "companyName", type: "string" },
        { name: "jobTitle", type: "string" },
        { name: "startDate", type: "i64" },
        { name: "endDate", type: { option: "i64" } },
        { name: "currentlyWorking", type: { option: "bool" } },
      ],
    },
    {
      name: "submitCertificate",
      accounts: [
        { name: "certificate", isMut: true, isSigner: true },
        { name: "user", isMut: true, isSigner: true },
        { name: "treasury", isMut: true, isSigner: false },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [
        { name: "certificationName", type: "string" },
        { name: "issuer", type: "string" },
        { name: "dateOfIssue", type: "i64" },
        { name: "proofLink", type: { option: "string" } },
      ],
    },
    {
      name: "updateDegreeVerificationStatus",
      accounts: [
        { name: "credential", isMut: true, isSigner: false },
        { name: "authority", isMut: false, isSigner: true },
      ],
      args: [{ name: "newStatus", type: { defined: "VerificationStatus" } }],
    },
    {
      name: "updateProjectVerificationStatus",
      accounts: [
        { name: "credential", isMut: true, isSigner: false },
        { name: "authority", isMut: false, isSigner: true },
      ],
      args: [{ name: "newStatus", type: { defined: "VerificationStatus" } }],
    },
    {
      name: "updateSkillVerificationStatus",
      accounts: [
        { name: "credential", isMut: true, isSigner: false },
        { name: "authority", isMut: false, isSigner: true },
      ],
      args: [{ name: "newStatus", type: { defined: "VerificationStatus" } }],
    },
    {
      name: "updateEmploymentVerificationStatus",
      accounts: [
        { name: "credential", isMut: true, isSigner: false },
        { name: "authority", isMut: false, isSigner: true },
      ],
      args: [{ name: "newStatus", type: { defined: "VerificationStatus" } }],
    },
    {
      name: "updateCertificateVerificationStatus",
      accounts: [
        { name: "credential", isMut: true, isSigner: false },
        { name: "authority", isMut: false, isSigner: true },
      ],
      args: [{ name: "newStatus", type: { defined: "VerificationStatus" } }],
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
          { name: "collaborators", type: { option: { vec: "string" } } },
          { name: "startDate", type: "i32" },
          { name: "endDate", type: { option: "i32" } },
          { name: "currentlyWorking", type: { option: "bool" } },
          { name: "projectLink", type: "string" },
          { name: "timestamp", type: "i32" },
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
          { name: "currentlyWorking", type: { option: "bool" } },
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
          { name: "proofLink", type: { option: "string" } },
          { name: "timestamp", type: "i64" },
          { name: "status", type: { defined: "VerificationStatus" } },
          { name: "verifiers", type: { vec: "publicKey" } },
        ],
      },
    },
  ],
  types: [
    {
      name: "CredentialType",
      type: {
        kind: "enum",
        variants: [
          { name: "Degree" },
          { name: "Project" },
          { name: "Skill" },
          { name: "Employment" },
          { name: "Certificate" },
        ],
      },
    },
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
        { name: "timestamp", type: "i32", index: false },
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
