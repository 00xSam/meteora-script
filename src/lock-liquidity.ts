import { PublicKey, sendAndConfirmTransaction } from "@solana/web3.js";
import { connection } from "./helper/connection";
import { walletKeypair } from "./helper/keypair";
import BN from "bn.js";
import AmmImpl from "@meteora-ag/dynamic-amm-sdk";

export const lockLiquidity = async (
  poolAddress: PublicKey,
  amount: BN,
  feeVaultKey?: PublicKey
) => {
  const ammImpl = await AmmImpl.create(connection, poolAddress, {
    cluster: "devnet",
  });

  const tx = await ammImpl.lockLiquidity(
    feeVaultKey ?? walletKeypair.publicKey,
    amount,
    walletKeypair.publicKey
  );

  const signature = await sendAndConfirmTransaction(connection, tx, [
    walletKeypair,
  ]);
  console.log("🚀 ~ lockLiquidity ~ signature:", signature);
};
