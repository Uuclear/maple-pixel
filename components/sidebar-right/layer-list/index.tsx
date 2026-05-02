"use client";

import { usePixelStore } from "@/lib/store/pixel-store";

export function LayerList() {
  const { layers, activeLayerId, setActiveLayer, addLayer, removeLayer, toggleLayerVisibility, toggleLayerLock } =
    usePixelStore();

  return (
    <div className="pixel-panel p-2">
      <div className="flex items-center justify-between mb-2">
        <span
          className="text-xs font-bold"
          style={{ color: "var(--accent)" }}
        >
          图层
        </span>
        <button
          className="pixel-btn px-2 py-1 text-xs"
          style={{
            background: "var(--bg-tertiary)",
            color: "var(--text-primary)",
          }}
          onClick={addLayer}
        >
          +
        </button>
      </div>

      <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
        {[...layers].reverse().map((layer) => (
          <div
            key={layer.id}
            className={`flex items-center gap-1 px-1 py-1 cursor-pointer ${
              layer.id === activeLayerId ? "pixel-border" : ""
            }`}
            style={{
              background:
                layer.id === activeLayerId
                  ? "var(--bg-tertiary)"
                  : "transparent",
            }}
            onClick={() => setActiveLayer(layer.id)}
          >
            {/* Visibility toggle */}
            <button
              className="text-xs w-4 h-4 flex items-center justify-center"
              onClick={(e) => {
                e.stopPropagation();
                toggleLayerVisibility(layer.id);
              }}
            >
              {layer.visible ? "👁" : "🚫"}
            </button>

            {/* Lock toggle */}
            <button
              className="text-xs w-4 h-4 flex items-center justify-center"
              onClick={(e) => {
                e.stopPropagation();
                toggleLayerLock(layer.id);
              }}
            >
              {layer.locked ? "🔒" : "🔓"}
            </button>

            {/* Layer name */}
            <span
              className="text-xs flex-1 truncate"
              style={{ color: "var(--text-primary)" }}
            >
              {layer.name}
            </span>

            {/* Delete button */}
            {layers.length > 1 && (
              <button
                className="text-xs w-4 h-4 flex items-center justify-center"
                style={{ color: "var(--danger)" }}
                onClick={(e) => {
                  e.stopPropagation();
                  removeLayer(layer.id);
                }}
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
