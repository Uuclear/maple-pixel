export const zh = {
  common: {
    title: "Pixel Studio — 像素画工坊",
    startCreating: "开始创作",
    settings: "设置",
    cancel: "取消",
    create: "创建",
    export: "导出",
    saving: "保存中...",
    exporting: "导出中...",
  },
  tools: {
    pencil: "铅笔",
    eraser: "橡皮",
    fill: "填充",
    eyedropper: "取色",
    selection: "选区",
    line: "直线",
  },
  panels: {
    resources: "资源浏览器",
    tools: "工具",
    palette: "调色板",
    layers: "图层",
    brush: "笔刷",
    brushSize: "大小",
  },
  resources: {
    items: "物品",
    mobs: "怪物",
    npcs: "NPC",
    maps: "地图",
    search: "搜索资源...",
    placeholder: "连接 maplestory.io API 后显示资源",
  },
  canvas: {
    newCanvas: "新建画布",
    presetSize: "预设尺寸",
    width: "宽",
    height: "高",
  },
  timeline: {
    copy: "复制",
    delete: "删除",
    loop: "循环",
  },
  settings: {
    title: "设置",
    language: "语言",
    theme: "主题",
    gridSize: "网格大小",
    shortcuts: "快捷键",
  },
} as const;

export type ZhType = typeof zh;
