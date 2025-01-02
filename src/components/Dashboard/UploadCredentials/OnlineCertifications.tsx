import React, { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider, web3 } from "@project-serum/anchor";
import { notification } from "antd";
import { Connection, PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import { IDL } from "./uploadidl";
import CredentialFormBase from "./CredentialFormBase";
import { saveCredentialUpload } from "../../../../server/MongoDB/utils/saveCredential";
import { generateStableCredentialId } from "../../../utils/generateStableIDS";

const PROGRAM_ID = new PublicKey("apwW9Vqxtu4Ga2dQ4R91jyYtWZ9HUFtx13MmPPfwLEb");
const connection = new Connection(
  `https://devnet.helius-rpc.com/?api-key=${
    import.meta.env.VITE_HELIUS_API_KEY
  }`
);

const OnlineCertificationsForm: React.FC = () => {
  const [certificationName, setCertificationName] = useState("");
  const [issuer, setIssuer] = useState("");
  const [dateOfIssue, setDateOfIssue] = useState("");
  const [proofLink, setProofLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [proof, setProof] = useState<File | null>(null);

  const wallet = useWallet();
  const { publicKey } = wallet;

  const getProgram = () => {
    if (
      !wallet.publicKey ||
      !wallet.signTransaction ||
      !wallet.signAllTransactions
    ) {
      throw new Error("Wallet not connected");
    }

    const provider = new AnchorProvider(connection, wallet as any, {
      preflightCommitment: "processed",
    });

    return new Program(IDL as any, PROGRAM_ID, provider);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!publicKey) {
      notification.error({
        message: "Wallet not connected",
        description: "Please connect your wallet to submit credentials",
      });
      return;
    }

    // Validate date
    const issueDate = new Date(dateOfIssue);
    if (isNaN(issueDate.getTime())) {
      notification.error({
        message: "Invalid Date",
        description: "Please enter a valid date of issue",
      });
      return;
    }

    // Validate future dates
    if (issueDate > new Date()) {
      notification.error({
        message: "Invalid Date",
        description: "Date of issue cannot be in the future",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const program = getProgram();
      const certificateKeypair = web3.Keypair.generate();
      const credentialData = {
        type: "Certificate",
        title: certificationName,
        details: {
          issuer: issuer,
          proofLink: proofLink || "N/A",
        },
      };
      // @ts-ignore
      const stableId = generateStableCredentialId(credentialData);
      const treasuryWallet = new web3.PublicKey(
        "C9KvY6JP9LNJo7vpJhkzVdtAVn6pLKuB52uhfLWCj4oU"
      );

      const issueTimestamp = Math.floor(issueDate.getTime() / 1000); // Convert to Unix timestamp

      await program.methods
        .submitCertificate(
          certificationName,
          issuer,
          new BN(issueTimestamp),
          proofLink ? proofLink : null
        )
        .accounts({
          certificate: certificateKeypair.publicKey,
          user: publicKey,
          treasury: treasuryWallet,
          systemProgram: web3.SystemProgram.programId,
        })
        .signers([certificateKeypair])
        .rpc();

      if (proof || proofLink) {
        try {
          await saveCredentialUpload(
            "Certification",
            stableId,
            proof || undefined,
            proofLink || undefined
          );
          notification.success({
            message: "Success",
            description: "Certificate submitted successfully!",
          });
        } catch (mongoError) {
          console.error("Error saving to MongoDB:", mongoError);
          notification.warning({
            message: "Partial Success",
            description:
              "Certificate submitted on-chain but failed to save proof file.",
          });
        }
      } else {
        notification.success({
          message: "Success",
          description: "Certificate submitted successfully!",
        });
      }

      // Reset form
      setCertificationName("");
      setIssuer("");
      setDateOfIssue("");
      setProofLink("");
      setProof(null);
    } catch (error) {
      console.error("Error submitting certificate:", error);
      notification.error({
        message: "Error",
        description: "Failed to submit certificate. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CredentialFormBase title="Online Certifications" onSubmit={handleSubmit}>
      <div className="project-form-group">
        <label className="form-label">Certification Name</label>
        <input
          type="text"
          className="form-input"
          placeholder="Enter certification name"
          value={certificationName}
          onChange={(e) => setCertificationName(e.target.value)}
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="project-form-group">
        <label className="form-label">Issuing Organization</label>
        <input
          type="text"
          className="form-input"
          placeholder="Enter issuer name (e.g., Coursera, Udacity)"
          value={issuer}
          onChange={(e) => setIssuer(e.target.value)}
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="project-form-group">
        <label className="form-label">Date of Issue</label>
        <input
          type="date"
          className="form-input date-picker"
          value={dateOfIssue}
          onChange={(e) => setDateOfIssue(e.target.value)}
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="project-form-group">
        <label className="form-label">Verification Link (Optional)</label>
        <input
          type="url"
          className="form-input"
          placeholder="Enter certificate verification link"
          value={proofLink}
          onChange={(e) => setProofLink(e.target.value)}
          disabled={isSubmitting}
          required={!proof}
        />
      </div>
      <div className="form-group">
        <label>Upload Certificates</label>
        <input
          type="file"
          onChange={(e) => setProof(e.target.files?.[0] || null)}
        />
        required={!proofLink}
      </div>
      <button
        type="submit"
        disabled={isSubmitting || !publicKey}
        className="submit-btn"
      >
        {isSubmitting ? "Submitting..." : "Submit Certificate"}
      </button>
    </CredentialFormBase>
  );
};

export default OnlineCertificationsForm;
