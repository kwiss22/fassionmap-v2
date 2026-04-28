import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { BrandPicker } from "@/components/feed/BrandPicker";

export const metadata = {
  title: "Discover · Feed | Fashionmap",
};

export default function DiscoverPage() {
  return (
    <main className="min-h-[100dvh] bg-surface text-on-surface">
      <TopBar title="Discover" backHref="/feed" showStatusStrip={false} />
      <section className="px-5 pb-2 pt-6">
        <p className="eyebrow">DISCOVER BRANDS</p>
        <h2 className="editorial-display mt-2 text-[30px] italic">
          Follow to tailor.
        </h2>
        <p className="mt-2 text-[13px] text-on-surface-variant">
          팔로우를 추가하거나 해제해 피드를 내 취향에 맞춰보세요.
        </p>
      </section>
      <BrandPicker />
      <div className="px-5 pb-10">
        <Link
          href="/feed"
          className="block w-full rounded-full border border-primary bg-primary px-6 py-3 text-center text-[12px] uppercase tracking-[0.22em] text-on-primary"
        >
          Done · Back to feed
        </Link>
      </div>
    </main>
  );
}
