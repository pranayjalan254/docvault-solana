import { Connection, clusterApiUrl, PublicKey } from "@solana/web3.js";
import { AnchorProvider, Program } from "@project-serum/anchor";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { IDL } from "../components/Dashboard/UploadCredentials/idl";

const PROGRAM_ID = new PublicKey("GM3nxnbKANvVN6mrTFEAyB5uojjBW1cXWciXeWpxa2H");

export const getProvider = () => {
  const connection = new Connection(clusterApiUrl("devnet"));
  const provider = new AnchorProvider(connection, window.solana, {
    commitment: "processed",
  });
  return provider;
};

export const getProgram = (wallet: AnchorWallet) => {
  const connection = new Connection(clusterApiUrl("devnet"));
  const provider = new AnchorProvider(connection, wallet, {
    commitment: "processed",
  });

  return new Program(IDL as any, PROGRAM_ID, provider);
};
