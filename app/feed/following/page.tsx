import { TopBar } from "@/components/layout/TopBar";
import { FeedClient } from "../FeedClient";

export const metadata = {
  title: "Following | Fashionmap",
};

export default function FeedFollowingPage() {
  return (
    <main className="min-h-[100dvh] bg-surface text-on-surface">
      <TopBar title="Following" showBack backHref="/feed" />
      <FeedClient />
    </main>
  );
}
