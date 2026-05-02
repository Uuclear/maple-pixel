import { ToolPanel } from "./tool-panel";
import { ColorPicker } from "./color-picker";
import { LayerList } from "./layer-list";
import { BrushSettings } from "./brush-settings";

export function SidebarRight() {
  return (
    <aside
      className="w-56 shrink-0 overflow-y-auto flex flex-col gap-2 p-2"
      style={{
        background: "var(--bg-secondary)",
        borderLeft: "2px solid var(--border-color)",
      }}
    >
      <ToolPanel />
      <BrushSettings />
      <ColorPicker />
      <LayerList />
    </aside>
  );
}
