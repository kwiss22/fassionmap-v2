import { fetchUnifiedProducts } from "@/lib/api";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query")?.trim() ?? "";

  if (!query) {
    return Response.json({ items: [] });
  }

  try {
    const items = await fetchUnifiedProducts(query);
    return Response.json({ items });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch products";
    return Response.json({ error: message }, { status: 500 });
  }
}
