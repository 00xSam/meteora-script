import { BN } from "@coral-xyz/anchor";

export const toLamport = (amount: number, decimal: number) => {
  return new BN(Math.floor(amount * Math.pow(10, decimal)));
};

export const fromLamport = (amount: BN, decimal: number) => {
  return amount.toNumber() / Math.pow(10, decimal);
};
