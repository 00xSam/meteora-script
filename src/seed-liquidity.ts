import DLMM from "@meteora-ag/dlmm";
import {
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
} from "@solana/web3.js";
import { cluster, connection } from "./helper/connection";
import { walletKeypair } from "./helper/keypair";
import BN from "bn.js";
import { CONFIG } from "./config";
import { toLamport } from "./helper/lamport";
import { PoolType } from "@meteora-ag/alpha-vault";

export async function seedLiquidity(poolAddress: PublicKey) {
  // @ts-ignore
  const dlmm = await DLMM.create(connection, poolAddress, {
    cluster,
  });
  const baseKey = new Keypair();
  const { initializeBinArraysAndPositionIxs, addLiquidityIxs } =
    await dlmm.seedLiquidity(
      walletKeypair.publicKey,
      toLamport(CONFIG.MINT.mintAmount, CONFIG.MINT.mintDecimal),
      CONFIG.DLMM.curvature,
      CONFIG.DLMM.minPrice,
      CONFIG.DLMM.maxPrice,
      baseKey.publicKey,
      walletKeypair.publicKey,
      walletKeypair.publicKey,
      walletKeypair.publicKey,
      new BN(0)
    );

  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash("confirmed");

  const initializeBinArrayTxsHash = await Promise.all(
    initializeBinArraysAndPositionIxs.map((groupIx) => {
      const tx = new Transaction({
        feePayer: walletKeypair.publicKey,
        blockhash,
        lastValidBlockHeight,
      }).add(...groupIx);

      return sendAndConfirmTransaction(connection, tx, [
        walletKeypair,
        baseKey,
      ]);
    })
  );
  console.log(
    "🚀 ~ seedLiquidity ~ initializeBinArrayTxsHash:",
    `${initializeBinArrayTxsHash.length} Bin Array Initialized`
  );

  const addLiquidityTxsHash = await Promise.all(
    addLiquidityIxs.map((groupIx) => {
      const tx = new Transaction({
        feePayer: walletKeypair.publicKey,
        blockhash,
        lastValidBlockHeight,
      }).add(...groupIx);

      return sendAndConfirmTransaction(connection, tx, [walletKeypair]);
    })
  );
  console.log(
    "🚀 ~ seedLiquidity ~ addLiquidityTxsHash:",
    `${addLiquidityTxsHash.length} transactions created`
  );
}
