import { getFeedLooks } from "@/lib/feed-looks";

export async function GET() {
  try {
    const looks = await getFeedLooks(4);
    return Response.json({ looks });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load feed looks";
    return Response.json({ error: message, looks: [] }, { status: 500 });
  }
}
