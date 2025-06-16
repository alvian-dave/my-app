// lib/viem/chains.ts
import { defineChain } from "viem";

export const worldChain = defineChain({
  id: 480,
  name: "World Chain Mainnet",
  network: "worldchain",
  nativeCurrency: {
    name: "Worldcoin",
    symbol: "WLD",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://worldchain-mainnet.g.alchemy.com/public"],
    },
    public: {
      http: ["https://worldchain-mainnet.g.alchemy.com/public"],
    },
  },
  blockExplorers: {
    default: {
      name: "WorldChain Explorer",
      url: "https://worldscan.org/",
    },
  },
});
