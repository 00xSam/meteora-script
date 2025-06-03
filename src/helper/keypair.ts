import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";

// Mainnnet
export const walletKeypair = Keypair.fromSecretKey(
  bs58.decode(process.env.WALLET_KEYPAIR as string)
);

// Devnet
// export const walletKeypair = Keypair.fromSecretKey(
//   bs58.decode(
//     "2Zc4gTuuVuUaiLGyJWaJqBgY3Wwr9C43hyNaXMv26d4No1KDotnhoxBdcgxm1PBjHufv1PGAdF7YBvkWqRQEgtUN"
//   )
// );

export const airDropSol = async (
  connection: Connection,
  publicKey: PublicKey,
  amount = 1
) => {
  try {
    const airdropSignature = await connection.requestAirdrop(
      publicKey,
      amount * LAMPORTS_PER_SOL
    );
    const latestBlockHash = await connection.getLatestBlockhash();
    await connection.confirmTransaction(
      {
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: airdropSignature,
      },
      connection.commitment
    );
  } catch (error) {
    console.error(error);
    throw error;
  }
};
