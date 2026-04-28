import { readFileSync } from "node:fs";

function show(path, label) {
  const data = JSON.parse(readFileSync(path, "utf8"));
  const items = data.items ?? [];
  console.log(`\n=== ${label}: ${items.length} items, hasMore=${data.hasMore} ===`);
  items.slice(0, 12).forEach((p, i) => {
    const n = (i + 1).toString().padStart(2);
    console.log(`  ${n}. [${p.mallName || "-"}] ${String(p.name).slice(0, 64)}`);
  });
  const mallCounts = new Map();
  for (const p of items) {
    mallCounts.set(p.mallName, (mallCounts.get(p.mallName) || 0) + 1);
  }
  console.log("  Top malls:");
  [...mallCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .forEach(([m, c]) => console.log(`    ${c.toString().padStart(3)} ${m}`));
}

show("./feed-jacket.json", "디자이너 자켓");
show("./feed-belt.json", "가죽 벨트");
