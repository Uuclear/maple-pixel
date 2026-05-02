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

export async function generatePixelArt(
  prompt: string,
  width: number,
  height: number,
  config: AIConfig
): Promise<GenerationResult> {
  if (config.provider === "mock") {
    return generateMockArt(prompt, width, height);
  }
  const systemPrompt = `You are a pixel art generator. Given a description, output ONLY valid JSON with pixel art data.

Rules:
- Output ONLY valid JSON, no other text or explanation
- Use hex colors like "#RRGGBB" or "transparent"
- The grid must be exactly ${width}x${height}
- Each element in "pixels" is a row (array of colors)`;

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
    if (!jsonStr) return { success: false, error: "AI did not return valid JSON" };
    const parsed = JSON.parse(jsonStr);
    if (!parsed.pixels || !Array.isArray(parsed.pixels)) {
      return { success: false, error: "AI returned invalid pixel data" };
    }
    return {
      success: true,
      grid: { width: parsed.width || width, height: parsed.height || height, pixels: parsed.pixels },
    };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "AI generation failed" };
  }
}

function generateMockArt(
  prompt: string,
  width: number,
  height: number
): Promise<GenerationResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const p = prompt.toLowerCase();
      const pixels: string[][] = [];
      const fn = getPatternFn(p);
      for (let y = 0; y < height; y++) {
        const row: string[] = [];
        for (let x = 0; x < width; x++) {
          row.push(fn(x, y, width, height));
        }
        pixels.push(row);
      }
      resolve({ success: true, grid: { width, height, pixels } });
    }, 1200);
  });
}

