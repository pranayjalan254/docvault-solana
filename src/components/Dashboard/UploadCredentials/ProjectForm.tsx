import React, { useState } from "react";
import CredentialFormBase from "./CredentialFormBase";
import { useWallet } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider, web3, BN } from "@project-serum/anchor";
import { notification } from "antd";
import { Connection, PublicKey } from "@solana/web3.js";
import { IDL } from "./uploadidl";
import "./ProjectForm.css";

const PROGRAM_ID = new PublicKey(
  "AsjDSV316uhQKcGNfCECGBzj7eHwrYXho7CivhiQNJQ1"
);
const connection = new Connection("https://api.devnet.solana.com");

const ProjectForm: React.FC = () => {
  const [projectName, setProjectName] = useState("");
  const [collaborators, setCollaborators] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentlyWorking, setCurrentlyWorking] = useState(false);
  const [link, setLink] = useState("");
  const [projectDetails, setProjectDetails] = useState("");
  const [projectFiles, setProjectFiles] = useState<File | null>(null);
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

      // Convert dates to Unix timestamps
      const startTimestamp = new Date(startDate).getTime() / 1000;

      // Only convert endDate if it exists and not currently working
      const endTimestamp = currentlyWorking
        ? null
        : endDate
        ? new Date(endDate).getTime() / 1000
        : null;

      // Convert collaborators string to array if not empty
      const collaboratorsArray = collaborators.trim()
        ? collaborators.split(",").map((c) => c.trim())
        : null;

      await program.methods
        .submitProject(
          projectName,
          projectDetails,
          collaboratorsArray, // This will be null if empty
          new BN(startTimestamp),
          endTimestamp ? new BN(endTimestamp) : null,
          currentlyWorking,
          link
        )
        .accounts({
          project: credentialAccount.publicKey,
          user: publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .signers([credentialAccount])
        .rpc();

      notification.success({
        message: "Success",
        description: "Project submitted successfully!",
      });

      // Reset form
      setProjectName("");
      setCollaborators("");
      setStartDate("");
      setEndDate("");
      setCurrentlyWorking(false);
      setLink("");
      setProjectDetails("");
      setProjectFiles(null);
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
    <CredentialFormBase title="Showcase your Projects" onSubmit={handleSubmit}>
      <div className="project-form-group">
        <label className="form-label">Project Name</label>
        <input
          type="text"
          className="form-input"
          placeholder="Enter your project name"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="project-form-group">
        <label className="form-label">Project Description</label>
        <textarea
          className="form-textarea"
          placeholder="Enter project description"
          value={projectDetails}
          onChange={(e) => setProjectDetails(e.target.value)}
          rows={5}
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="project-form-group">
        <label className="form-label">Collaborators</label>
        <input
          type="text"
          className="form-input"
          placeholder="Enter collaborators (comma-separated)"
          value={collaborators}
          onChange={(e) => setCollaborators(e.target.value)}
          disabled={isSubmitting}
        />
        <small className="text-muted">
          Separate multiple collaborators with commas
        </small>
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

      <div className="project-form-group">
        <label className="form-label">Project Link</label>
        <input
          type="url"
          className="form-input"
          placeholder="Enter project link (e.g., GitHub, Live Demo)"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          disabled={isSubmitting}
          required={!projectFiles}
        />
      </div>
      <div className="form-group">
        <label>Upload Proofs (PDFs/Screenshots)</label>
        <input
          type="file"
          onChange={(e) => setProjectFiles(e.target.files?.[0] || null)}
          required={!link}
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting || !publicKey}
        className="submit-btn"
      >
        {isSubmitting ? "Submitting..." : "Submit Project"}
      </button>
    </CredentialFormBase>
  );
};

export default ProjectForm;
