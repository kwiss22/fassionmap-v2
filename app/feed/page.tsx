import { TopBar } from "@/components/layout/TopBar";
import { FeedClient } from "./FeedClient";

export const metadata = {
  title: "Feed | Fashionmap",
};

export default function FeedPage() {
  return (
    <main className="min-h-[100dvh] bg-surface text-on-surface">
      <TopBar title="Feed" />
      <FeedClient />
    </main>
  );
}
