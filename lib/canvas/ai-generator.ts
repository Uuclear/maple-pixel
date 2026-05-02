import type { PixelGrid } from "@/lib/canvas/image-processor";

export interface AIConfig {
  provider: "mock" | "openai" | "anthropic" | "dashscope";
  apiKey: string;
  model?: string;
}

export interface GenerationResult {
  success: boolean;
  grid?: PixelGrid;
  error?: string;
}

/**
 * Generate pixel art from text description.
 */
export async function generatePixelArt(
  prompt: string,
  width: number,
  height: number,
  config: AIConfig
): Promise<GenerationResult> {
  if (config.provider === "mock") {
    return generateMockArt(prompt, width, height);
  }

  const systemPrompt = `You are a pixel art generator. Given a description, output a JSON object with pixel art data.

Rules:
- Output ONLY valid JSON, no other text
- Use hex colors like "#RRGGBB" or "transparent"
- The grid must be exactly ${width}x${height}
- Each element in the "pixels" array is a row (array of colors)

Example output for a 4x4 red square:
{
  "width": 4,
  "height": 4,
  "pixels": [
    ["transparent", "transparent", "transparent", "transparent"],
    ["transparent", "#E83030", "#E83030", "transparent"],
    ["transparent", "#E83030", "#E83030", "transparent"],
    ["transparent", "transparent", "transparent", "transparent"]
  ]
}`;

  const userPrompt = `Create a ${width}x${height} pixel art of: ${prompt}`;

  try {
    let content: string;

    if (config.provider === "openai") {
      content = await callOpenAI(systemPrompt, userPrompt, config);
    } else if (config.provider === "anthropic") {
      content = await callAnthropic(systemPrompt, userPrompt, config);
    } else if (config.provider === "dashscope") {
      content = await callDashScope(systemPrompt, userPrompt, config);
    } else {
      return { success: false, error: "Unknown AI provider" };
    }

    const jsonStr = content.match(/\{[\s\S]*\}/)?.[0];
    if (!jsonStr) {
      return { success: false, error: "AI did not return valid JSON" };
    }

    const parsed = JSON.parse(jsonStr);
    if (!parsed.pixels || !Array.isArray(parsed.pixels)) {
      return { success: false, error: "AI returned invalid pixel data" };
    }

    const grid: PixelGrid = {
      width: parsed.width || width,
      height: parsed.height || height,
      pixels: parsed.pixels,
    };

    return { success: true, grid };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "AI generation failed",
    };
  }
}

/**
 * Mock AI generator — creates simple patterns based on keywords.
 */
function generateMockArt(
  prompt: string,
  width: number,
  height: number
): Promise<GenerationResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const p = prompt.toLowerCase();
      const pixels: string[][] = [];

      for (let y = 0; y < height; y++) {
        const row: string[] = [];
        for (let x = 0; x < width; x++) {
          if (p.includes("heart") || p.includes("love") || p.includes("心")) {
            row.push(isHeart(x, y, width, height) ? "#E83030" : "transparent");
          } else if (p.includes("star") || p.includes("星")) {
            row.push(isStar(x, y, width, height) ? "#FFD700" : "transparent");
          } else if (p.includes("mushroom") || p.includes("蘑菇")) {
            row.push(getMushroomColor(x, y, width, height));
          } else if (p.includes("tree") || p.includes("树")) {
            row.push(getTreeColor(x, y, width, height));
          } else if (p.includes("sword") || p.includes("剑")) {
            row.push(getSwordColor(x, y, width, height));
          } else if (p.includes("potion") || p.includes("药") || p.includes("瓶")) {
            row.push(getPotionColor(x, y, width, height));
          } else if (p.includes("flower") || p.includes("花")) {
            row.push(getFlowerColor(x, y, width, height));
          } else if (p.includes("slime") || p.includes("史莱姆")) {
            row.push(getSlimeColor(x, y, width, height));
          } else if (p.includes("cat") || p.includes("猫")) {
            row.push(getCatColor(x, y, width, height));
          } else if (p.includes("fish") || p.includes("鱼")) {
            row.push(getFishColor(x, y, width, height));
          } else if (p.includes("house") || p.includes("房子") || p.includes("屋")) {
            row.push(getHouseColor(x, y, width, height));
          } else {
            row.push(isCircle(x, y, width, height) ? "#3B82F6" : "transparent");
          }
        }
        pixels.push(row);
      }

      resolve({
        success: true,
        grid: { width, height, pixels },
      });
    }, 1500);
  });
}

