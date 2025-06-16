"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { readContract, writeContract } from "@/lib/contracts";
import { formatUnits, parseUnits } from "viem";

export default function Dashboard() {
  const { data: session } = useSession();
  const wallet = session?.user?.address;

  const [walletBalance, setWalletBalance] = useState(0);
  const [claimable, setClaimable] = useState(0);
  const [stakingBalance, setStakingBalance] = useState(0);
  const [stakingReward, setStakingReward] = useState(0);
  const [stakeInput, setStakeInput] = useState("");

  const [loadingClaim, setLoadingClaim] = useState(false);
  const [loadingStake, setLoadingStake] = useState(false);
  const [loadingUnstake, setLoadingUnstake] = useState(false);
  const [loadingCompound, setLoadingCompound] = useState(false);
  const [loadingClaimReward, setLoadingClaimReward] = useState(false);

  const rewardBase = useRef(0);
  const rewardLastUpdate = useRef(Date.now());

  const fetchAll = async () => {
    if (!wallet) return;
    try {
      const [balanceRes, claimableRes, stakeRes, rewardRes] = await Promise.all([
        readContract("token", "balanceOf", [wallet]),
        writeContract("dashboard", "getClaimable", [wallet]),
        writeContract("dashboard", "getStakingBalance", [wallet]),
        writeContract("dashboard", "getReward", [wallet]),
      ]);
      setWalletBalance(Number(formatUnits(balanceRes)));
      setClaimable(Number(formatUnits(claimableRes)));
      const stakeVal = Number(formatUnits(stakeRes));
      setStakingBalance(stakeVal);
      const rewardVal = Number(formatUnits(rewardRes));
      setStakingReward(rewardVal);
      rewardBase.current = rewardVal;
      rewardLastUpdate.current = Date.now();
    } catch (err) {
      console.error("On-chain fetch failed:", err);
    }
  };

  useEffect(() => {
    if (!wallet) return;
    fetchAll();
    const interval = setInterval(fetchAll, 3000);
    return () => clearInterval(interval);
  }, [wallet]);

  useEffect(() => {
    const apy = 0.7;
    let animationId: number;
    const updateReward = () => {
      const now = Date.now();
      const elapsed = (now - rewardLastUpdate.current) / 1000;
      const reward = rewardBase.current + (stakingBalance * apy * elapsed) / (365 * 24 * 3600);
      setStakingReward(reward);
      animationId = requestAnimationFrame(updateReward);
    };
    animationId = requestAnimationFrame(updateReward);
    return () => cancelAnimationFrame(animationId);
  }, [stakingBalance]);

  const six = (num: number) => (num ?? 0).toFixed(6);

  const handleClaim = async () => {
    setLoadingClaim(true);
    try {
      await writeContract("dashboard", "claim", [wallet]);
      await fetchAll();
      alert("Claim success!");
    } catch (e: any) {
      alert(e?.message || "Claim failed!");
    }
    setLoadingClaim(false);
  };

  const handleStake = async () => {
    const amount = parseFloat(stakeInput);
    if (!amount || amount <= 0 || amount > walletBalance) return;
    setLoadingStake(true);
    try {
      await writeContract("token", "approve", [process.env.NEXT_PUBLIC_CONTRACT_DASHBOARD, parseUnits(amount.toString())]);
      await writeContract("dashboard", "stake", [wallet, parseUnits(amount.toString())]);
      await fetchAll();
      setStakeInput("");
      alert("Stake success!");
    } catch (e: any) {
      alert(e?.message || "Stake failed!");
    }
    setLoadingStake(false);
  };

  const handleUnstake = async () => {
    if (stakingBalance <= 0) return;
    setLoadingUnstake(true);
    try {
      await writeContract("dashboard", "unstake", [wallet, parseUnits(stakingBalance.toString())]);
      await fetchAll();
      alert("Unstake success!");
    } catch (e: any) {
      alert(e?.message || "Unstake failed!");
    }
    setLoadingUnstake(false);
  };

  const handleCompound = async () => {
    setLoadingCompound(true);
    try {
      await writeContract("dashboard", "compound", [wallet]);
      await fetchAll();
      alert("Compound success!");
    } catch (e: any) {
      alert(e?.message || "Compound failed!");
    }
    setLoadingCompound(false);
  };

  const handleClaimReward = async () => {
    setLoadingClaimReward(true);
    try {
      await writeContract("dashboard", "claimReward", [wallet]);
      await fetchAll();
      alert("Claim reward success!");
    } catch (e: any) {
      alert(e?.message || "Claim reward failed!");
    }
    setLoadingClaimReward(false);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 p-4 sm:p-6">
      <div className="w-full max-w-md mx-auto grid gap-4 sm:gap-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-4">🌐 World Reward Coin</h1>

        {/* CLAIM */}
        <Card>
          <CardContent className="p-4 sm:p-6 space-y-3">
            <h2 className="text-xl font-semibold text-teal-700">🏛️ CLAIM</h2>
            <p>💼 Wallet Balance: <span className="font-mono">{six(walletBalance)}</span> WRC</p>
            <p>🎁 Available to claim: <span className="font-mono text-green-600">{six(claimable)}</span> WRC</p>
            <Button
              className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold"
              onClick={handleClaim}
              disabled={loadingClaim || claimable <= 0}
            >
              {loadingClaim ? "Processing..." : "Claim Now"}
            </Button>
          </CardContent>
        </Card>

        {/* STAKING */}
        <Card>
          <CardContent className="p-4 sm:p-6 space-y-3">
            <h2 className="text-xl font-semibold text-yellow-600">💰 STAKING</h2>
            <p>📥 Staking Balance: <span className="font-mono">{six(stakingBalance)}</span> WRC</p>
            <Input
              placeholder="Amount to stake"
              value={stakeInput}
              onChange={(e) => {
                const val = e.target.value;
                if (/^\d*\.?\d*$/.test(val)) setStakeInput(val);
              }}
              disabled={loadingStake}
            />
            <Button
              onClick={handleStake}
              disabled={loadingStake || !stakeInput || parseFloat(stakeInput) <= 0}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold"
            >
              {loadingStake ? "Processing..." : "Stake"}
            </Button>
            <Button
              onClick={handleUnstake}
              disabled={loadingUnstake || stakingBalance <= 0}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold"
            >
              {loadingUnstake ? "Processing..." : "Unstake All"}
            </Button>
          </CardContent>
        </Card>

        {/* REWARD */}
        <Card>
          <CardContent className="p-4 sm:p-6 space-y-3">
            <h2 className="text-xl font-semibold text-purple-600">🎉 REWARD</h2>
            <p>💹 Staking Reward: <span className="font-mono text-yellow-600">{six(stakingReward)}</span> WRC</p>
            <Button
              onClick={handleCompound}
              disabled={loadingCompound || stakingReward <= 0}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold"
            >
              {loadingCompound ? "Processing..." : "Compound"}
            </Button>
            <Button
              onClick={handleClaimReward}
              disabled={loadingClaimReward || stakingReward <= 0}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold"
            >
              {loadingClaimReward ? "Processing..." : "Claim Reward"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
