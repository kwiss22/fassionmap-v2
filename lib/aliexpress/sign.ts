import { createHash } from "node:crypto";

/** Taobao Open Platform MD5 sign (app_secret + sorted key/value + app_secret). */
export function signTopMd5(
  params: Record<string, string>,
  appSecret: string
): string {
  const keys = Object.keys(params).sort();
  let base = appSecret;
  for (const key of keys) {
    base += key + params[key];
  }
  base += appSecret;
  return createHash("md5").update(base, "utf8").digest("hex").toUpperCase();
}

/** API timestamp (GMT+8, yyyy-MM-dd HH:mm:ss). */
export function topApiTimestamp(): string {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
    .format(new Date())
    .replace("T", " ");
}
