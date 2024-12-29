import React, { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider, web3, BN } from "@project-serum/anchor";
import { notification } from "antd";
import { Connection, PublicKey } from "@solana/web3.js";
import { IDL } from "./uploadidl";
import CredentialFormBase from "./CredentialFormBase";
import { saveCredentialUpload } from "../../../../server/MongoDB/utils/saveCredential"
import { generateStableCredentialId } from "../../../utils/generateStableIDS";


const PROGRAM_ID = new PublicKey(
  "AsjDSV316uhQKcGNfCECGBzj7eHwrYXho7CivhiQNJQ1"
);
const connection = new Connection("https://api.devnet.solana.com");

const DegreeForm: React.FC = () => {
  const [degreeName, setDegreeName] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [passoutYear, setPassoutYear] = useState("");
  const [proof, setProof] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    try {
      setIsSubmitting(true);
      const program = getProgram();
      const credentialAccount = web3.Keypair.generate();

      const credentialData = {
        type: "Degree",
        title: degreeName,
        details: {
          university: collegeName,
          passoutYear: passoutYear,
        },
      };
      // @ts-ignore
      const stableId = generateStableCredentialId(credentialData);

      await program.methods
        .submitDegree(degreeName, collegeName, new BN(parseInt(passoutYear)))
        .accounts({
          credential: credentialAccount.publicKey,
          user: publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .signers([credentialAccount])
        .rpc();

      notification.success({
        message: "Success",
        description: "Credential submitted successfully!",
      });
      
      if (proof) {
        try {
          await saveCredentialUpload(
            'Degree',
            stableId,
            proof
          );
        } catch (mongoError) {
          console.error("Error saving to MongoDB:", mongoError);
          notification.warning({
            message: "Partial Success",
            description: "Certificate submitted on-chain but failed to save proof file.",
          });
        }
      }
      // Reset form
      setDegreeName("");
      setCollegeName("");
      setPassoutYear("");
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
    <CredentialFormBase
      title="Upload Your College Degree"
      onSubmit={handleSubmit}
    >
      <div className="form-group">
        <label>Degree Name</label>
        <input
          type="text"
          placeholder="Enter your degree name"
          value={degreeName}
          onChange={(e) => setDegreeName(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>College Name</label>
        <input
          type="text"
          placeholder="Enter your college name"
          value={collegeName}
          onChange={(e) => setCollegeName(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Passout Year</label>
        <input
          type="number"
          placeholder="Enter your passout year"
          value={passoutYear}
          onChange={(e) => setPassoutYear(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>Upload Proofs (Transcripts/ID)</label>
        <input
          type="file"
          onChange={(e) => setProof(e.target.files?.[0] || null)}
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting || !publicKey}
        className="submit-btn"
      >
        {isSubmitting ? "Submitting..." : "Submit Degree"}
      </button>
    </CredentialFormBase>
  );
};

export default DegreeForm;
