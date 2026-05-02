# 像素画生成软件 — 设计文档

> 灵感来源：MapleStory（冒险岛）像素风格
> 日期：2026-05-02

---

## 1. 项目概述

一个受冒险岛像素风格启发的像素画创作工具，支持：
- 浏览和导入 maplestory.io 冒险岛资源（物品、怪物、NPC、地图图标等）
- Canvas 像素画绘制（画笔、橡皮、填充、取色、选区等工具）
- 多图层编辑
- 帧动画时间轴
- 导出 PNG / GIF / Sprite Sheet
- 中英双语界面
- 冒险岛复古像素风主题

---

## 2. 技术架构

```
┌─────────────────────────────────────────────┐
│              Next.js App Router              │
│                                              │
│  ┌───────────┐  ┌────────────┐  ┌─────────┐  │
│  │ 资源浏览器 │  │  像素画布   │  │ 工具面板 │  │
│  │ (左侧)     │  │  (中心)    │  │ (右侧)   │  │
│  └───────────┘  └────────────┘  └─────────┘  │
│  ┌─────────────────────────────────────────┐  │
│  │         底部时间轴 / 状态栏              │  │
│  └─────────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
         │                           │
         ▼                           ▼
  ┌──────────────┐          ┌─────────────────┐
  │ API Routes   │◄────────►│ maplestory.io   │
  │ (缓存层)      │          │ 外部 API         │
  └──────────────┘          └─────────────────┘
         │
         ▼
  ┌──────────────┐
  │ LocalStorage  │
  │ / IndexedDB  │
  └──────────────┘
```

### 技术栈

| 层 | 技术 | 说明 |
|----|------|------|
| 框架 | Next.js 15 (App Router) | SSR + API Routes |
| 语言 | TypeScript | 类型安全 |
| 渲染 | HTML Canvas 2D | 像素画高性能渲染 |
| 状态管理 | Zustand | 轻量状态管理 |
| 数据获取 | SWR | 资源列表缓存+刷新 |
| 样式 | Tailwind CSS + CSS Variables | 冒险岛像素风主题 |
| 国际化 | next-intl | 中英文切换 |
| 动画导出 | gifenc | GIF 导出 |
| 图标 | 自定义 SVG (像素风) | 工具图标 |

---

## 3. 核心模块设计

### 3.1 Canvas 引擎 (`/lib/canvas/`)

```
lib/canvas/
├── engine.ts        # 主引擎：画布初始化、缩放、平移
├── renderer.ts      # 渲染管线：按图层顺序合成到 Canvas
├── tools/
│   ├── pencil.ts    # 铅笔工具
│   ├── eraser.ts    # 橡皮擦
│   ├── fill.ts      # 油漆桶（Flood Fill）
│   ├── eyedropper.ts# 取色器
│   ├── selection.ts # 矩形选区
│   └── line.ts      # 直线绘制 (Bresenham)
├── history.ts       # 撤销/重做 (Command Pattern)
├── grid.ts          # 网格叠加层
└── export.ts        # 导出：PNG / Sprite Sheet / GIF
```

#### 引擎核心接口

```typescript
interface PixelCanvas {
  width: number;        // 画布宽 (px)，基于 grid 尺寸
  height: number;       // 画布高 (px)
  gridSize: number;     // 网格大小 (如 64)
  pixelSize: number;    // 每个像素的渲染大小 (动态计算)
  layers: Layer[];      // 图层列表
  activeLayerId: string;
  tool: Tool;           // 当前工具
  zoom: number;         // 缩放倍数
  pan: { x: number; y: number };
  frames: Frame[];      // 帧动画
  activeFrame: number;
}

interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;      // 0~1
  pixels: Map<string, string>; // "x,y" -> "#RRGGBBAA"
}

interface Frame {
  id: string;
  name: string;
  layers: Map<string, Map<string, string>>; // layerId -> pixels
  duration: number;     // 毫秒
}
```

### 3.2 资源浏览器 (`/components/resource-browser/`)

```
components/resource-browser/
├── index.tsx          # 主面板
├── category-tabs.tsx  # 分类：Item / Mob / NPC / Map / GuildMark
├── search-bar.tsx     # 搜索 + 过滤
├── resource-grid.tsx  # 图标网格 (虚拟滚动)
├── resource-card.tsx  # 单个资源卡片
└── detail-modal.tsx   # 资源详情弹窗 (含帧动画预览)
```

