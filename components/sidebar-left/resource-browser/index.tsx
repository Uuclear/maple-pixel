"use client";

import { useState, useEffect } from "react";

const API_BASE = "https://maplestory.io/api/gms/latest";

interface ResourceItem {
  id: number;
  name: string;
  iconUrl: string;
}

const CATEGORIES = [
  { id: "items", label: "物品", icon: "📦" },
  { id: "mobs", label: "怪物", icon: "👾" },
  { id: "npcs", label: "NPC", icon: "🧑" },
  { id: "maps", label: "地图", icon: "🗺️" },
];

export function ResourceBrowser() {
  const [activeCategory, setActiveCategory] = useState("items");
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      setError(null);
      try {
        let items: ResourceItem[] = [];
        const resp = await fetch(`${API_BASE}/${activeCategory}?limit=12`);
        if (!resp.ok) throw new Error(`API ${resp.status}`);
        const data = await resp.json();
        if (Array.isArray(data)) {
          items = data.map((item: any) => ({
            id: item.id,
            name: item.name || `#${item.id}`,
            iconUrl: `${API_BASE}/${activeCategory === "items" ? "item" : activeCategory === "mobs" ? "mob" : activeCategory === "npcs" ? "npc" : "map"}/${item.id}/icon`,
          }));
        }
        if (items.length === 0) {
          items = getFallbackData(activeCategory);
        }
        setResources(items);
      } catch {
        const fallback = getFallbackData(activeCategory);
        if (fallback.length > 0) {
          setResources(fallback);
          setError("使用离线数据");
        } else {
          setError("加载失败");
          setResources([]);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchResources();
  }, [activeCategory]);

  const filtered = resources.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    String(r.id).includes(search)
  );

  return (
    <div className="h-full flex flex-col">
      <div className="p-2 text-xs font-bold" style={{ borderBottom: "2px solid var(--border-color)", color: "var(--accent)" }}>
        资源浏览器
      </div>

      {/* Category tabs */}
      <div className="flex gap-1 p-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            className={`pixel-btn px-2 py-1 text-xs ${activeCategory === cat.id ? "active" : ""}`}
            style={{
              background: activeCategory === cat.id ? "var(--accent)" : "var(--bg-tertiary)",
              color: activeCategory === cat.id ? "var(--bg-primary)" : "var(--text-primary)",
            }}
            onClick={() => { setActiveCategory(cat.id); setSearch(""); }}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* Search bar */}
      <div className="px-2 pb-2">
        <input
          type="text"
          placeholder="搜索资源..."
          className="w-full px-2 py-1 text-xs"
          style={{
            background: "var(--bg-primary)",
            border: "2px solid var(--border-color)",
            color: "var(--text-primary)",
            outline: "none",
          }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xs" style={{ color: "var(--accent)" }}>加载中...</p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="px-2">
          <p className="text-xs" style={{ color: "var(--danger)" }}>⚠️ {error}</p>
        </div>
      )}

      {/* Resource grid */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        <div className="grid grid-cols-3 gap-1">
          {filtered.map((item) => (
            <ResourceCard key={item.id} item={item} />
          ))}
        </div>
        {filtered.length === 0 && !loading && (
          <div className="flex items-center justify-center py-8">
            <p className="text-xs text-center" style={{ color: "var(--text-secondary)" }}>
              无匹配结果
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ResourceCard({ item }: { item: ResourceItem }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className="flex flex-col items-center p-1 cursor-pointer pixel-border hover:opacity-80 transition-opacity"
      title={`${item.name} (#${item.id})`}
    >
      <div className="w-12 h-12 flex items-center justify-center" style={{ background: "#1a1a1a" }}>
        {imgError ? (
          <span className="text-lg">❓</span>
        ) : (
          <img
            src={item.iconUrl}
            alt={item.name}
            className="max-w-full max-h-full"
            style={{ imageRendering: "pixelated" }}
            onError={() => setImgError(true)}
          />
        )}
      </div>
      <span
        className="text-xs mt-1 truncate w-full text-center"
        style={{ color: "var(--text-secondary)" }}
        title={item.name}
      >
        #{item.id}
      </span>
    </div>
  );
}

function getFallbackData(category: string): ResourceItem[] {
  const data: Record<string, ResourceItem[]> = {
    items: [
      { id: 2000000, name: "红色药水", iconUrl: `${API_BASE}/item/2000000/icon` },
      { id: 2000001, name: "蓝色药水", iconUrl: `${API_BASE}/item/2000001/icon` },
      { id: 2000002, name: "白色药水", iconUrl: `${API_BASE}/item/2000002/icon` },
      { id: 2000003, name: "特殊药水", iconUrl: `${API_BASE}/item/2000003/icon` },
      { id: 2000004, name: "HP 药水", iconUrl: `${API_BASE}/item/2000004/icon` },
      { id: 2000005, name: "MP 药水", iconUrl: `${API_BASE}/item/2000005/icon` },
      { id: 2022000, name: "力量药水", iconUrl: `${API_BASE}/item/2022000/icon` },
      { id: 2022001, name: "敏捷药水", iconUrl: `${API_BASE}/item/2022001/icon` },
      { id: 1002000, name: "布帽", iconUrl: `${API_BASE}/item/1002000/icon` },
    ],
    mobs: [
      { id: 100100, name: "蜗牛", iconUrl: `${API_BASE}/mob/100100/icon` },
      { id: 100101, name: "绿水灵", iconUrl: `${API_BASE}/mob/100101/icon` },
      { id: 1110100, name: "蘑菇仔", iconUrl: `${API_BASE}/mob/1110100/icon` },
      { id: 2220000, name: "花蘑菇", iconUrl: `${API_BASE}/mob/2220000/icon` },
      { id: 3220000, name: "树妖", iconUrl: `${API_BASE}/mob/3220000/icon` },
      { id: 4220000, name: "木妖", iconUrl: `${API_BASE}/mob/4220000/icon` },
      { id: 5220000, name: "石块蟹", iconUrl: `${API_BASE}/mob/5220000/icon` },
      { id: 6220000, name: "蓝蘑菇", iconUrl: `${API_BASE}/mob/6220000/icon` },
      { id: 7220000, name: "橙蘑菇", iconUrl: `${API_BASE}/mob/7220000/icon` },
    ],
    npcs: [
      { id: 9000000, name: "冒险家", iconUrl: `${API_BASE}/npc/9000000/icon` },
      { id: 9010000, name: "战士教官", iconUrl: `${API_BASE}/npc/9010000/icon` },
      { id: 9020000, name: "魔法师教官", iconUrl: `${API_BASE}/npc/9020000/icon` },
      { id: 9030000, name: "弓箭手教官", iconUrl: `${API_BASE}/npc/9030000/icon` },
      { id: 9040000, name: "飞侠教官", iconUrl: `${API_BASE}/npc/9040000/icon` },
      { id: 2000, name: "希纳斯", iconUrl: `${API_BASE}/npc/2000/icon` },
      { id: 2001, name: "奥尔卡", iconUrl: `${API_BASE}/npc/2001/icon` },
      { id: 2002, name: "伊莉娜", iconUrl: `${API_BASE}/npc/2002/icon` },
      { id: 2003, name: "麦勒蒂", iconUrl: `${API_BASE}/npc/2003/icon` },
    ],
    maps: [
      { id: 100000000, name: "射手村", iconUrl: `${API_BASE}/map/100000000/icon` },
      { id: 101000000, name: "勇士部落", iconUrl: `${API_BASE}/map/101000000/icon` },
      { id: 102000000, name: "魔法密林", iconUrl: `${API_BASE}/map/102000000/icon` },
      { id: 103000000, name: "废弃都市", iconUrl: `${API_BASE}/map/103000000/icon` },
      { id: 104000000, name: "玩具城", iconUrl: `${API_BASE}/map/104000000/icon` },
      { id: 105000000, name: "水世界", iconUrl: `${API_BASE}/map/105000000/icon` },
      { id: 106000000, name: "神木村", iconUrl: `${API_BASE}/map/106000000/icon` },
      { id: 107000000, name: "百草堂", iconUrl: `${API_BASE}/map/107000000/icon` },
      { id: 108000000, name: "金银岛", iconUrl: `${API_BASE}/map/108000000/icon` },
    ],
  };
  return data[category] || [];
}
