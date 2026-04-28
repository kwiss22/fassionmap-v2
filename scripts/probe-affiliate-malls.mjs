import { readFileSync } from "node:fs";

const env = readFileSync(".env.local", "utf8");
const id = env.match(/NAVER_CLIENT_ID=(.+)/)[1].trim();
const secret = env.match(/NAVER_CLIENT_SECRET=(.+)/)[1].trim();

const queries = ["파페치", "네타포르테", "FARFETCH", "NET-A-PORTER"];

for (const q of queries) {
  const url = `https://openapi.naver.com/v1/search/shop.json?query=${encodeURIComponent(q)}&display=30&sort=sim`;
  const r = await fetch(url, {
    headers: {
      "X-Naver-Client-Id": id,
      "X-Naver-Client-Secret": secret,
    },
  });
  const j = await r.json();
  const items = j.items || [];
  const mallCounts = {};
  for (const item of items) {
    const m = item.mallName || "(empty)";
    mallCounts[m] = (mallCounts[m] || 0) + 1;
  }
  const sorted = Object.entries(mallCounts).sort((a, b) => b[1] - a[1]);
  console.log(`\nQuery: ${q} | total: ${j.total} | returned: ${items.length}`);
  for (const [mall, cnt] of sorted) {
    console.log(`  ${String(cnt).padStart(3)}  ${mall}`);
  }
  // Sample first non-smartstore link
  for (const item of items) {
    if (item.mallName && !item.link.includes("smartstore.naver.com")) {
      console.log(`  sample non-smartstore: mall="${item.mallName}" link=${item.link.slice(0, 80)}`);
      break;
    }
  }
  await new Promise((res) => setTimeout(res, 300));
}
