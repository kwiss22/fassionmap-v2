import { TrendMapScreen } from "@/components/atlas/TrendMapScreen";

export const metadata = {
  title: "Atlas · Trend Map | Fashionmap",
  description: "Live global fashion signals — tap a city to explore its edit.",
};

export default function AtlasPreviewPage() {
  return (
    <main className="theme-dark min-h-[100dvh]">
      <TrendMapScreen />
    </main>
  );
}
