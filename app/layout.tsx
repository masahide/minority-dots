import type { Metadata } from "next";
import "./globals.css";
import "./intro.css";

export const metadata: Metadata = {
  title: "dots 少数派ゲーム",
  description: "2026年10月8日のCodex Community Meetup – Tokyo: DevDay Recap & Workshopのワークショップをきっかけに制作。アイデアをdotsに伝え、実装・公開とゲーム司会を任せたQR参加型の少数派ゲーム。#DevDayCommunity",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">{children}</body>
    </html>
  );
}
