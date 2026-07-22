"use client";

export default function GameSidebar({ selected, onSelect, categories }: { selected: string; onSelect: (id: string) => void; categories: {id: string; label: string; count: number}[] }) {

  const iconMap: Record<string, string> = {
    "": "/icons/home.png",
    "SLOT": "/icons/slot.png",
    "EGAMES": "/icons/slot.png",
    "LIVECASINO": "/icons/casino.png",
    "LIVE": "/icons/casino.png",
    "SPORT": "/icons/sport.png",
    "FISHING": "/icons/fishing.png",
    "FISH": "/icons/fishing.png",
    "CARD": "/icons/card.png",
    "TABLE": "/icons/card.png",
    "LOTTO": "/icons/lotto.png",
    "KENO": "/icons/lotto.png",
    "ESPORT": "/icons/esport.png",
    "TRADING": "/icons/trading.png",
  };

  const colors: Record<string, string> = {
    "": "#dc2626",
    "SLOT": "#f59e0b",
    "EGAMES": "#f59e0b",
    "LIVECASINO": "#10b981",
    "LIVE": "#10b981",
    "SPORT": "#3b82f6",
    "FISHING": "#8b5cf6",
    "FISH": "#8b5cf6",
    "CARD": "#ec4899",
    "TABLE": "#ec4899",
    "LOTTO": "#f97316",
    "KENO": "#f97316",
    "ESPORT": "#06b6d4",
    "TRADING": "#eab308",
  };

  const allItems = [{ id: "", label: "หน้าแรก", count: 0 }, ...categories];

  return (
    <>
      {/* คอม: แนวตั้งด้านซ้าย */}
      <div className="sidebar-desktop" style={{ display: "flex", flexDirection: "column", gap: "6px", width: "68px", flexShrink: 0, paddingTop: "4px", position: "sticky", top: "12px", maxHeight: "100vh" }}>
        {allItems.map((cat) => {
          const isActive = selected === cat.id;
          const color = colors[cat.id] || "#64748b";
          const icon = iconMap[cat.id];
          return (
            <button key={cat.id} onClick={() => onSelect(cat.id)} style={{
              width: "60px", minHeight: "60px", borderRadius: "12px", border: "none", cursor: "pointer",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "3px",
              padding: "6px 2px", transition: "all 0.2s",
              background: isActive ? `linear-gradient(135deg, ${color}, ${color}dd)` : "rgba(255,255,255,0.06)",
              boxShadow: isActive ? `0 4px 12px ${color}40` : "0 2px 4px rgba(0,0,0,0.2)",
            }}>
              <div style={{
                width: "28px", height: "28px", borderRadius: "8px",
                display: "flex", alignItems: "center", justifyContent: "center",
                overflow: "hidden",
              }}>
                {icon ? (
                  <img src={icon} alt={cat.label} style={{
                    width: "24px", height: "24px", objectFit: "contain",
                    filter: isActive ? "brightness(1.2)" : "brightness(0.7)",
                    transition: "filter 0.2s",
                  }} />
                ) : (
                  <span style={{
                    fontSize: "0.85rem", fontWeight: 800,
                    color: isActive ? "white" : color,
                  }}>{cat.label.charAt(0)}</span>
                )}
              </div>
              <span style={{
                fontSize: "0.5rem", fontWeight: 700, lineHeight: 1.2,
                color: isActive ? "white" : "#94a3b8", textAlign: "center",
              }}>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* มือถือ: grid 4 คอลัมน์ เหมือน ODIN996 */}
      <div className="sidebar-mobile" style={{ display: "none", gap: "10px", padding: "10px 12px", flexWrap: "wrap", justifyContent: "center", width: "100%" }}>
        {allItems.map((cat) => {
          const isActive = selected === cat.id;
          const color = colors[cat.id] || "#64748b";
          const icon = iconMap[cat.id];
          return (
            <button key={`m-${cat.id}`} onClick={() => onSelect(cat.id)} style={{
              width: "calc(25% - 8px)", height: "70px", borderRadius: "12px", border: "none", cursor: "pointer",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "4px",
              padding: "8px 4px", flexShrink: 0,
              background: isActive ? `linear-gradient(135deg, ${color}, ${color}dd)` : "rgba(255,255,255,0.06)",
              boxShadow: isActive ? `0 3px 10px ${color}40` : "none",
            }}>
              {icon ? (
                <img src={icon} alt={cat.label} style={{ width: "28px", height: "28px", objectFit: "contain", filter: isActive ? "brightness(1.2)" : "brightness(0.7)" }} />
              ) : (
                <span style={{ fontSize: "0.85rem", fontWeight: 800, color: isActive ? "white" : color }}>{cat.label.charAt(0)}</span>
              )}
              <span style={{ fontSize: "0.65rem", fontWeight: 700, color: isActive ? "white" : "#94a3b8", whiteSpace: "nowrap" }}>{cat.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}