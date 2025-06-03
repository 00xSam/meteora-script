import { createMint, mintTo } from "./mint";
import { createAmmPool, createDLMMPool } from "./create-pool";
import { airDropSol, walletKeypair } from "./helper/keypair";
import { seedLiquidity } from "./seed-liquidity";
import {
  createAlphaVault,
  createEscrowForAuthority,
  createMerkle,
} from "./create-alpha-vault";
import { connection } from "./helper/connection";
import { toLamport } from "./helper/lamport";
import { PublicKey, sendAndConfirmTransaction } from "@solana/web3.js";
import DLMM from "@meteora-ag/dlmm";
import AlphaVault from "@meteora-ag/alpha-vault";
import { CONFIG } from "./config";

async function exec() {
  const tokenAddress = await createMint();
  await mintTo(tokenAddress, walletKeypair.publicKey);
  const poolAddress = await createDLMMPool(tokenAddress);
  await seedLiquidity(poolAddress);
  const vaultAddress = await createAlphaVault(tokenAddress, poolAddress);
  await createMerkle(vaultAddress);
  // await createEscrowForAuthority(
  //   new PublicKey("2utoW35ZZv3rKco4NYHn1i5HZuhHuLFEsswyGsV3EojW")
  // );
  // await createEscrowForAuthority(
  //   new PublicKey("DdEyv2AM917cvGTzC5LQav9wPaegpsV3QCLDceSsJWrt")
  // );
}

exec();
