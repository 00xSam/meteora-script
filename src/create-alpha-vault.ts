import AlphaVault, {
  ActivationType,
  BalanceTree,
  deriveAlphaVault,
  PoolType,
  PROGRAM_ID,
  VaultMode,
} from "@meteora-ag/alpha-vault";
import { toLamport } from "./helper/lamport";
import { cluster, connection } from "./helper/connection";
import {
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
} from "@solana/web3.js";
import { CONFIG } from "./config";
import BN, { max } from "bn.js";
import { walletKeypair } from "./helper/keypair";

export async function createAlphaVault(
  tokenA: PublicKey,
  poolAddress: PublicKey
) {
  const slot = await connection.getSlot();
  const poolType = CONFIG.AlphaVault.poolType;
  const activationType =
    poolType === PoolType.DLMM
      ? CONFIG.DLMM.activationType
      : CONFIG.DAMM.activationType;
  const currentPoint =
    // @ts-ignore
    activationType === ActivationType.SLOT
      ? slot
      : (await connection.getBlockTime(slot)) ?? 0;
  const depositingPoint =
    currentPoint +
    // @ts-ignore
    (activationType === ActivationType.SLOT
      ? CONFIG.AlphaVault.depositingDelayMs / 400
      : CONFIG.AlphaVault.depositingDelayMs / 1000);

  const startVestingPoint =
    currentPoint +
    // @ts-ignore
    (activationType === ActivationType.SLOT
      ? CONFIG.AlphaVault.startVestingDelayMs / 400
      : CONFIG.AlphaVault.startVestingDelayMs / 1000);
  const endVestingPoint =
    currentPoint +
    // @ts-ignore
    (activationType === ActivationType.SLOT
      ? CONFIG.AlphaVault.endVestingDelayMs / 400
      : CONFIG.AlphaVault.endVestingDelayMs / 1000);

  let createVaultTx;
  if (CONFIG.AlphaVault.mode === VaultMode.FCFS) {
    createVaultTx = await AlphaVault.createCustomizableFcfsVault(
      connection,
      {
        baseMint: tokenA,
        quoteMint: new PublicKey(CONFIG.MINT.quoteToken.address),
        poolAddress,
        poolType: CONFIG.AlphaVault.poolType,
        depositingPoint: new BN(depositingPoint),
        startVestingPoint: new BN(startVestingPoint),
        endVestingPoint: new BN(endVestingPoint),
        maxDepositingCap: toLamport(
          CONFIG.AlphaVault.maxDepositingCap,
          CONFIG.MINT.quoteToken.decimals
        ),
        individualDepositingCap: toLamport(
          CONFIG.AlphaVault.individualDepositingCap,
          CONFIG.MINT.quoteToken.decimals
        ),
        escrowFee: new BN(0),
        whitelistMode: CONFIG.AlphaVault.whitelistMode,
      },
      walletKeypair.publicKey,
      {
        cluster,
      }
    );
  } else {
    createVaultTx = await AlphaVault.createCustomizableProrataVault(
      connection,
      {
        baseMint: tokenA,
        quoteMint: new PublicKey(CONFIG.MINT.quoteToken.address),
        poolAddress,
        poolType: CONFIG.AlphaVault.poolType,
        depositingPoint: new BN(depositingPoint),
        startVestingPoint: new BN(startVestingPoint),
        endVestingPoint: new BN(endVestingPoint),
        escrowFee: new BN(0),
        whitelistMode: CONFIG.AlphaVault.whitelistMode,
        maxBuyingCap: toLamport(
          CONFIG.AlphaVault.maxBuyingCap,
          CONFIG.MINT.quoteToken.decimals
        ),
      },
      walletKeypair.publicKey,
      {
        cluster,
      }
    );
  }

  const createVaultTxHash = await sendAndConfirmTransaction(
    connection,
    createVaultTx,
    [walletKeypair]
  );
  console.log("🚀 ~ createAlphaVault ~ signature:", createVaultTxHash);

  const [alphaVaultAddress] = deriveAlphaVault(
    walletKeypair.publicKey,
    poolAddress,
    new PublicKey(PROGRAM_ID[cluster])
  );
  console.log("🚀 ~ alphaVaultAddress:", alphaVaultAddress.toBase58());

  return alphaVaultAddress;
}

export async function createMerkle(vaultAddress: PublicKey) {
  const alphaVault = await AlphaVault.create(connection, vaultAddress, {
    cluster,
  });
  const tree = new BalanceTree(
    CONFIG.AlphaVault.merkle.map((info) => {
      return {
        account: info.wallet,
        maxCap: toLamport(info.depositCap, CONFIG.MINT.quoteToken.decimals),
      };
    })
  );
  const version = new BN(0);

  const createMerkleProofTx = await alphaVault.createMerkleRootConfig(
    tree.getRoot(),
    version,
    walletKeypair.publicKey
  );
  const createMerkleProofTxHash = await sendAndConfirmTransaction(
    connection,
    createMerkleProofTx,
    [walletKeypair]
  );
  console.log("🚀 ~ createMerkleProofTxHash:", createMerkleProofTxHash);
}

export async function createEscrowForAuthority(vaultAddress: PublicKey) {
  const alphaVault = await AlphaVault.create(connection, vaultAddress, {
    cluster,
  });
  const walletDepositCap = CONFIG.AlphaVault.authority.map(
    ({ address, maxAmount }) => ({
      address,
      maxAmount: toLamport(maxAmount, CONFIG.MINT.quoteToken.decimals),
    })
  );
  const createStakeEscrowIxs =
    await alphaVault.createMultipleStakeEscrowByAuthorityInstructions(
      walletDepositCap,
      walletKeypair.publicKey
    );
  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash();
  const createEscrowTx = new Transaction({
    feePayer: walletKeypair.publicKey,
    blockhash,
    lastValidBlockHeight,
  }).add(...createStakeEscrowIxs);
  const createStakeEscrowTxHash = await sendAndConfirmTransaction(
    connection,
    createEscrowTx,
    [walletKeypair]
  );
  console.log("🚀 ~ createStakeEscrowTxHash:", createStakeEscrowTxHash);
}
