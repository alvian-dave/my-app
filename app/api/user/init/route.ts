import { NextRequest, NextResponse } from "next/server";
import { getDashboardContract } from "@/lib/contract";
import { getUserAddress } from "@/lib/auth";
import { ethers } from "ethers";

export async function POST(req: NextRequest) {
  try {
    const address = await getUserAddress();
    const contract = await getDashboardContract();

    // Check if user already has data
    const userData = await contract.read.worldUsers([address]);
    const alreadyRegistered = BigInt(userData.lastClaim || 0n) > 0n;

    // Only initialize if user not yet registered
    if (!alreadyRegistered) {
      await contract.write.setWithdrawWallet([address], {
        account: address,
      });
    }

    return NextResponse.json({
      status: "success",
      alreadyRegistered,
    });
  } catch (err: any) {
    console.error("Init error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}