// --- Mock pattern helpers ---

function isHeart(x: number, y: number, w: number, h: number): boolean {
  const cx = x / w - 0.5;
  const cy = y / h - 0.5;
  const s = 8 / Math.min(w, h);
  const nx = cx / s;
  const ny = cy / s;
  const a = nx * nx + (ny - Math.abs(nx) * 0.5) * (ny - Math.abs(nx) * 0.5);
  return a < 0.15 && ny > -0.2;
}

function isCircle(x: number, y: number, w: number, h: number): boolean {
  const cx = (x / w - 0.5) ** 2;
  const cy = (y / h - 0.5) ** 2;
  return cx + cy < 0.15;
}

function isStar(x: number, y: number, w: number, h: number): boolean {
  const cx = x / w - 0.5;
  const cy = y / h - 0.5;
  const angle = Math.atan2(cy, cx);
  const dist = Math.sqrt(cx * cx + cy * cy);
  const points = 5;
  const star = 0.5 + 0.5 * Math.cos(points * angle);
  return dist < star * 0.15;
}

function getMushroomColor(x: number, y: number, w: number, h: number): string {
  const mid = Math.floor(w / 2);
  const top = y < h * 0.45;
  if (top) {
    if (y < h * 0.25) return "transparent";
    const dx = Math.abs(x - mid);
    if (dx > w * 0.35) return "transparent";
    const spots: [number, number][] = [
      [mid - 2, Math.floor(h * 0.3)],
      [mid + 2, Math.floor(h * 0.35)],
      [mid, Math.floor(h * 0.25)],
    ];
    for (const [sx, sy] of spots) {
      if (Math.abs(x - sx) <= 1 && Math.abs(y - sy) <= 1) return "#FFFFFF";
    }
    return "#E83030";
  } else if (y < h * 0.65) {
    const dx = Math.abs(x - mid);
    if (dx > w * 0.15) return "transparent";
    return "#F5DEB3";
  }
  return "transparent";
}

function getTreeColor(x: number, y: number, w: number, h: number): string {
  const mid = Math.floor(w / 2);
  if (y < h * 0.6) {
    const spread = ((h * 0.6 - y) / (h * 0.6)) * w * 0.4;
    if (Math.abs(x - mid) > spread) return "transparent";
    return "#22C55E";
  } else if (y < h * 0.9) {
    if (Math.abs(x - mid) > 1) return "transparent";
    return "#8B4513";
  }
  return "transparent";
}

function getSwordColor(x: number, y: number, w: number, h: number): string {
  const mid = Math.floor(w / 2);
  const progress = y / h;
  if (progress < 0.1 || progress > 0.9) return "transparent";
  if (progress < 0.7) {
    if (Math.abs(x - mid) > 1) return "transparent";
    return "#D1D5DB";
  } else if (progress < 0.75) {
    if (Math.abs(x - mid) > 3) return "transparent";
    return "#F59E0B";
  } else {
    if (Math.abs(x - mid) > 1) return "transparent";
    return "#8B4513";
  }
}

function getPotionColor(x: number, y: number, w: number, h: number): string {
  const mid = Math.floor(w / 2);
  if (y < h * 0.15 || y > h * 0.9) return "transparent";
  const body = y > h * 0.25 && y < h * 0.85;
  const dx = Math.abs(x - mid);
  const width = body ? 3 : 1;
  if (dx > width) return "transparent";
  return y < h * 0.55 ? "#3B82F6" : "#1E40AF";
}