function getPatternFn(
  p: string
): (x: number, y: number, w: number, h: number) => string {
  const m = (x: number, y: number, w: number, h: number) => {
    const mid = Math.floor(w / 2);
    const dx = Math.abs(x - mid);
    if (p.includes("heart") || p.includes("love") || p.includes("心")) {
      const cx = x / w - 0.5;
      const cy = y / h - 0.5;
      const a = cx * cx + (cy - Math.abs(cx) * 0.5) ** 2;
      return a < 0.15 && cy > -0.2 ? "#E83030" : "transparent";
    }
    if (p.includes("star") || p.includes("星")) {
      const cx = x / w - 0.5;
      const cy = y / h - 0.5;
      const angle = Math.atan2(cy, cx);
      const dist = Math.sqrt(cx * cx + cy * cy);
      const star = 0.5 + 0.5 * Math.cos(5 * angle);
      return dist < star * 0.15 ? "#FFD700" : "transparent";
    }
    if (p.includes("mushroom") || p.includes("蘑菇")) {
      if (y < h * 0.45) {
        if (y < h * 0.25) return "transparent";
        if (dx > w * 0.35) return "transparent";
        const spots = [[mid - 2, Math.floor(h * 0.3)], [mid + 2, Math.floor(h * 0.35)], [mid, Math.floor(h * 0.25)]];
        for (const [sx, sy] of spots) {
          if (Math.abs(x - sx) <= 1 && Math.abs(y - sy) <= 1) return "#FFFFFF";
        }
        return "#E83030";
      } else if (y < h * 0.65) {
        return dx > w * 0.15 ? "transparent" : "#F5DEB3";
      }
      return "transparent";
    }
    if (p.includes("tree") || p.includes("树")) {
      if (y < h * 0.6) {
        const spread = ((h * 0.6 - y) / (h * 0.6)) * w * 0.4;
        return dx > spread ? "transparent" : "#22C55E";
      } else if (y < h * 0.9) {
        return dx > 1 ? "transparent" : "#8B4513";
      }
      return "transparent";
    }
    if (p.includes("sword") || p.includes("剑")) {
      const prog = y / h;
      if (prog < 0.1 || prog > 0.9) return "transparent";
      if (prog < 0.7) return dx > 1 ? "transparent" : "#D1D5DB";
      if (prog < 0.75) return dx > 3 ? "transparent" : "#F59E0B";
      return dx > 1 ? "transparent" : "#8B4513";
    }
    if (p.includes("potion") || p.includes("药") || p.includes("瓶")) {
      if (y < h * 0.15 || y > h * 0.9) return "transparent";
      const body = y > h * 0.25 && y < h * 0.85;
      return dx > (body ? 3 : 1) ? "transparent" : y < h * 0.55 ? "#3B82F6" : "#1E40AF";
    }
    if (p.includes("flower") || p.includes("花")) {
      if (y < h * 0.3) {
        const dist = Math.sqrt((x - mid) ** 2 + (y - h * 0.15) ** 2);
        if (dist > w * 0.25) return "transparent";
        return dist < 1 ? "#F59E0B" : "#FF6B6B";
      } else if (y < h * 0.9) {
        return dx > 1 ? "transparent" : "#22C55E";
      }
      return "transparent";
    }
    if (p.includes("slime") || p.includes("史莱姆")) {
      const cy2 = Math.floor(h * 0.5);
      const dist2 = Math.sqrt(((x - mid) / (w * 0.35)) ** 2 + ((y - cy2) / (h * 0.4)) ** 2);
      if (dist2 > 1) return "transparent";
      if ((x === mid - 2 || x === mid + 2) && y === cy2 - 1) return "#000000";
      return "#93C5FD";
    }
    if (p.includes("house") || p.includes("房") || p.includes("家")) {
      if (y < h * 0.35) {
        const roofW = (h * 0.35 - y) / (h * 0.35) * w * 0.5;
        return dx > roofW ? "transparent" : "#E83030";
      } else if (y < h * 0.7) {
        if (dx > w * 0.35) return "transparent";
        if (dx < 2 && y > h * 0.45) return "#8B4513";
        return "#F5DEB3";
      }
      return "transparent";
    }
    if (p.includes("cat") || p.includes("猫")) {
      if (y < h * 0.35) {
        const ear = dx > w * 0.2 && y < h * 0.15;
        const head = dx < w * 0.35 && y > h * 0.1;
        if (!ear && !head) return "transparent";
        if ((x === mid - 3 || x === mid + 3) && y === Math.floor(h * 0.2)) return "#F59E0B";
        if ((x === mid - 1 || x === mid + 1) && y === Math.floor(h * 0.2)) return "#000000";
        return "#FFA500";
      } else if (y < h * 0.75) {
        return dx > w * 0.3 ? "transparent" : "#FFA500";
      }
      return "transparent";
    }
    const dist = Math.sqrt((x / w - 0.5) ** 2 + (y / h - 0.5) ** 2);
    return dist < 0.35 ? "#3B82F6" : "transparent";
  };
  return m;
}

async function callOpenAI(system: string, user: string, config: AIConfig): Promise<string> {
  const model = config.model || "gpt-4o-mini";
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${config.apiKey}` },
    body: JSON.stringify({ model, messages: [{ role: "system", content: system }, { role: "user", content: user }], temperature: 0.7 }),
  });
  if (!res.ok) { const err = await res.text(); throw new Error(`OpenAI API error: ${res.status} ${err}`); }
  const data = await res.json();
  return data.choices[0].message.content;
}

async function callAnthropic(system: string, user: string, config: AIConfig): Promise<string> {
  const model = config.model || "claude-3-5-sonnet-20241022";
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": config.apiKey, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model, max_tokens: 4096, system, messages: [{ role: "user", content: user }] }),
  });
  if (!res.ok) { const err = await res.text(); throw new Error(`Anthropic API error: ${res.status} ${err}`); }
  const data = await res.json();
  return data.content[0].text;
}

async function callDashScope(system: string, user: string, config: AIConfig): Promise<string> {
  const model = config.model || "qwen-plus";
  const res = await fetch("https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${config.apiKey}` },
    body: JSON.stringify({ model, messages: [{ role: "system", content: system }, { role: "user", content: user }], temperature: 0.7 }),
  });
  if (!res.ok) { const err = await res.text(); throw new Error(`DashScope API error: ${res.status} ${err}`); }
  const data = await res.json();
  return data.choices[0].message.content;
}
