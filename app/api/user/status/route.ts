import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import { abi } from "@/lib/abi/contract.ts"; // ABI dari WorldAppDashboard
import { erc20Abi } from "@/lib/abi/erc20.ts"; // ABI standar ERC20
import { getUserAddress } from "@/lib/auth";

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS!;
const RPC_URL = process.env.RPC_URL!;

const provider = new ethers.JsonRpcProvider(RPC_URL);

export async function GET(req: NextRequest) {
  try {
    const user = await getUserAddress();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);

    // 1. Available to claim
    const available = await contract.pendingWorldReward(user);

    // 2. Total staking
    const staking = await contract.stakingUsers(user);
    const totalStaked = staking.staked;

    // 3. Staking reward
    const reward = await contract.pendingStakingReward(user);

    // 4. Wallet balance (ambil dari token address yg dipakai di kontrak)
    const tokenAddress = await contract.wrcToken();
    const token = new ethers.Contract(tokenAddress, erc20Abi, provider);
    const balance = await token.balanceOf(user);

    return NextResponse.json({
      availableToClaim: ethers.formatEther(available),
      totalStaked: ethers.formatEther(totalStaked),
      stakingReward: ethers.formatEther(reward),
      walletBalance: ethers.formatEther(balance),
    });
  } catch (err: any) {
    console.error("Status Error:", err);
    return NextResponse.json({ error: "Status fetch failed", detail: err.message }, { status: 500 });
  }
}