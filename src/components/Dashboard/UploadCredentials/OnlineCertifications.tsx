import React, { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider, web3, BN } from "@project-serum/anchor";
import { notification } from "antd";
import { Connection, PublicKey } from "@solana/web3.js";
import { IDL } from "./uploadidl";
import CredentialFormBase from "./CredentialFormBase";
import { saveCertificationUpload } from '../../../MongoDB/utils/saveCertificationUpload';

const PROGRAM_ID = new PublicKey(
  "AsjDSV316uhQKcGNfCECGBzj7eHwrYXho7CivhiQNJQ1"
);
const connection = new Connection("https://api.devnet.solana.com");

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

    if (!publicKey || !proof) {
      notification.error({
        message: "Missing Requirements",
        description: "Please connect wallet and upload proof document",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const program = getProgram();
      const certificateKeypair = web3.Keypair.generate();

      await program.methods
        .submitCertificate(
          certificationName,
          issuer,
          new BN(new Date(dateOfIssue).getTime() / 1000),
          proofLink || null
        )
        .accounts({
          certificate: certificateKeypair.publicKey,
          user: publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .signers([certificateKeypair])
        .rpc();

      // Save PDF to MongoDB
      await saveCertificationUpload(
        certificateKeypair.publicKey.toBase58(),
        proof
      );

      notification.success({
        message: "Success",
        description: "Certificate submitted and saved successfully!",
      });

      // Reset form
      setCertificationName("");
      setIssuer("");
      setDateOfIssue("");
      setProofLink("");
    } catch (error) {
      console.error("Failed to submit certificate:", error);
      alert('Failed to submit certificate.');
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
