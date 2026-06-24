import { FeedLooksScreen } from "@/components/feed/FeedLooksScreen";
import { getFeedLooks } from "@/lib/feed-looks";

export const metadata = {
  title: "Feed | Fashionmap",
};

export default async function FeedPage() {
  const initialLooks = await getFeedLooks(4);

  return (
    <main className="h-full bg-surface text-on-surface">
      <FeedLooksScreen initialLooks={initialLooks} />
    </main>
  );
}
