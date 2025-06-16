import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import { abi } from "@/lib/abi/contract.ts"; // Pastikan ABI kamu tersimpan di sini
import { getUserAddress } from "@/lib/auth";

// Load dari environment variables
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS!;
const RPC_URL = process.env.RPC_URL!;
const PRIVATE_KEY = process.env.PRIVATE_KEY!;

const provider = new ethers.JsonRpcProvider(RPC_URL);
const signer = new ethers.Wallet(PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);

export async function POST(req: NextRequest) {
  try {
    const { action, amount } = await req.json();
    const user = await getUserAddress();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    switch (action) {
      case "claim":
        await contract.claimWorldReward({ from: user });
        return NextResponse.json({ message: "Claimed!" });

      case "stake":
        if (!amount || amount <= 0) {
          return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
        }
        const stakeAmount = ethers.parseEther(amount.toString());
        const allowance = await contract.wrcToken().then((tokenAddress: string) => {
          const token = new ethers.Contract(tokenAddress, [
            "function approve(address spender, uint256 amount) public returns (bool)",
          ], signer);
          return token.approve(CONTRACT_ADDRESS, stakeAmount);
        });
        await allowance.wait(); // tunggu approve selesai
        await contract.stake(stakeAmount, { from: user });
        return NextResponse.json({ message: "Staked!" });

      case "unstake":
        await contract.unstakeAll({ from: user });
        return NextResponse.json({ message: "Unstaked!" });

      case "compound":
        await contract.compound({ from: user });
        return NextResponse.json({ message: "Compounded!" });

      case "claimReward":
        await contract.claimStakingReward({ from: user });
        return NextResponse.json({ message: "Claimed Reward!" });

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (err: any) {
    console.error("Execute Error:", err);
    return NextResponse.json({ error: "Execution failed", detail: err.message }, { status: 500 });
  }
}