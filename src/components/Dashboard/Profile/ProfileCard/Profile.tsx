import React, { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import { Program, AnchorProvider } from "@project-serum/anchor";
import "./Profile.css";
import CredentialCard from "../CredentialCard/CredentialCard";
import { IDL } from "../../UploadCredentials/idl1";

const programId = new PublicKey("AsjDSV316uhQKcGNfCECGBzj7eHwrYXho7CivhiQNJQ1");

interface Credential {
  type: string;
  title: string;
  dateIssued: string;
  status: string;
  details?: {
    university?: string;
    cgpa?: string;
    projectUrl?: string;
    description?: string;
    skillLevel?: string;
    company?: string;
    position?: string;
    certificationProvider?: string;
  };
}

const Profile: React.FC = () => {
  const { publicKey, wallet } = useWallet();
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCredentials = async () => {
      if (!publicKey || !wallet) {
        setLoading(false);
        return;
      }

      try {
        const connection = new Connection("https://api.devnet.solana.com");
        const provider = new AnchorProvider(connection, wallet as any, {
          commitment: "processed",
        });

        const program = new Program(IDL as any, programId, provider);

        // Fetch all types of credentials
        const [degrees, projects, skills, employments, certificates] =
          await Promise.all([
            program.account.userDegreeCredential.all([
              { memcmp: { offset: 8, bytes: publicKey.toBase58() } },
            ]),
            program.account.projectCredential.all([
              { memcmp: { offset: 8, bytes: publicKey.toBase58() } },
            ]),
            program.account.skillCredential.all([
              { memcmp: { offset: 8, bytes: publicKey.toBase58() } },
            ]),
            program.account.employmentCredential.all([
              { memcmp: { offset: 8, bytes: publicKey.toBase58() } },
            ]),
            program.account.certificateCredential.all([
              { memcmp: { offset: 8, bytes: publicKey.toBase58() } },
            ]),
          ]);

        const getStatusString = (status: any) => {
          if (status?.verified) return "Verified";
          if (status?.rejected) return "Rejected";
          return "Pending";
        };

        // Transform the data into our Credential interface format
        const formattedCredentials: Credential[] = [
          ...degrees.map((d: any) => ({
            type: "Degree",
            title: d.account.degreeName,
            dateIssued: new Date(
              d.account.timestamp.toNumber() * 1000
            ).toLocaleDateString(),
            status: getStatusString(d.account.status),
            details: {
              university: d.account.collegeName,
              cgpa: d.account.passoutYear?.toString() || "N/A",
            },
          })),
          ...projects.map((p: any) => ({
            type: "Project",
            title: p.account.projectName,
            dateIssued: new Date(
              p.account.timestamp.toNumber() * 1000
            ).toLocaleDateString(),
            status: getStatusString(p.account.status),
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
            details: {
              skillLevel: s.account.proficiencyLevel?.toString(),
              description: s.account.proofLink,
            },
          })),
          ...employments.map((e: any) => ({
            type: "Employment History",
            title: e.account.jobTitle,
            dateIssued: `${new Date(
              e.account.startDate.toNumber() * 1000
            ).toLocaleDateString()} - ${
              e.account.currentlyWorking
                ? "Present"
                : e.account.endDate
                ? new Date(
                    e.account.endDate.toNumber() * 1000
                  ).toLocaleDateString()
                : "N/A"
            }`,
            status: getStatusString(e.account.status),
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
            details: {
              certificationProvider: c.account.issuer,
              description: c.account.proofLink || "N/A",
            },
          })),
        ];

        setCredentials(formattedCredentials);
      } catch (error) {
        console.error("Error fetching credentials:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCredentials();
  }, [publicKey, wallet]);

  if (loading) {
    return <div className="profile-content fade-in">Loading...</div>;
  }

  return (
    <div className="profile-content fade-in">
      <h2>Your Uploaded Credentials</h2>
      <div className="credentials-container">
        {credentials.length > 0 ? (
          credentials.map((credential, index) => (
            <CredentialCard
              key={index}
              type={credential.type}
              title={credential.title}
              dateIssued={credential.dateIssued}
              status={credential.status}
              details={credential.details}
            />
          ))
        ) : (
          <p>No credentials found. Start by uploading your first credential!</p>
        )}
      </div>
    </div>
  );
};

export default Profile;