function getFlowerColor(x: number, y: number, w: number, h: number): string {
  const mid = Math.floor(w / 2);
  if (y < h * 0.3) {
    const petalRadius = Math.floor(w * 0.25);
    const dist = Math.sqrt((x - mid) ** 2 + (y - h * 0.15) ** 2);
    if (dist > petalRadius) return "transparent";
    return dist < 1 ? "#F59E0B" : "#FF6B6B";
  } else if (y < h * 0.9) {
    const dx = Math.abs(x - mid);
    if (dx > 1) return "transparent";
    return "#22C55E";
  }
  return "transparent";
}

function getSlimeColor(x: number, y: number, w: number, h: number): string {
  const mid = Math.floor(w / 2);
  const cy = Math.floor(h * 0.5);
  const dist = Math.sqrt(((x - mid) / (w * 0.35)) ** 2 + ((y - cy) / (h * 0.4)) ** 2);
  if (dist > 1) return "transparent";
  if ((x === mid - 2 || x === mid + 2) && y === cy - 1) return "#000000";
  return "#93C5FD";
}

function getCatColor(x: number, y: number, w: number, h: number): string {
  const mid = Math.floor(w / 2);
  // Ears
  if (y < h * 0.15) {
    if (Math.abs(x - mid) > w * 0.3 && Math.abs(x - mid) < w * 0.45) return "#F59E0B";
    return "transparent";
  }
  // Head
  if (y < h * 0.4) {
    const dx = Math.abs(x - mid);
    if (dx > w * 0.3) return "transparent";
    // Eyes
    if (y === Math.floor(h * 0.25) && (x === mid - 2 || x === mid + 2)) return "#000000";
    // Nose
    if (y === Math.floor(h * 0.3) && x === mid) return "#E83030";
    return "#F59E0B";
  }
  // Body
  if (y < h * 0.8) {
    const dx = Math.abs(x - mid);
    if (dx > w * 0.2) return "transparent";
    return "#F59E0B";
  }
  return "transparent";
}

function getFishColor(x: number, y: number, w: number, h: number): string {
  const mid = Math.floor(w / 2);
  const cy = Math.floor(h / 2);
  // Body (ellipse)
  const dist = Math.sqrt(((x - mid) / (w * 0.35)) ** 2 + ((y - cy) / (h * 0.2)) ** 2);
  if (dist > 1) return "transparent";
  // Eye
  if (x === mid + Math.floor(w * 0.2) && y === cy) return "#000000";
  return "#3B82F6";
}

function getHouseColor(x: number, y: number, w: number, h: number): string {
  const mid = Math.floor(w / 2);
  if (y < h * 0.2) {
    // Roof (triangle)
    const roofWidth = (y / (h * 0.2)) * w * 0.4;
    if (Math.abs(x - mid) > roofWidth) return "transparent";
    return "#E83030";
  } else if (y < h * 0.85) {
    // Walls
    if (Math.abs(x - mid) > w * 0.35) return "transparent";
    // Door
    if (y > h * 0.55 && Math.abs(x - mid) < 2) return "#8B4513";
    // Window
    if (y > h * 0.3 && y < h * 0.5 && Math.abs(x - mid) > 4 && Math.abs(x - mid) < 8) return "#93C5FD";
    return "#DEB887";
  }
  return "transparent";
}

// --- Real API callers ---

async function callOpenAI(
  system: string,
  user: string,
  config: AIConfig
): Promise<string> {
  const model = config.model || "gpt-4o-mini";
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI API error: ${res.status} ${err}`);
  }

  const data = await res.json();
  return data.choices[0].message.content;
}

async function callAnthropic(
  system: string,
  user: string,
  config: AIConfig
): Promise<string> {
  const model = config.model || "claude-3-5-sonnet-20241022";
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": config.apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      system,
      messages: [{ role: "user", content: user }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic API error: ${res.status} ${err}`);
  }

  const data = await res.json();
  return data.content[0].text;
}

async function callDashScope(
  system: string,
  user: string,
  config: AIConfig
): Promise<string> {
  const model = config.model || "qwen-plus";
  const res = await fetch("https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`DashScope API error: ${res.status} ${err}`);
  }

  const data = await res.json();
  return data.choices[0].message.content;
}
