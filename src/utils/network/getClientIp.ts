import {headers} from "next/headers";

export async function getClientIp(): Promise<string> {
  const rawIp = (await headers()).get("x-forwarded-for") || "";
  const ip = rawIp.split(",")[0]?.trim() || "127.0.0.1";
  return ip;
}
