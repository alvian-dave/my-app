// lib/auth.ts
import { cookies } from "next/headers";
import { SiweMessage } from "siwe";
import { verifyMessage } from "viem";

export async function getUserAddress(): Promise<string> {
  const cookie = cookies().get("siwe")?.value;

  if (!cookie) throw new Error("Not authenticated");

  const session = JSON.parse(cookie);
  const { message, signature } = session;

  const siweMessage = new SiweMessage(message);

  const valid = await verifyMessage({
    address: siweMessage.address,
    message: siweMessage.prepareMessage(),
    signature,
  });

  if (!valid) throw new Error("Invalid signature");

  return siweMessage.address;
}