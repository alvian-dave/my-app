import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { verifySiweMessage, MiniAppWalletAuthSuccessPayload } from "@worldcoin/minikit-js"

interface IRequestPayload {
  payload: MiniAppWalletAuthSuccessPayload
  nonce: string
}

export async function POST(req: NextRequest) {
  const { payload, nonce } = (await req.json()) as IRequestPayload

  const storedNonce = cookies().get("siwe_nonce")?.value
  if (!storedNonce || storedNonce !== nonce) {
    return NextResponse.json({
      status: "error",
      isValid: false,
      message: "Invalid or expired nonce",
    }, { status: 400 })
  }

  try {
    const result = await verifySiweMessage(payload, nonce)

    if (!result.isValid) {
      return NextResponse.json({
        status: "error",
        isValid: false,
        message: "Invalid signature",
      }, { status: 400 })
    }

    // ✅ Login berhasil
    return NextResponse.json({
      status: "success",
      isValid: true,
      address: payload.address,
    })
  } catch (error: any) {
    return NextResponse.json({
      status: "error",
      isValid: false,
      message: error.message || "Internal server error",
    }, { status: 500 })
  }
}
