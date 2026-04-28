import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Playfair Display — 시안의 이탤릭 세리프 핵심 자산.
// 400(regular)/500(medium)/700(bold)을 normal+italic 둘 다 로드.
const playfair = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Fashionmap | Global Edit",
  description:
    "파페치·네타포르테·W컨셉을 가로질러 에디터와 AI가 함께 고른 시즌별 글로벌 에디트.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`light ${inter.variable} ${playfair.variable}`}>
      <head>
        {/* Pretendard (한글 본문) — CDN 서브셋. next/font에 한글 웹폰트가
            Inter처럼 제공되지 않아 CDN 링크로 통합. rsms gstatic 대체용. */}
        <link
          rel="stylesheet"
          as="style"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
        {/* Cursor MCP 브라우저 확장이 `data-cursor-ref`를 DOM에 주입해 React
            하이드레이션 불일치 경고를 띄우는 문제 완화.
            - 확장 ref 시스템은 그대로 살려둬야 하므로 DOM은 건드리지 않음.
            - 대신 React의 dev 전용 console.error 중 "hydrat"+"data-cursor-ref"
              메시지만 걸러 Next dev 오버레이의 오탐 "Issue" 배지를 막는다.
            - 프로덕션에선 확장 자체가 없어 이 분기가 호출되지 않음. */}
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
        className="bg-surface text-on-surface selection:bg-primary-container selection:text-on-primary-container antialiased"
        suppressHydrationWarning
      >
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
