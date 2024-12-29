import { PublicKey } from "@solana/web3.js";
import { Program, AnchorProvider } from "@project-serum/anchor";
import { IDL } from "../components/Dashboard/UploadCredentials/uploadidl";
import { CredentialModalProps as Credential } from "../components/Dashboard/Profile/CredentialModal/CredentialModal";
import { generateStableCredentialId } from "./generateStableIDS";

const programId = new PublicKey("AsjDSV316uhQKcGNfCECGBzj7eHwrYXho7CivhiQNJQ1");
const getStatusString = (status: any) => {
  if (status?.verified) return "Verified";
  if (status?.rejected) return "Rejected";
  return "Pending";
};


export const fetchUnverifiedCredentials = async (
  provider: AnchorProvider
): Promise<Credential[]> => {
  const program = new Program(IDL as any, programId, provider);
  let credentials: Credential[] = [];

  try {
    const degreeAccounts = await provider.connection.getProgramAccounts(
      programId,
      {
        filters: [
          {
            dataSize: 304, // 8 + 32 + 128 + 128 + 8
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
            dataSize: 578, // 8 + 32 + 128 + 128 + 8 + 8 + 1 + 8 + 1 + 256
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
            dataSize: 1602, // 8 + 32 + 256 + 512 + 256 + 8 + 8 + 1 + 256 + 8 + 1 + 256
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
            dataSize: 825, // 8 + 32 + 128 + 128 + 8 + 256 + 8 + 1 + 256
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
            dataSize: 690, // 8 + 32 + 128 + 1 + 256 + 8 + 1 + 256
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
