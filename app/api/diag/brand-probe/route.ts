/**
 * DEV-ONLY: 후보 브랜드 쿼리에 대해 Naver 응답의 질을 엿본다.
 * ?brands=르메르,LEMAIRE,A.P.C. 형태로 쉼표 구분 리스트 전달 가능.
 * 없으면 하드코딩된 후보 세트를 돈다.
 * mallName 분포·평균가·샘플 타이틀을 내보낸다.
 */

type NaverItem = {
  title: string;
  lprice: string;
  mallName?: string;
};

const DEFAULT_BRANDS: readonly string[] = [
  "아크네 스튜디오",
  "르메르",
  "메종 마르지엘라",
  "토템",
  "더로우",
  "로에베",
  "보테가 베네타",
  "셀린느",
  "질샌더",
  "로로피아나",
  "브루넬로 쿠치넬리",
  "막스마라",
  "아페쎄",
  "오어슬로우",
  "아더에러",
  "준지",
  "우영미",
];

export async function GET(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return new Response("Not found", { status: 404 });
  }

  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return Response.json({ error: "missing NAVER creds" }, { status: 500 });
  }

  const url = new URL(request.url);
  const raw = url.searchParams.get("brands");
  const brands = raw
    ? raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : DEFAULT_BRANDS;

  const fetches = brands.map(async (brand) => {
    const url = new URL("https://openapi.naver.com/v1/search/shop.json");
    url.searchParams.set("query", brand);
    url.searchParams.set("display", "30");
    url.searchParams.set("start", "1");
    url.searchParams.set("sort", "sim");

    const resp = await fetch(url.toString(), {
      headers: {
        "X-Naver-Client-Id": clientId,
        "X-Naver-Client-Secret": clientSecret,
      },
      cache: "no-store",
    });
    if (!resp.ok) {
      return { brand, error: `HTTP ${resp.status}`, items: [] as NaverItem[] };
    }
    const data = (await resp.json()) as { items?: NaverItem[] };
    return { brand, items: data.items ?? [] };
  });

  const results = await Promise.all(fetches);

  const report = results.map(({ brand, items }) => {
    const mallCount = new Map<string, number>();
    let priceSum = 0;
    let priceN = 0;
    for (const item of items) {
      const mall = (item.mallName || "(unknown)").trim();
      mallCount.set(mall, (mallCount.get(mall) ?? 0) + 1);
      const price = Number(item.lprice) || 0;
      if (price > 0) {
        priceSum += price;
        priceN++;
      }
    }
    const topMalls = [...mallCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([mall, count]) => ({ mall, count }));
    const sampleTitles = items
      .slice(0, 6)
      .map((i) => i.title.replace(/<[^>]+>/g, ""));
    return {
      brand,
      itemCount: items.length,
      uniqueMalls: mallCount.size,
      avgPrice: priceN > 0 ? Math.round(priceSum / priceN) : 0,
      topMalls,
      sampleTitles,
    };
  });

  return Response.json({
    brandsProbed: brands.length,
    report,
  });
}
