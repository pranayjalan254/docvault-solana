import { PublicKey } from "@solana/web3.js";
import { Program, AnchorProvider } from "@project-serum/anchor";
import { IDL } from "../components/Dashboard/UploadCredentials/uploadidl";
import { CredentialModalProps as Credential } from "../components/Dashboard/Profile/CredentialModal/CredentialModal";
import { generateStableCredentialId } from "./generateStableIDS";

// Update the program ID to match the one in upload.rs
const programId = new PublicKey("apwW9Vqxtu4Ga2dQ4R91jyYtWZ9HUFtx13MmPPfwLEb");

// Adjust the account sizes to match the struct sizes in upload.rs
const accountSizes = {
  degree: 313,      // 8 + 32 + 128 + 128 + 8 + 1 + 8
  employment: 578,  // 8 + 32 + 128 + 128 + 8 + 8 + 1 + 8 + 1 + 256
  project: 1602,    // 8 + 32 + 256 + 512 + 256 + 8 + 8 + 1 + 256 + 8 + 1 + 256
  certificate: 825, // 8 + 32 + 128 + 128 + 8 + 256 + 8 + 1 + 256
  skill: 690       // 8 + 32 + 128 + 1 + 256 + 8 + 1 + 256
};

const getStatusString = (status: any) => {
  if (status?.verified) return "Verified";
  if (status?.rejected) return "Rejected";
  return "Pending";
};

// Add this utility function at the top
const safeParseTimestamp = (timestamp: number): string => {
  try {
    // Ensure the timestamp is within safe JavaScript integer range
    if (timestamp > Number.MAX_SAFE_INTEGER) {
      return new Date().toLocaleDateString(); // Fallback to current date if timestamp is too large
    }
    return new Date(timestamp * 1000).toLocaleDateString();
  } catch (error) {
    console.error("Error parsing timestamp:", error);
    return "Invalid Date";
  }
};