#### 资源数据流

```
maplestory.io API
      │
      ▼
  Next.js API Routes (缓存)
      │
      ├── GET /api/resources/items?page=1&limit=50
      ├── GET /api/resources/items/{id}/icon
      ├── GET /api/resources/mobs?page=1&limit=50
      ├── GET /api/resources/mobs/{id}/render/animated/{animation}
      └── ...
      │
      ▼
  SWR Cache (前端)
      │
      ▼
  ResourceGrid (虚拟滚动渲染)
```

#### 冒险岛资源尺寸对照表

| 资源类型 | 典型宽 x 高 (px) | 备注 |
|---------|-----------------|------|
| Item Icon | 32x32 ~ 64x64 | 最常见 32x32 |
| Mob Frame | 64x64 ~ 128x128 | 各帧大小可能不同 |
| NPC Frame | 64x64 ~ 128x128 | 静态或动画 |
| Map Tile | 32x32 ~ 256x256 | 背景/前景层 |
| Map Mark | 32x32 | 地图标记 |
| Character | 100x100 ~ 200x200 | 全身角色 |
| Guild Mark | 16x16 ~ 64x64 | 公会徽章 |

### 3.3 工具面板 (`/components/tool-panel/`)

```
components/tool-panel/
├── index.tsx          # 主面板
├── tool-buttons.tsx   # 工具选择按钮
├── color-picker.tsx   # 调色板 (冒险岛经典色系)
├── layer-list.tsx     # 图层管理
│   ├── layer-item.tsx # 单个图层行
│   └── layer-controls.tsx # 显示/锁定/透明度
└── brush-settings.tsx # 笔刷大小设置
```

#### 调色板 — 冒险岛经典色

预设色板包含冒险岛经典配色：
- 红色系：`#E83030`, `#C41E3A`, `#FF6B6B`
- 蓝色系：`#3B82F6`, `#1E40AF`, `#93C5FD`
- 绿色系：`#22C55E`, `#16A34A`, `#86EFAC`
- 金色系：`#F59E0B`, `#D97706`, `#FDE68A`
- 棕色系：`#8B4513`, `#A0522D`, `#DEB887`
- 灰色系：`#6B7280`, `#9CA3AF`, `#D1D5DB`
- 黑白色：`#000000`, `#FFFFFF`
- 透明网格背景：棋盘格

### 3.4 时间轴 (`/components/timeline/`)

```
components/timeline/
├── index.tsx          # 主时间轴
├── frame-strip.tsx    # 帧缩略图条
├── frame-thumb.tsx    # 单帧缩略图
├── playback-controls.tsx # 播放/暂停/循环
└── onion-skin.tsx     # 洋葱皮控制
```

#### 帧动画设计

```
┌─ Timeline ────────────────────────────────────┐
│  [◀◀] [▶] [▶▶]   FPS: [12 ▼]  Loop: [☑]     │
│                                               │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐  │
│  │ F1 │ │ F2 │ │ F3 │ │ F4 │ │ F5 │ │ +  │  │
│  │100ms│ │100ms│ │100ms│ │100ms│ │100ms│     │
│  └────┘ └────┘ └────┘ └────┘ └────┘ └────┘  │
│                                               │
│  Onion Skin: [☑]  Previous: [1]  Next: [1]   │
└───────────────────────────────────────────────┘
```

- 默认帧率：12 FPS (匹配冒险岛 sprite 动画速率)
- 洋葱皮：显示前后 N 帧的半透明预览
- 支持复制帧、删除帧、调整帧时长

### 3.5 导出模块 (`/lib/export/`)

| 导出格式 | 实现 | 说明 |
|---------|------|------|
| PNG | `canvas.toDataURL('image/png')` | 单帧/全部帧 |
| GIF | gifenc 编码 | 帧动画导出 |
| Sprite Sheet | Canvas 合成大图 | 所有帧拼成一行/一列 |
| JSON | 图层+像素数据序列化 | 保存工程，后续可导入 |

### 3.6 i18n 国际化

```
i18n/
├── zh.json              # 中文
└── en.json              # 英文
```

覆盖区域：
- 工具名称（铅笔、橡皮、填充...）
- 面板标题（图层、颜色、时间轴...）
- 操作提示（撤销、重做、导出...）
- 资源分类（物品、怪物、NPC、地图...）
- 菜单/按钮文案

---

