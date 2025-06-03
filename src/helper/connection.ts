import { Connection } from "@solana/web3.js";

// export const connection = new Connection(
//   "https://mercuria-mercuria-7684.devnet.rpcpool.com/f2a7f442-eae6-4f1d-bc5f-0c3eb95cec00",
//   "confirmed"
// );

// export const cluster = "devnet";

export const connection = new Connection(
  "https://mainnet.helius-rpc.com/?api-key=c0b115fe-ab4f-4adc-a0c0-eac44cf8de6f",
  "confirmed"
);

export const cluster = "mainnet-beta";
