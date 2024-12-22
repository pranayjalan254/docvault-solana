import { Program, AnchorProvider, IdlAccounts } from "@project-serum/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { IDL } from "../../smart contracts/uploadidl.ts";
export const STAKING_PROGRAM_ID = new PublicKey(
  "4f2FENBxCWveGTu1QKZCuiU8hhMb5U4DGeeYTVr64trf"
);

interface StakingInfo {
  credentialId: string;
  stakeAmount: number;
  verifications: number;
  authenticVotes: number;
  totalStaked: number;
  isFinalized: boolean;
}

type CredentialAccount = IdlAccounts<typeof IDL>["credential"];

export const initializeCredential = async (
  provider: AnchorProvider,
  credentialId: string,
  stakeAmount: number
): Promise<void> => {
  try {
    const program = new Program(IDL, STAKING_PROGRAM_ID, provider);

    const [credentialPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("credential"), Buffer.from(credentialId)],
      program.programId
    );

    await program.methods
      .initializeCredential(credentialId, stakeAmount)
      .accounts({
        credential: credentialPDA,
        authority: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
  } catch (error) {
    throw new Error(`Failed to initialize credential: ${error}`);
  }
};

export const stakeForCredential = async (
  provider: AnchorProvider,
  credentialId: string
): Promise<void> => {
  try {
    const program = new Program(IDL, STAKING_PROGRAM_ID, provider);

    const [credentialPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("credential"), Buffer.from(credentialId)],
      program.programId
    );

    const [verifierPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("verifier"),
        credentialPDA.toBuffer(),
        provider.wallet.publicKey.toBuffer(),
      ],
      program.programId
    );

    await program.methods
      .stakeForCredential()
      .accounts({
        credential: credentialPDA,
        verifier: verifierPDA,
        authority: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
  } catch (error) {
    throw new Error(`Failed to stake for credential: ${error}`);
  }
};

export const getStakingInfo = async (
  provider: AnchorProvider,
  credentialId: string
): Promise<StakingInfo> => {
  try {
    const program = new Program(IDL, STAKING_PROGRAM_ID, provider);

    const [credentialPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("credential"), Buffer.from(credentialId)],
      program.programId
    );

    const credentialAccount = (await program.account.credential.fetch(
      credentialPDA
    )) as CredentialAccount;

    return {
      credentialId: credentialAccount.credentialId,
      stakeAmount: credentialAccount.stakeAmount.toNumber(),
      verifications: credentialAccount.verifications,
      authenticVotes: credentialAccount.authenticVotes,
      totalStaked: credentialAccount.totalStaked.toNumber(),
      isFinalized: credentialAccount.isFinalized,
    };
  } catch (error) {
    throw new Error(`Failed to get staking info: ${error}`);
  }
};
