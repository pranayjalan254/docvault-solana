import { Connection, clusterApiUrl, PublicKey } from "@solana/web3.js";
import { Program, AnchorProvider } from "@project-serum/anchor";
import { IDL } from "../components/Dashboard/UploadCredentials/idl1";

const PROGRAM_ID = new PublicKey("GM3nxnbKANvVN6mrTFEAyB5uojjBW1cXWciXeWpxa2");

export const getProvider = () => {
  const connection = new Connection(clusterApiUrl("devnet"));
  const provider = new AnchorProvider(connection, window.solana, {
    commitment: "processed",
  });
  return provider;
};

export const getProgram = () => {
  const provider = getProvider();
  return new Program(IDL as any, PROGRAM_ID, provider);
};
