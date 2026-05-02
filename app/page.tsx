import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center" style={{
      background: "var(--bg-primary)",
    }}>
      <div className="text-center pixel-panel p-12">
        <h1
          className="text-3xl font-bold mb-4"
          style={{ color: "var(--accent)" }}
        >
          Pixel Studio
        </h1>
        <p className="mb-8" style={{ color: "var(--text-secondary)" }}>
          像素画工坊 — MapleStory 风格创作工具
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/canvas"
            className="pixel-btn px-6 py-3 font-bold"
            style={{
              background: "var(--accent)",
              color: "var(--bg-primary)",
            }}
          >
            开始创作
          </Link>
          <Link
            href="/settings"
            className="pixel-btn px-6 py-3 font-bold"
            style={{
              background: "var(--bg-tertiary)",
              color: "var(--text-primary)",
            }}
          >
            设置
          </Link>
        </div>
      </div>
    </main>
  );
}
