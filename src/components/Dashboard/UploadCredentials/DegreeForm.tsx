import React, { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider, web3, BN } from "@project-serum/anchor";
import { notification } from "antd";
import { Connection, PublicKey } from "@solana/web3.js";
import { IDL } from "./idl";

// Replace with your program's ID
const PROGRAM_ID = new PublicKey(
  "GM3nxnbKANvVN6mrTFEAyB5uojjBW1cXWciXeWCZpxa2"
);
const connection = new Connection("https://api.devnet.solana.com");

const DegreeForm: React.FC = () => {
  const [degreeName, setDegreeName] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [passoutYear, setPassoutYear] = useState("");
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

      await program.methods
        .submitCredential(
          degreeName,
          collegeName,
          new BN(parseInt(passoutYear))
        )
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

      // Reset form
      setDegreeName("");
      setCollegeName("");
      setPassoutYear("");
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
    <div className="container mx-auto p-4">
      <form
        onSubmit={handleSubmit}
        className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-md"
      >
        <h2 className="text-2xl font-bold mb-6">
          Submit Your Degree Credentials
        </h2>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Degree Name</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={degreeName}
            onChange={(e) => setDegreeName(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">College Name</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={collegeName}
            onChange={(e) => setCollegeName(e.target.value)}
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Passout Year</label>
          <input
            type="number"
            className="w-full p-2 border rounded"
            value={passoutYear}
            onChange={(e) => setPassoutYear(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={!publicKey || isSubmitting}
          className={`w-full p-3 rounded text-white font-bold
            ${
              !publicKey || isSubmitting
                ? "bg-gray-400"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
        >
          {isSubmitting ? "Submitting..." : "Submit Credential"}
        </button>
      </form>
    </div>
  );
};

export default DegreeForm;
