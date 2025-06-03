import {
  PublicKey,
  Transaction,
  TransactionBlockhashCtor,
} from "@solana/web3.js";
import StakeForFee from "@temekats/eefrofekats";
import { connection } from "./helper/connection";
import { walletKeypair } from "./helper/keypair";
import { BN } from "bn.js";

export async function createFeeFarm(
  poolAddress: PublicKey,
  stakeMint: PublicKey
) {
  const now = new Date();
  const createFeeFarmTx = await StakeForFee.createFeeVault(
    connection,
    poolAddress,
    stakeMint,
    walletKeypair.publicKey,
    {
      secondsToFullUnlock: new BN(7 * 86400), // Fee distribution duration - 7 days
      startFeeDistributeTimestamp: new BN(
        new Date(now.setMinutes(now.getMinutes() + 5)).getTime() / 1000 // 5 minutes from now
      ),
      topListLength: 10, // top 10 earners get fee
      unstakeLockDuration: new BN(60 * 60 * 6), // unstake lock duration - 6 hours
      padding: [],
    }
  );

  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash();
  const ctor: TransactionBlockhashCtor = {
    blockhash,
    lastValidBlockHeight,
  };
  const tx = new Transaction(ctor).add(createFeeFarmTx);
  tx.sign(walletKeypair);
  const simulation = await connection.simulateTransaction(tx);
  console.log("🚀 ~ simulation:", simulation);
  // const signature = await sendAndConfirmTransaction(
  //   connection,
  //   new Transaction(ctor).add(createFeeFarmTx),
  //   [walletKeypair]
  // );
  // console.log("🚀 ~ createFeeFarm ~ signature:", signature);
}
