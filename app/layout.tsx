import type { Metadata } from "next";
import { DM_Sans, Playfair_Display, Rajdhani } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-playfair",
  display: "swap",
});

const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-rajdhani",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Fashionmap | AI Styling",
  description:
    "AI-curated looks and shoppable edits — tuned to your fit, vibe, and city.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`light ${dmSans.variable} ${playfair.variable} ${rajdhani.variable}`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500;600&display=swap"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                var orig = console.error;
                console.error = function () {
                  try {
                    var msg = '';
                    for (var i = 0; i < arguments.length; i++) {
                      var a = arguments[i];
                      msg += typeof a === 'string' ? a : (a && a.message) || '';
                    }
                    if (
                      (msg.indexOf('hydrat') !== -1 || msg.indexOf('server rendered HTML') !== -1) &&
                      (msg.indexOf('data-cursor-ref') !== -1 || msg.indexOf('data-cursor-view-id') !== -1)
                    ) {
                      return;
                    }
                  } catch (e) {}
                  return orig.apply(console, arguments);
                };
              })();
            `,
          }}
        />
      </head>
      <body
        className="bg-surface text-on-surface selection:bg-lime/30 selection:text-ink antialiased"
        suppressHydrationWarning
      >
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
