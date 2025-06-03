import { PoolType, VaultMode, WhitelistMode } from "@meteora-ag/alpha-vault";
import { ActivationType } from "@meteora-ag/dlmm";
import { PublicKey } from "@solana/web3.js";

const USDC = {
  address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  name: "USD Coin",
  symbol: "USDC",
  decimals: 6,
  logoURI:
    "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png",
  tags: ["verified", "community", "strict"],
  daily_volume: 823779949.4626273,
  created_at: "2024-04-26T10:56:58.893768Z",
  freeze_authority: "7dGbd2QZcCKcTndnHcTL8q7SMVXAkp688NTQYwrRCrar",
  mint_authority: "BJE5MMbqXjVwjAF7oxwPYXnTXDyspzZyt4vwenNw5ruG",
  permanent_delegate: null,
  minted_at: null,
  extensions: {
    coingeckoId: "usd-coin",
  },
};

const SOL = {
  address: "So11111111111111111111111111111111111111112",
  name: "Wrapped SOL",
  symbol: "SOL",
  decimals: 9,
  logoURI:
    "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
  tags: ["strict", "community", "verified"],
  daily_volume: 1709149518.4951468,
  created_at: "2024-04-26T10:56:58.893768Z",
  freeze_authority: null,
  mint_authority: null,
  permanent_delegate: null,
  minted_at: null,
  extensions: {
    coingeckoId: "wrapped-solana",
  },
};

const ACTIVATION_DURATION_MIN = 520;

export const CONFIG = {
  MINT: {
    mintDecimal: 6,
    mintAmount: 1_500_000_000,
    quoteToken: USDC,
  },
  DAMM: {
    activationDelayMs: ACTIVATION_DURATION_MIN * 60 * 1000,
    activationType: ActivationType.Slot,
    alphaVault: true,
  },
  DLMM: {
    binStep: 100,
    initialPrice: 0.000001,
    feeBps: 10,
    activationType: ActivationType.Timestamp,
    activationDelayMs: ACTIVATION_DURATION_MIN * 60 * 1000,
    alphaVault: true,
    curvature: 0.6,
    minPrice: 0.000001,
    maxPrice: 0.000005,
  },
  AlphaVault: {
    mode: VaultMode.PRORATA,
    poolType: PoolType.DLMM,
    depositingDelayMs: (ACTIVATION_DURATION_MIN - 150) * 60 * 1000,
    startVestingDelayMs: (ACTIVATION_DURATION_MIN + 10) * 60 * 1000,
    endVestingDelayMs: (ACTIVATION_DURATION_MIN + 20) * 60 * 1000,
    maxDepositingCap: 10,
    individualDepositingCap: 5,
    maxBuyingCap: 10,
    whitelistMode: WhitelistMode.PermissionWithMerkleProof,
    merkle: [
      {
        wallet: new PublicKey("Ajm1uyo9LT3SUXPbiMWUhgFWCGqZVuqHCSSUMHJZDn8z"),
        depositCap: 20,
      },
      {
        wallet: new PublicKey("CZ27ZdV2FT2JpLCVeTCnWQEnJdCPXppfLuArLYmXdMrJ"),
        depositCap: 5,
      },
      {
        wallet: new PublicKey("6dNNMRok1qq2PbMUWNphM8V1H8haQPvv3euPZZwrYv3M"),
        depositCap: 5,
      },
      {
        wallet: new PublicKey("GMtwcuktJfrRcnyGktWW4Vab8cfjPcBy3xbuZgRegw6E"),
        depositCap: 5,
      },
    ],
    authority: [
      {
        address: new PublicKey("Ajm1uyo9LT3SUXPbiMWUhgFWCGqZVuqHCSSUMHJZDn8z"),
        maxAmount: 20,
      },
      {
        address: new PublicKey("CZ27ZdV2FT2JpLCVeTCnWQEnJdCPXppfLuArLYmXdMrJ"),
        maxAmount: 5,
      },
      {
        address: new PublicKey("6dNNMRok1qq2PbMUWNphM8V1H8haQPvv3euPZZwrYv3M"),
        maxAmount: 5,
      },
      {
        address: new PublicKey("GMtwcuktJfrRcnyGktWW4Vab8cfjPcBy3xbuZgRegw6E"),
        maxAmount: 5,
      },
    ],
  },
};
