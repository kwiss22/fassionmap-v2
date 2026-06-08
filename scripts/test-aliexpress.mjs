import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvLocal() {
  try {
    const raw = readFileSync(resolve(".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (!m) continue;
      const key = m[1];
      const val = m[2].trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    // ignore
  }
}

loadEnvLocal();

const { fetchAliexpressProductsPage } = await import("../lib/aliexpress-api.ts");

try {
  const page = await fetchAliexpressProductsPage("women dress", { pageSize: 3 });
  console.log(JSON.stringify({ ok: true, count: page.items.length, sample: page.items[0]?.name }, null, 2));
} catch (e) {
  console.error("FAIL:", e instanceof Error ? e.message : e);
  process.exit(1);
}
