import { cluster, connection } from "./helper/connection";
import { walletKeypair } from "./helper/keypair";
import { PublicKey, sendAndConfirmTransaction } from "@solana/web3.js";
import { getMint } from "@solana/spl-token";
import { toLamport } from "./helper/lamport";
import DLMM, {
  ActivationType,
  deriveCustomizablePermissionlessLbPair,
  LBCLMM_PROGRAM_IDS,
} from "@meteora-ag/dlmm";
import BN from "bn.js";
import { MINT_DECIMAL } from "./mint";
import { CONFIG } from "./config";
import AmmImpl, { PROGRAM_ID } from "@meteora-ag/dynamic-amm-sdk";
import { deriveCustomizablePermissionlessConstantProductPoolAddress } from "@meteora-ag/dynamic-amm-sdk/dist/cjs/src/amm/utils";

export async function createAmmPool(tokenA: PublicKey) {
  const slot = await connection.getSlot();
  const currentPoint =
    CONFIG.DAMM.activationType === ActivationType.Slot
      ? slot
      : (await connection.getBlockTime(slot)) ?? 0;
  const activationPoint =
    CONFIG.DAMM.activationType === ActivationType.Slot
      ? currentPoint + CONFIG.DAMM.activationDelayMs / 400
      : currentPoint + CONFIG.DAMM.activationDelayMs / 1000;

  const tokenAMint = await getMint(connection, tokenA);
  const createPoolTxs =
    await AmmImpl.createCustomizablePermissionlessConstantProductPool(
      connection,
      walletKeypair.publicKey,
      tokenA,
      new PublicKey(CONFIG.MINT.quoteToken.address),
      toLamport(CONFIG.MINT.mintAmount, tokenAMint.decimals),
      toLamport(1, CONFIG.MINT.quoteToken.decimals),
      {
        activationPoint: new BN(activationPoint),
        activationType: CONFIG.DAMM.activationType,
        padding: Array(90).fill(0),
        hasAlphaVault: CONFIG.DAMM.alphaVault,
        tradeFeeNumerator: 2500,
      },
      {
        cluster,
      }
    );

  const signature = await sendAndConfirmTransaction(connection, createPoolTxs, [
    walletKeypair,
  ]);
  console.log("🚀 ~ createAmmPool ~ signature:", signature);

  const poolAddress =
    deriveCustomizablePermissionlessConstantProductPoolAddress(
      tokenA,
      new PublicKey(CONFIG.MINT.quoteToken.address),
      new PublicKey(PROGRAM_ID)
    );
  console.log("🚀 ~ createAmmPool ~ poolAddress:", poolAddress.toBase58());

  return poolAddress;
}

export async function createDLMMPool(tokenA: PublicKey) {
  const slot = await connection.getSlot();
  const currentPoint =
    CONFIG.DLMM.activationType === ActivationType.Slot
      ? slot
      : (await connection.getBlockTime(slot)) ?? 0;
  const activationPoint =
    CONFIG.DLMM.activationType === ActivationType.Slot
      ? currentPoint + CONFIG.DLMM.activationDelayMs / 400
      : currentPoint + CONFIG.DLMM.activationDelayMs / 1000;

  const initPrice = DLMM.getPricePerLamport(
    MINT_DECIMAL,
    CONFIG.MINT.quoteToken.decimals,
    CONFIG.DLMM.initialPrice
  );

  const activateBinId = DLMM.getBinIdFromPrice(
    initPrice,
    CONFIG.DLMM.binStep,
    false
  );

  const createPoolTx = await DLMM.createCustomizablePermissionlessLbPair(
    // @ts-ignore
    connection,
    new BN(CONFIG.DLMM.binStep),
    tokenA,
    new PublicKey(CONFIG.MINT.quoteToken.address),
    new BN(activateBinId),
    new BN(CONFIG.DLMM.feeBps),
    CONFIG.DLMM.activationType,
    true,
    walletKeypair.publicKey,
    new BN(activationPoint),
    false,
    {
      cluster,
    }
  );

  // @ts-ignore
  const signature = await sendAndConfirmTransaction(connection, createPoolTx, [
    walletKeypair,
  ]);
  console.log("🚀 ~ createDLMMPool ~ signature:", signature);

  const [poolAddress] = deriveCustomizablePermissionlessLbPair(
    tokenA,
    new PublicKey(CONFIG.MINT.quoteToken.address),
    new PublicKey(LBCLMM_PROGRAM_IDS[cluster])
  );
  console.log("🚀 ~ createDLMMPool ~ poolAddress:", poolAddress.toBase58());

  return poolAddress;
}
