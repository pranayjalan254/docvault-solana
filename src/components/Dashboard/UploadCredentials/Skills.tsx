import React, { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider, web3 } from "@project-serum/anchor";
import { notification } from "antd";
import { Connection, PublicKey } from "@solana/web3.js";
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
    const proficiencyEnum = { [proficiency.toLowerCase()]: {} };

    try {
      setIsSubmitting(true);
      const credentialData = {
        type: "Skill",
        title: skillName,
        details: {
          proficiencyLevel: proficiencyEnum,
          proofLink: proofLink || "",
        },
      };
      // @ts-ignore
      const stableId = generateStableCredentialId(credentialData);

      // First upload to MongoDB
      try {
        await saveCredentialUpload(
          "Skill",
          stableId,
          proof || undefined,
          proofLink || undefined
        );
      } catch (mongoError) {
        console.error("Error saving to MongoDB:", mongoError);
        notification.error({
          message: "Upload Failed",
          description: "Failed to save skill proof. Please try again.",
        });
        return;
      }

      // Proceed with blockchain transaction
      const program = getProgram();
      const credentialAccount = web3.Keypair.generate();

      const treasuryWallet = new web3.PublicKey(
        "C9KvY6JP9LNJo7vpJhkzVdtAVn6pLKuB52uhfLWCj4oU"
      );

      await program.methods
        .submitSkill(skillName, proficiencyEnum, proofLink)
        .accounts({
          skill: credentialAccount.publicKey,
          user: publicKey,
          treasury: treasuryWallet,
          systemProgram: web3.SystemProgram.programId,
        })
        .signers([credentialAccount])
        .rpc();

      notification.success({
        message: "Success",
        description: "Skill credential submitted successfully!",
      });

      // Reset form
      setSkillName("");
      setProficiency("");
      setProofLink("");
      setProof(null);
    } catch (error) {
      console.error("Error submitting credential:", error);
      notification.error({
        message: "Error",
        description: "Failed to submit credential. Please try again.",
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
          required={!proofLink}
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
