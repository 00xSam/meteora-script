import {
  createInitializeMintInstruction,
  createMintToInstruction,
  getMinimumBalanceForRentExemptMint,
  MintLayout,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { connection } from "./helper/connection";
import {
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { walletKeypair } from "./helper/keypair";
import { getOrCreateATAInstruction } from "./helper/ata";
import { BN } from "@coral-xyz/anchor";
import { CONFIG } from "./config";

export const MINT_DECIMAL = CONFIG.MINT.mintDecimal;
export const MINT_AMOUNT = new BN(CONFIG.MINT.mintAmount);
export const MINT_AMOUNT_LAMPORT = MINT_AMOUNT.mul(
  new BN(10).pow(new BN(MINT_DECIMAL))
);

export async function createMint() {
  const mintAccount = Keypair.generate();
  const balanceNeeded = await getMinimumBalanceForRentExemptMint(connection);

  const transaction = new Transaction();
  transaction.add(
    SystemProgram.createAccount({
      fromPubkey: walletKeypair.publicKey,
      newAccountPubkey: mintAccount.publicKey,
      lamports: balanceNeeded,
      space: MintLayout.span,
      programId: TOKEN_PROGRAM_ID,
    })
  );

  transaction.add(
    createInitializeMintInstruction(
      mintAccount.publicKey,
      MINT_DECIMAL,
      walletKeypair.publicKey,
      walletKeypair.publicKey
    )
  );

  const signature = await sendAndConfirmTransaction(connection, transaction, [
    walletKeypair,
    mintAccount,
  ]);
  console.log("🚀 ~ createMint ~ signature:", signature);
  console.log(
    "🚀 ~ createMint ~ mintAccount:",
    mintAccount.publicKey.toBase58()
  );

  return mintAccount.publicKey;
}

export async function mintTo(mint: PublicKey, address: PublicKey) {
  const [ata, createATAIx] = await getOrCreateATAInstruction(
    mint,
    address,
    walletKeypair.publicKey
  );

  const mintToIx = createMintToInstruction(
    mint,
    ata,
    walletKeypair.publicKey,
    Number(MINT_AMOUNT_LAMPORT.toString())
  );

  const transaction = new Transaction();
  createATAIx && transaction.add(createATAIx);
  transaction.add(mintToIx);

  const signature = await sendAndConfirmTransaction(connection, transaction, [
    walletKeypair,
  ]);
  console.log("🚀 ~ mintTo ~ signature:", signature);

  return signature;
}