export const fetchUnverifiedCredentials = async (
  provider: AnchorProvider
): Promise<Credential[]> => {
  // Update to use the correct IDL
  const program = new Program(IDL as any, programId, provider);
  let credentials: Credential[] = [];

  try {
    const degreeAccounts = await provider.connection.getProgramAccounts(
      programId,
      {
        filters: [
          {
            dataSize: accountSizes.degree,
          },
        ],
      }
    );

    const degreeCredentials = degreeAccounts
      .map((account) => {
        try {
          const decoded = program.coder.accounts.decode(
            "UserDegreeCredential",
            account.account.data
          );

          if (!decoded.status.verified && !decoded.status.rejected) {
            return {
              type: "Degree",
              title: decoded.degreeName,
              dateIssued: new Date(
                decoded.timestamp.toNumber() * 1000
              ).toLocaleDateString(),
              status: getStatusString(decoded.status),
              details: {
                university: decoded.collegeName,
                passoutYear: decoded.passoutYear?.toString() || "N/A",
              },
            };
          }
        } catch (err) {
          console.error("Error decoding degree account:", err);
        }
        return null;
      })
      .filter(Boolean);
    // @ts-ignore
    credentials = [...credentials, ...degreeCredentials];
  } catch (error) {
    console.error("Error fetching degree credentials:", error);
  }

  try {
    const employmentAccounts = await provider.connection.getProgramAccounts(
      programId,
      {
        filters: [
          {
            dataSize: accountSizes.employment,
          },
        ],
      }
    );

    const employmentCredentials = employmentAccounts
      .map((account) => {
        try {
          const decoded = program.coder.accounts.decode(
            "EmploymentCredential",
            account.account.data
          );

          if (!decoded.status.verified && !decoded.status.rejected) {
            const startDate = new Date(
              decoded.startDate.toNumber() * 1000
            ).toLocaleDateString();
            let endDateStr = "Present";

            if (decoded.endDate) {
              endDateStr = new Date(
                decoded.endDate.toNumber() * 1000
              ).toLocaleDateString();
            }

            return {
              type: "Employment History",
              title: decoded.jobTitle,
              dateIssued: `${startDate} - ${endDateStr}`,
              status: getStatusString(decoded.status),
              details: {
                company: decoded.companyName,
                position: decoded.jobTitle,
              },
            };
          }
        } catch (err) {
          console.error("Error decoding employment account:", err);
        }
        return null;
      })
      .filter(Boolean);
    // @ts-ignore
    credentials = [...credentials, ...employmentCredentials];
  } catch (error) {
    console.error("Error fetching employment credentials:", error);
  }

  try {
    const projectAccounts = await provider.connection.getProgramAccounts(
      programId,
      {
        filters: [
          {
            dataSize: accountSizes.project,
          },
        ],
      }
    );

    const projectCredentials = projectAccounts
      .map((account) => {
        try {
          const decoded = program.coder.accounts.decode(
            "ProjectCredential",
            account.account.data
          );

          if (!decoded.status.verified && !decoded.status.rejected) {
            const startDate = safeParseTimestamp(decoded.startDate);
            let endDateStr = "Present";

            if (decoded.endDate) {
              endDateStr = safeParseTimestamp(decoded.endDate);
            }

            return {
              type: "Project",
              title: decoded.projectName,
              dateIssued: `${startDate} - ${endDateStr}`,
              status: getStatusString(decoded.status),
              details: {
                description: decoded.projectDescription,
                collaborators: decoded.collaborators || [],
                projectLink: decoded.projectLink,
              },
            };
          }
        } catch (err) {
          console.error("Error decoding project account:", err);
          // Log additional details for debugging
          if (err instanceof Error) {
            console.error("Error details:", err.message);
            console.error("Error stack:", err.stack);
          }
        }
        return null;
      })
      .filter(Boolean);
    // @ts-ignore
    credentials = [...credentials, ...projectCredentials];
  } catch (error) {
    console.error("Error fetching project credentials:", error);
  }

  try {
    const certificateAccounts = await provider.connection.getProgramAccounts(
      programId,
      {
        filters: [
          {
            dataSize: accountSizes.certificate,
          },
        ],
      }
    );

    const certificateCredentials = certificateAccounts
      .map((account) => {
        try {
          const decoded = program.coder.accounts.decode(
            "CertificateCredential",
            account.account.data
          );

          if (!decoded.status.verified && !decoded.status.rejected) {
            return {
              type: "Certificate",
              title: decoded.certificationName,
              dateIssued: new Date(
                decoded.dateOfIssue.toNumber() * 1000
              ).toLocaleDateString(),
              status: getStatusString(decoded.status),
              details: {
                issuer: decoded.issuer,
                proofLink: decoded.proofLink || "N/A",
              },
            };
          }
        } catch (err) {
          console.error("Error decoding certificate account:", err);
        }
        return null;
      })
      .filter(Boolean);
    // @ts-ignore
    credentials = [...credentials, ...certificateCredentials];
  } catch (error) {
    console.error("Error fetching certificate credentials:", error);
  }

  // Add skill credentials fetching
  try {
    const skillAccounts = await provider.connection.getProgramAccounts(
      programId,
      {
        filters: [
          {
            dataSize: accountSizes.skill,
          },
        ],
      }
    );

    const skillCredentials = skillAccounts
      .map((account) => {
        try {
          const decoded = program.coder.accounts.decode(
            "SkillCredential",
            account.account.data
          );

          if (!decoded.status.verified && !decoded.status.rejected) {
            return {
              type: "Skill",
              title: decoded.skillName,
              dateIssued: new Date(
                decoded.timestamp.toNumber() * 1000
              ).toLocaleDateString(),
              status: getStatusString(decoded.status),
              details: {
                proficiencyLevel: decoded.proficiencyLevel,
                proofLink: decoded.proofLink,
              },
            };
          }
        } catch (err) {
          console.error("Error decoding skill account:", err);
        }
        return null;
      })
      .filter(Boolean);
    // @ts-ignore
    credentials = [...credentials, ...skillCredentials];
  } catch (error) {
    console.error("Error fetching skill credentials:", error);
  }

  // After filtering out verified/rejected credentials, assign stable IDs:
  credentials = credentials.map((cred) => {
    const stableId = generateStableCredentialId(cred);
    return {
      ...cred,
      id: stableId,
      publicKey: stableId,
    };
  });

  return credentials;
};
