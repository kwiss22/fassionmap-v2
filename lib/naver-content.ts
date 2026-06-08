export type NaverContentItem = {
  title: string;
  description: string;
  link: string;
  /** news | blog */
  source: "news" | "blog";
  pubDate?: string;
};

type NaverContentRawItem = {
  title?: string;
  description?: string;
  link?: string;
  originallink?: string;
  pubDate?: string;
};

type NaverContentResponse = {
  items?: NaverContentRawItem[];
};

const DISPLAY_MAX = 10;

function stripHtml(value: string): string {
  return value
    .replace(/<[^>]+>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function getCredentials(): { clientId: string; clientSecret: string } {
  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("NAVER API credentials are missing.");
  }
  return { clientId, clientSecret };
}

async function fetchNaverContentPage(
  path: "news" | "blog",
  query: string,
  display: number
): Promise<NaverContentItem[]> {
  const { clientId, clientSecret } = getCredentials();
  const endpoint = new URL(`https://openapi.naver.com/v1/search/${path}.json`);
  endpoint.searchParams.set("query", query);
  endpoint.searchParams.set("display", String(Math.min(display, DISPLAY_MAX)));
  endpoint.searchParams.set("sort", "sim");

  const response = await fetch(endpoint.toString(), {
    method: "GET",
    headers: {
      "X-Naver-Client-Id": clientId,
      "X-Naver-Client-Secret": clientSecret,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Naver ${path}: ${response.status}`);
  }

  const json = (await response.json()) as NaverContentResponse;
  const source = path === "news" ? "news" : "blog";

  const mapped: NaverContentItem[] = [];
  for (const item of json.items ?? []) {
    const link = (item.originallink || item.link || "").trim();
    const title = stripHtml(item.title ?? "");
    const description = stripHtml(item.description ?? "");
    if (!link || !title) continue;
    mapped.push({
      title,
      description,
      link,
      source,
      pubDate: item.pubDate,
    });
  }
  return mapped;
}

export async function fetchRelatedContent(
  query: string,
  options: { newsCount?: number; blogCount?: number } = {}
): Promise<NaverContentItem[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const newsCount = options.newsCount ?? 5;
  const blogCount = options.blogCount ?? 5;

  const [news, blog] = await Promise.all([
    fetchNaverContentPage("news", trimmed, newsCount).catch(() => []),
    fetchNaverContentPage("blog", trimmed, blogCount).catch(() => []),
  ]);

  const seen = new Set<string>();
  const merged: NaverContentItem[] = [];

  for (const item of [...news, ...blog]) {
    const key = item.link.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(item);
    if (merged.length >= 8) break;
  }

  return merged;
}
