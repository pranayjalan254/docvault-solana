import { Program, AnchorProvider } from "@project-serum/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";

const STAKING_PROGRAM_ID = new PublicKey(
  "4f2FENBxCWveGTu1QKZCuiU8hhMb5U4DGeeYTVr64trf"
);

  credentialId: string;
  stakeAmount: number;
  stakeAmount: number;
  verifications: number;
  totalStaked: number;
  isFinalized: boolean;
  isFinalized: boolean;
}

  provider: AnchorProvider,
  credentialId: string,
  credentialId: string,
  stakeAmount: number
) => {
  const program = new Program(IDL as any, STAKING_PROGRAM_ID, provider);

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
};

export const stakeForCredential = async (
  provider: AnchorProvider,
  credentialId: string
) => {
  const program = new Program(IDL as any, STAKING_PROGRAM_ID, provider);

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
};

export const getStakingInfo = async (
  provider: AnchorProvider,
  credentialId: string
): Promise<StakingInfo> => {
  const program = new Program(IDL as any, STAKING_PROGRAM_ID, provider);

  const [credentialPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("credential"), Buffer.from(credentialId)],
    program.programId
  );

  const credentialAccount = await program.account.credential.fetch(
    credentialPDA
  );

  return {
    credentialId: credentialAccount.credentialId,
    stakeAmount: credentialAccount.stakeAmount.toNumber(),
    verifications: credentialAccount.verifications,
    authenticVotes: credentialAccount.authenticVotes,
    totalStaked: credentialAccount.totalStaked.toNumber(),
    isFinalized: credentialAccount.isFinalized,
  };
};