## 4. 页面路由设计

```
/                          # 主页 → 新建/打开项目
/canvas                    # 像素画画布 (主工作区)
/import                    # 导入图片/冒险岛资源
/settings                  # 设置 (主题、语言、快捷键)
```

### 布局结构 (`/canvas` 页)

```
┌─ Header (48px) ──────────────────────────────────────────┐
│ [Logo] Pixel Studio  │  新建  打开  保存  导出  │  [中/EN]│
├──────────────────────────────────────────────────────────┤
│ ┌─ Sidebar L ──┐ ┌──── Canvas ────┐ ┌─ Sidebar R ──┐    │
│ │              │ │                │ │              │    │
│ │ 资源浏览器    │ │   像素画布      │ │ 工具面板      │    │
│ │ (240px)      │ │   (自适应)      │ │ (220px)      │    │
│ │ • 分类tab     │ │   + 网格线      │ │ • 工具按钮    │    │
│ │ • 搜索       │ │   + 洋葱皮      │ │ • 调色板      │    │
│ │ • 图标网格    │ │                │ │ • 图层列表    │    │
│ │              │ │                │ │ • 笔刷设置    │    │
│ │              │ └────────────────┘ │              │    │
│ └──────────────┘ └──────────────────┘ └──────────────┘    │
│ ┌─ Timeline (120px) ────────────────────────────────────┐│
│ │  [◀◀ ▶ ▶▶]  FPS:12  [F1][F2][F3][F4][F5][+]  │ 状态  ││
│ └──────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────┘
```

---

## 5. 主题系统设计

### 冒险岛复古像素风

使用 CSS Variables 定义主题，通过 data-theme 属性切换：

```css
:root, [data-theme="maple"] {
  --bg-primary: #2C1810;      /* 深棕色背景 */
  --bg-secondary: #4A2C1A;    /* 中棕色面板 */
  --bg-tertiary: #6B3A2A;     /* 浅棕色控件 */
  --border-color: #8B5E3C;    /* 像素风边框 */
  --text-primary: #F5DEB3;    /* 小麦色文字 */
  --text-secondary: #D2B48C;  /* 浅棕辅助文字 */
  --accent: #FFD700;          /* 金色高亮 */
  --accent-hover: #FFA500;    /* 悬停橙 */
  --danger: #E83030;          /* 红色 */
  --success: #22C55E;         /* 绿色 */
  --pixel-shadow: 4px 4px 0px #1A0F08;  /* 像素风阴影 */
}
```

### 像素风 UI 元素
- 直角边框（0 border-radius）
- 4px 像素阴影（box-shadow: 4px 4px 0px）
- 棋盘格透明背景
- 像素字体（Press Start 2P / 自定义）

---

## 6. 数据流

### 6.1 状态管理 (Zustand Store)

```typescript
interface PixelStore {
  // 画布
  canvas: CanvasConfig;
  setCanvasSize: (w: number, h: number) => void;

  // 图层
  layers: Layer[];
  activeLayerId: string | null;
  addLayer: () => void;
  removeLayer: (id: string) => void;
  toggleLayer: (id: string) => void;
  setActiveLayer: (id: string) => void;

  // 像素
  setPixel: (x: number, y: number, color: string) => void;
  clearPixel: (x: number, y: number) => void;
  floodFill: (x: number, y: number, color: string) => void;

  // 工具
  currentTool: ToolType;
  setCurrentTool: (tool: ToolType) => void;
  brushSize: number;
  setBrushSize: (size: number) => void;

  // 颜色
  currentColor: string;
  setColor: (color: string) => void;
  palette: string[];

  // 帧
  frames: Frame[];
  activeFrameIndex: number;
  addFrame: () => void;
  deleteFrame: (index: number) => void;
  duplicateFrame: (index: number) => void;

  // 播放
  isPlaying: boolean;
  fps: number;
  togglePlayback: () => void;
  setFps: (fps: number) => void;

  // 历史
  undo: () => void;
  redo: () => void;

  // 视图
  zoom: number;
  pan: { x: number; y: number };
  showGrid: boolean;
  onionSkin: { enabled: boolean; prev: number; next: number };
}
```

### 6.2 资源数据流

```
用户浏览资源 → SWR 请求 → API Route → 外部 API + 本地缓存 → 渲染图标网格
用户拖拽导入 → Canvas 自动缩放适配 → 新建图层 → 像素数据写入 Store
```

