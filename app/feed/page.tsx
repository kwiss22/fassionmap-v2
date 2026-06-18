import { FeedLooksScreen } from "@/components/feed/FeedLooksScreen";

export const metadata = {
  title: "Feed | Fashionmap",
};

export default function FeedPage() {
  return (
    <main className="min-h-[100dvh] bg-surface text-on-surface">
      <FeedLooksScreen />
    </main>
  );
}
