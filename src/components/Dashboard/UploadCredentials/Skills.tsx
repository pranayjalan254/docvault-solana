import React, { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider, web3 } from "@project-serum/anchor";
import { notification } from "antd";
import { Connection, PublicKey } from "@solana/web3.js";
import { IDL } from "./uploadidl";
import CredentialFormBase from "./CredentialFormBase";

import { saveSkillUpload } from '../../../MongoDB/utils/saveSkillUpload';

const PROGRAM_ID = new PublicKey(
  "AsjDSV316uhQKcGNfCECGBzj7eHwrYXho7CivhiQNJQ1"
);
const connection = new Connection("https://api.devnet.solana.com");

// Enum to match the contract's ProficiencyLevel
type ProficiencyLevel = "Beginner" | "Intermediate" | "Advanced";

const SkillForm: React.FC = () => {
  const [skillName, setSkillName] = useState("");
  const [proficiency, setProficiency] = useState<ProficiencyLevel | "">("");
  const [proofLink, setProofLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [proof, setProof] = useState<File | null>(null);

  const { publicKey, signTransaction, signAllTransactions } = useWallet();

  const getProgram = () => {
    if (!publicKey || !signTransaction || !signAllTransactions) {
      throw new Error("Wallet not connected");
    }

    const anchorWallet = {
      publicKey,
      signTransaction,
      signAllTransactions,
    };

    const provider = new AnchorProvider(connection, anchorWallet, {
      preflightCommitment: "processed",
    });

    const program = new Program(IDL as any, PROGRAM_ID, provider);
    return program;
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

    if (!proof) {
      notification.error({
        message: "Missing PDF",
        description: "Please upload a proof document",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Handle Solana transaction
      const program = getProgram();
      const credentialAccount = web3.Keypair.generate();

      // Create the enum variant object for Anchor
      const proficiencyEnum = { [proficiency.toLowerCase()]: {} };

      await program.methods
        .submitSkill(skillName, proficiencyEnum, proofLink)
        .accounts({
          skill: credentialAccount.publicKey,
          user: publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .signers([credentialAccount])
        .rpc();

      // Save PDF directly to MongoDB
      if (proof) {
        await saveSkillUpload(
          credentialAccount.publicKey.toBase58(),
          proof
        );
      }

      notification.success({
        message: "Success",
        description: "Skill submitted and PDF saved successfully!",
      });

      // Reset form
      setSkillName("");
      setProficiency("");
      setProofLink("");
      setProof(null);
    } catch (error) {
      console.error("Failed to submit skill:", error);
      notification.error({
        message: "Error",
        description: "Failed to submit skill. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CredentialFormBase title="Flaunt your skills" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Skill Name</label>
        <input
          type="text"
          value={skillName}
          onChange={(e) => setSkillName(e.target.value)}
          placeholder="Enter the skill name"
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="form-group">
        <label>Proficiency Level</label>
        <select
          value={proficiency}
          onChange={(e) => setProficiency(e.target.value as ProficiencyLevel)}
          required
          disabled={isSubmitting}
        >
          <option value="">Select Proficiency</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
      </div>

      <div className="form-group">
        <label>Proof Link</label>
        <input
          type="url"
          value={proofLink}
          onChange={(e) => setProofLink(e.target.value)}
          placeholder="Enter proof link (e.g., GitHub, Portfolio)"
          required={!proof}
          disabled={isSubmitting}
        />
      </div>
      <div className="form-group">
        <label>Upload Proofs (Optional)</label>
        <input
          type="file"
          onChange={(e) => setProof(e.target.files?.[0] || null)}
          disabled={isSubmitting}
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !publicKey}
        className="submit-btn"
      >
        {isSubmitting ? "Submitting..." : "Submit Skill"}
      </button>
    </CredentialFormBase>
  );
};

export default SkillForm;
