// viem/accounts.ts
import { privateKeyToAccount } from "viem/accounts";

const PRIVATE_KEY = process.env.PRIVATE_KEY;

if (!PRIVATE_KEY) {
  throw new Error("PRIVATE_KEY not set in environment variables");
}

export const ownerAccount = privateKeyToAccount(PRIVATE_KEY);