import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pixel Studio — 像素画工坊",
  description: "A MapleStory-inspired pixel art editor",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" data-theme="maple">
      <body className="antialiased">{children}</body>
    </html>
  );
}
