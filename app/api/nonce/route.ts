import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const nonce = crypto.randomUUID().replace(/-/g, "").slice(0, 16) // 16-char alphanumeric

  // Simpan nonce di cookie agar tidak bisa dimodifikasi oleh client
  cookies().set("siwe_nonce", nonce, {
    secure: true,
    httpOnly: true,
    sameSite: "strict",
    maxAge: 60 * 10, // 10 menit
  })

  return NextResponse.json({ nonce })
}