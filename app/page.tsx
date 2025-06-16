"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import {
  MiniKit,
  VerifyCommandInput,
  VerificationLevel,
  ISuccessResult,
} from "@worldcoin/minikit-js";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    setLoading(true);
    try {
      if (!MiniKit.isInstalled()) {
        alert("World App is not installed.");
        return;
      }

      const verifyPayload: VerifyCommandInput = {
        action: "log-in", // Ganti dengan Action ID kamu di Developer Portal
        verification_level: VerificationLevel.Orb, // Gunakan "Device" jika tidak pakai Orb
      };

      const { finalPayload } = await MiniKit.commandsAsync.verify(verifyPayload);

      if (finalPayload.status === "error") {
        console.error("Verification error:", finalPayload);
        alert("Verification failed or canceled.");
        return;
      }

      const response = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payload: finalPayload as ISuccessResult,
          action: verifyPayload.action,
        }),
      });

      const result = await response.json();
      if (response.ok && result.status === 200) {
        // ✅ Verifikasi sukses, arahkan ke dashboard
        router.push(`/dashboard?wallet=${verifyPayload.action}`);
      } else {
        alert("Verification failed.");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-cyan-200 via-blue-100 to-indigo-200 px-2">
      <Card className="rounded-2xl shadow-xl p-8 max-w-xs w-full flex flex-col items-center">
        <CardContent className="flex flex-col items-center p-0 w-full">
          <span className="text-5xl mb-3">🌐</span>
          <h1 className="font-bold text-2xl text-center mb-2 text-gray-800">
            World Reward Coin
          </h1>
          <p className="text-center text-gray-600 mb-5 text-sm">
            Verify with World App to continue
          </p>
          <button
            className="w-full py-2 px-4 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-lg shadow text-lg transition"
            onClick={handleVerify}
            type="button"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify with World App"}
          </button>
        </CardContent>
      </Card>
      <div className="text-xs text-gray-400 mt-8">
        © {new Date().getFullYear()} World Reward Coin
      </div>
    </div>
  );
}
