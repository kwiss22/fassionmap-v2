/**
 * DEV-ONLY 진단 엔드포인트.
 * 홈 피드 섹션 전체를 Naver 원본 응답(필터 미적용)으로 긁어와서
 * mallName 분포, 현재 BLOCK/BOOST 분류 적중률, 타이틀 sanitize 결과를 집계한다.
 *
 * 목적: BLOCK/BOOST/스팸 토큰 리스트를 실데이터 기반으로 튜닝.
 */

import { HOME_FEED_SECTIONS } from "@/lib/home-feed";
import { isBlockedMall, isBoostedMall } from "@/lib/mall-policy";
import { sanitizeTitle } from "@/lib/title-sanitize";

type NaverItem = {
  title: string;
  lprice: string;
  mallName?: string;
  link: string;
};

type MallEntry = {
  count: number;
  blocked: boolean;
  boosted: boolean;
  keywords: Set<string>;
  sampleTitles: string[];
  avgPrice: number;
  priceSum: number;
};

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return new Response("Not found", { status: 404 });
  }

  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return Response.json({ error: "missing NAVER creds" }, { status: 500 });
  }

  const mallStats = new Map<string, MallEntry>();
  const spammyAfterSanitize: Array<{
    keyword: string;
    clean: string;
    raw: string;
  }> = [];

  // suspicious sanitize-after patterns: 여전히 남은 스팸 시그널
  const residualSpam =
    /(\b\d{4,}\s*원\b|\b\d+%\s*할인|\b쿠폰\b|\b증정\b|\b사은품\b|\b배송비\b|\b이벤트\b|\b신상|\bnew\b|\b주문\s*폭주\b|\b오픈\s*기념|\b런칭\s*기념|택배비)/i;

  const naverFetches = HOME_FEED_SECTIONS.map(async (section) => {
    const url = new URL("https://openapi.naver.com/v1/search/shop.json");
    url.searchParams.set("query", section.keyword);
    url.searchParams.set("display", "100");
    url.searchParams.set("start", "1");
    url.searchParams.set("sort", "sim");

    const resp = await fetch(url.toString(), {
      headers: {
        "X-Naver-Client-Id": clientId,
        "X-Naver-Client-Secret": clientSecret,
      },
      cache: "no-store",
    });
    if (!resp.ok) return { keyword: section.keyword, items: [] as NaverItem[] };
    const data = (await resp.json()) as { items: NaverItem[] };
    return { keyword: section.keyword, items: data.items ?? [] };
  });

  const results = await Promise.all(naverFetches);

  for (const { keyword, items } of results) {
    for (const item of items) {
      const mall = (item.mallName || "(unknown)").trim();
      let entry = mallStats.get(mall);
      if (!entry) {
        entry = {
          count: 0,
          blocked: isBlockedMall(mall),
          boosted: isBoostedMall(mall),
          keywords: new Set(),
          sampleTitles: [],
          avgPrice: 0,
          priceSum: 0,
        };
        mallStats.set(mall, entry);
      }
      entry.count++;
      entry.keywords.add(keyword);
      const price = Number(item.lprice) || 0;
      entry.priceSum += price;
      const clean = sanitizeTitle(item.title);
      if (entry.sampleTitles.length < 3) {
        entry.sampleTitles.push(clean);
      }
      if (clean && residualSpam.test(clean) && spammyAfterSanitize.length < 60) {
        spammyAfterSanitize.push({ keyword, clean, raw: item.title });
      }
    }
  }

  for (const entry of mallStats.values()) {
    entry.avgPrice = entry.count > 0 ? Math.round(entry.priceSum / entry.count) : 0;
  }

  const all = Array.from(mallStats.entries()).map(([mall, v]) => ({
    mall,
    count: v.count,
    blocked: v.blocked,
    boosted: v.boosted,
    avgPrice: v.avgPrice,
    keywords: Array.from(v.keywords),
    sampleTitles: v.sampleTitles,
  }));
  all.sort((a, b) => b.count - a.count);

  const boosted = all.filter((m) => m.boosted);
  const blocked = all.filter((m) => m.blocked);
  const unclassified = all.filter((m) => !m.boosted && !m.blocked);

  return Response.json({
    totals: {
      keywords: results.length,
      rawItems: results.reduce((s, r) => s + r.items.length, 0),
      uniqueMalls: all.length,
      boostedMalls: boosted.length,
      blockedMalls: blocked.length,
      unclassifiedMalls: unclassified.length,
    },
    boostedMalls: boosted,
    blockedMalls: blocked,
    topUnclassified: unclassified.slice(0, 60),
    spammyAfterSanitize,
  });
}