### 6.3 撤销/重做

使用 Command Pattern：
```typescript
interface Command {
  execute(): void;
  undo(): void;
}

class SetPixelCommand implements Command {
  constructor(
    private x: number,
    private y: number,
    private newColor: string,
    private oldColor: string | undefined,
    private layerId: string,
    private store: PixelStore
  ) {}
  execute() { /* 设置像素 */ }
  undo() { /* 恢复原色或清除 */ }
}
```

历史记录栈最大 50 条，支持 Ctrl+Z / Ctrl+Y。

---

## 7. API Routes 设计

| 路由 | 方法 | 说明 |
|------|------|------|
| `/api/resources/items` | GET | 获取物品列表 (缓存) |
| `/api/resources/items/[id]` | GET | 获取物品详情 |
| `/api/resources/items/[id]/icon` | GET | 获取物品图标 (代理) |
| `/api/resources/mobs` | GET | 获取怪物列表 |
| `/api/resources/mobs/[id]/animated/[anim]` | GET | 获取怪物动画 (代理) |
| `/api/resources/npcs` | GET | 获取 NPC 列表 |
| `/api/resources/maps` | GET | 获取地图列表 |
| `/api/export/png` | POST | 导出 PNG |
| `/api/export/gif` | POST | 导出 GIF |

缓存策略：
- 图标缓存：7 天 (maplestory.io 本身有 1 天 CDN 缓存)
- 列表缓存：1 小时
- 使用 `revalidate` 参数控制 SWR 刷新

---

## 8. 性能考虑

| 场景 | 方案 |
|------|------|
| 大画布渲染 | OffscreenCanvas + Web Worker |
| 资源列表 | 虚拟滚动 (仅渲染可视区域) |
| 帧动画预览 | requestAnimationFrame 定时器 |
| 撤销历史 | 增量 diff 存储，非全量快照 |
| 图片导出 | Web Worker 后台编码 |

---

## 9. 文件结构

```
/Users/slouch/Documents/pixel/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                  # 首页
│   ├── canvas/page.tsx           # 画布页
│   ├── settings/page.tsx         # 设置页
│   ├── api/
│   │   └── resources/
│   │       ├── items/route.ts
│   │       ├── items/[id]/route.ts
│   │       ├── mobs/route.ts
│   │       └── ...
│   └── i18n/
│       ├── request.ts
│       └── routing.ts
├── components/
│   ├── header/
│   │   └── index.tsx
│   ├── sidebar-left/
│   │   └── index.tsx
│   │   └── resource-browser/
│   ├── sidebar-right/
│   │   └── index.tsx
│   │   └── tool-panel/
│   │   └── layer-list/
│   │   └── color-picker/
│   ├── canvas/
│   │   ├── index.tsx
│   │   └── pixel-canvas.tsx
│   ├── timeline/
│   │   └── index.tsx
│   │   └── frame-strip.tsx
│   │   └── playback-controls.tsx
│   └── modals/
│       └── export-modal.tsx
│       └── new-canvas-modal.tsx
├── lib/
│   ├── canvas/
│   │   ├── engine.ts
│   │   ├── renderer.ts
│   │   ├── tools/
│   │   ├── history.ts
│   │   └── export.ts
│   ├── store/
│   │   └── pixel-store.ts
│   ├── i18n/
│   │   ├── zh.ts
│   │   └── en.ts
│   └── theme/
│       └── maple.css
├── public/
│   └── fonts/
│       └── press-start-2p.woff2
├── docs/superpowers/specs/
│   └── 2026-05-02-pixel-art-generator-design.md
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## 10. 阶段规划

### Phase 1: 核心画布 (MVP)
- Canvas 渲染引擎
- 铅笔、橡皮、填充、取色工具
- 网格叠加
- PNG 导出
- 撤销/重做

### Phase 2: 图层 + 帧动画
- 多图层管理
- 帧动画时间轴
- 洋葱皮预览
- GIF 导出
- Sprite Sheet 导出

### Phase 3: 资源浏览器
- 连接 maplestory.io API
- 分类浏览 (Item/Mob/NPC/Map)
- 搜索过滤
- 拖拽导入画布
- 资源详情 (含动画预览)

### Phase 4: 打磨
- 中英双语 (i18n)
- 冒险岛主题完善
- 键盘快捷键
- 项目保存/加载 (IndexedDB)
- 响应式布局
