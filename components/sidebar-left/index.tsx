import { ResourceBrowser } from "./resource-browser";

export function SidebarLeft() {
  return (
    <aside
      className="w-60 shrink-0 overflow-y-auto"
      style={{
        background: "var(--bg-secondary)",
        borderRight: "2px solid var(--border-color)",
      }}
    >
      <ResourceBrowser />
    </aside>
  );
}
