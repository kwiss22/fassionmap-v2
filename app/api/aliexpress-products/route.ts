import { parseSortKey } from "@/lib/api";
import { fetchAliexpressProductsPage } from "@/lib/aliexpress-api";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query")?.trim() ?? "";

  if (!query) {
    return Response.json({
      items: [],
      total: 0,
      pageNo: 1,
      pageSize: 0,
      hasMore: false,
      nextPageNo: 1,
    });
  }

  const pageNoParam = Number(searchParams.get("page_no"));
  const pageSizeParam = Number(searchParams.get("page_size"));
  const sort = parseSortKey(searchParams.get("sort"));
  const minPrice = Number(searchParams.get("min_price"));
  const maxPrice = Number(searchParams.get("max_price"));

  try {
    const page = await fetchAliexpressProductsPage(query, {
      pageNo: Number.isFinite(pageNoParam) && pageNoParam > 0 ? pageNoParam : 1,
      pageSize:
        Number.isFinite(pageSizeParam) && pageSizeParam > 0 ? pageSizeParam : 40,
      sort,
      minPrice: Number.isFinite(minPrice) && minPrice > 0 ? minPrice : undefined,
      maxPrice: Number.isFinite(maxPrice) && maxPrice > 0 ? maxPrice : undefined,
    });
    return Response.json(page);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch AliExpress products";
    return Response.json({ error: message }, { status: 500 });
  }
}
