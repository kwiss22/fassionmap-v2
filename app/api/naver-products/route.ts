import { fetchNaverProductsPage, parseSortKey } from "@/lib/api";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query")?.trim() ?? "";

  if (!query) {
    return Response.json({
      items: [],
      total: 0,
      start: 1,
      display: 0,
      hasMore: false,
      nextStart: 1,
    });
  }

  const startParam = Number(searchParams.get("start"));
  const displayParam = Number(searchParams.get("display"));
  const sort = parseSortKey(searchParams.get("sort"));

  try {
    const page = await fetchNaverProductsPage(query, {
      start: Number.isFinite(startParam) && startParam > 0 ? startParam : 1,
      display:
        Number.isFinite(displayParam) && displayParam > 0 ? displayParam : 40,
      sort,
    });
    return Response.json(page);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch products";
    return Response.json({ error: message }, { status: 500 });
  }
}
