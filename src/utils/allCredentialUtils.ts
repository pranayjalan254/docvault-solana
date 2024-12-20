import { PublicKey } from "@solana/web3.js";
import { Program, AnchorProvider } from "@project-serum/anchor";
import { IDL } from "../../smart contracts/stakeidl";

const programId = new PublicKey("AsjDSV316uhQKcGNfCECGBzj7eHwrYXho7CivhiQNJQ1");
import { CredentialModalProps as Credential } from "../components/Dashboard/Profile/CredentialModal/CredentialModal";
import bs58 from "bs58";

export const fetchAllUnverifiedCredentials = async (
  provider: AnchorProvider
): Promise<Credential[]> => {
  const program = new Program(IDL as any, programId, provider);

  // Create filter for unverified status (status = 0)
  const statusFilter = {
    memcmp: {
      offset: 240, // Status field offset
      bytes: bs58.encode(Buffer.from([0])), // 0 represents Pending status
    },
  };

  // Fetch all unverified credentials
  const [degrees, projects, skills, employments, certificates] =
    await Promise.all([
      program.account.userDegreeCredential.all([statusFilter]),
      program.account.projectCredential.all([statusFilter]),
      program.account.skillCredential.all([statusFilter]),
      program.account.employmentCredential.all([statusFilter]),
      program.account.certificateCredential.all([statusFilter]),
    ]);

  return [
    ...degrees.map((d: any) => ({
      type: "Degree",
      title: d.account.degreeName,
      dateIssued: new Date(
        d.account.timestamp.toNumber() * 1000
      ).toLocaleDateString(),
      status: "Pending",
      owner: d.account.userAddress,
      publicKey: d.publicKey,
      details: {
        university: d.account.collegeName,
        passoutYear: d.account.passoutYear?.toString() || "N/A",
      },
    })),
    ...projects.map((p: any) => ({
      type: "Project",
      title: p.account.projectName,
      dateIssued: new Date(
        p.account.timestamp.toNumber() * 1000
      ).toLocaleDateString(),
      status: getStatusString(p.account.status),
      owner: p.account.authority,
      details: {
        projectUrl: p.account.projectLink,
        description: p.account.projectDescription,
      },
    })),
    ...skills.map((s: any) => ({
      type: "Skill",
      title: s.account.skillName,
      dateIssued: new Date(
        s.account.timestamp.toNumber() * 1000
      ).toLocaleDateString(),
      status: getStatusString(s.account.status),
      owner: s.account.authority,
      details: {
        skillLevel: s.account.proficiencyLevel?.toString(),
        description: s.account.proofLink,
      },
    })),
    ...employments.map((e: any) => ({
      type: "Employment History",
      title: e.account.jobTitle,
      dateIssued: new Date(
        e.account.timestamp.toNumber() * 1000
      ).toLocaleDateString(),
      status: getStatusString(e.account.status),
      owner: e.account.authority,
      details: {
        company: e.account.companyName,
        position: e.account.jobTitle,
      },
    })),
    ...certificates.map((c: any) => ({
      type: "Certification",
      title: c.account.certificationName,
      dateIssued: new Date(
        c.account.dateOfIssue.toNumber() * 1000
      ).toLocaleDateString(),
      status: getStatusString(c.account.status),
      owner: c.account.authority,
      details: {
        certificationProvider: c.account.issuer,
        description: c.account.proofLink || "N/A",
      },
    })),
  ];
};
function getStatusString(status: any): string {
  switch (status) {
    case 0:
      return "Unverified";
    case 1:
      return "Verified";
    case 2:
      return "Rejected";
    default:
      return "Unknown";
  }
}
