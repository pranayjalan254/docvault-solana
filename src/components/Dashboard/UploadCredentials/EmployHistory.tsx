import React, { useState } from "react";
import CredentialFormBase from "./CredentialFormBase";
import { useWallet } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider, web3, BN } from "@project-serum/anchor";
import { notification } from "antd";
import { Connection, PublicKey } from "@solana/web3.js";
import { IDL } from "./uploadidl";
import { saveCredentialUpload } from "../../../../server/MongoDB/utils/saveCredential"
import { generateStableCredentialId } from "../../../utils/generateStableIDS";

const PROGRAM_ID = new PublicKey(
  "ChbUoMyTEmzcsF7SqmThQzuerwrp7wZW3TwVMEzkGkAX"
);
const connection = new Connection("https://api.devnet.solana.com");

const EmploymentHistoryForm: React.FC = () => {
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentlyWorking, setCurrentlyWorking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [proof, setProof] = useState<File | null>(null);

  const { publicKey, signTransaction, signAllTransactions } = useWallet();
  console.log(proof);
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
        type: "Employment History",
        title: jobTitle,
        details: {
          company: companyName,
          position: jobTitle,
        },
      };
      //@ts-ignore
      const stableId = generateStableCredentialId(credentialData);
      const treasuryWallet = new web3.PublicKey("2i1dGn4DVACThYHYZJqW7eB3WVzHFrMdiC3ECP1hX3VJ");

      // Convert dates to Unix timestamps
      const startTimestamp = new Date(startDate).getTime() / 1000;

      // Only convert endDate if it exists and not currently working
      const endTimestamp = currentlyWorking
        ? null
        : endDate
        ? new Date(endDate).getTime() / 1000
        : null;

      await program.methods
        .submitEmployment(
          companyName,
          jobTitle,
          new BN(startTimestamp),
          endTimestamp ? new BN(endTimestamp) : null,
          currentlyWorking
        )
        .accounts({
          employment: credentialAccount.publicKey,
          user: publicKey,
          treasury: treasuryWallet,
          systemProgram: web3.SystemProgram.programId,
        })
        .signers([credentialAccount])
        .rpc();

      notification.success({
        message: "Success",
        description: "Employment history submitted successfully!",
      });
      if (proof) {
        try {
          await saveCredentialUpload(
            'Employment',
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
      setCompanyName("");
      setJobTitle("");
      setStartDate("");
      setEndDate("");
      setCurrentlyWorking(false);
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
    <CredentialFormBase title="Employment History" onSubmit={handleSubmit}>
      <div className="project-form-group">
        <label className="form-label">Company Name</label>
        <input
          type="text"
          className="form-input"
          placeholder="Enter your company name"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="project-form-group">
        <label className="form-label">Job Title</label>
        <input
          type="text"
          className="form-input"
          placeholder="Enter your designation"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="project-form-group timeline-group">
        <div className="date-input">
          <label className="form-label">Start Date</label>
          <input
            type="date"
            className="form-input date-picker"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="date-input">
          <label className="form-label">End Date</label>
          <input
            type="date"
            className="form-input date-picker"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            disabled={currentlyWorking || isSubmitting}
            required={!currentlyWorking}
          />
        </div>
      </div>

      <div className="project-form-group checkbox-group">
        <label className="form-checkbox">
          <input
            type="checkbox"
            className="checkbox-input"
            checked={currentlyWorking}
            onChange={(e) => {
              setCurrentlyWorking(e.target.checked);
              if (e.target.checked) {
                setEndDate("");
              }
            }}
            disabled={isSubmitting}
          />
          Currently Working
        </label>
      </div>
      <div className="form-group">
        <label>Upload Proofs (Offer Letter/ID)</label>
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
        {isSubmitting ? "Submitting..." : "Submit Employment History"}
      </button>
    </CredentialFormBase>
  );
};

export default EmploymentHistoryForm;
