"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

type Act = {
  id: number; type: string; title: string; subtitle: string | null;
  image_url: string | null; image_thumb: string | null;
  slots: string[]; link_url: string | null;
    badge: string | null; badge_color: string | null; show_once: boolean;
  end_at?: string | null;
};


// นับถอยหลังจนถึงเวลาที่กำหนด
function Countdown({ end }: { end: string }) {
  const [left, setLeft] = useState(() => Math.max(0, new Date(end).getTime() - Date.now()));

  useEffect(() => {
    const t = setInterval(() => setLeft(Math.max(0, new Date(end).getTime() - Date.now())), 1000);
    return () => clearInterval(t);
  }, [end]);

  if (left <= 0) return null;

  const s = Math.floor(left / 1000);
  const d = Math.floor(s / 86400);
  const pad = (n: number) => String(n).padStart(2, "0");
  const text = d > 0
    ? `${d} วัน ${pad(Math.floor((s % 86400) / 3600))}:${pad(Math.floor((s % 3600) / 60))}`
    : `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;

  return <span className={`act-timer ${s < 3600 ? "act-timer-hot" : ""}`}>⏱ {text}</span>;
}

export default function Activities({ page, slot }: { page: string; slot: string }) {
  const router = useRouter();
  const [items, setItems] = useState<Act[]>([]);

  useEffect(() => {
    let alive = true;
    const load = () => {
      api.get("/activities", { params: { page } })
        .then((r) => { if (alive) setItems((r.data?.data || []).filter((a: Act) => (a.slots || []).includes(slot))); })
        .catch(() => {});
    };
    load();
    const t = setInterval(() => { if (!document.hidden) load(); }, 60000);
    return () => { alive = false; clearInterval(t); };
  }, [page, slot]);

  if (items.length === 0) return null;

  const go = (a: Act) => {
    api.post(`/activities/${a.id}/click`).catch(() => {});
    const url = a.link_url || "";
    if (!url) return;
    if (url.startsWith("http")) window.open(url, "_blank");
    else router.push(url);
  };

  // ── กริดไอคอน ──
  if (slot === "icon_grid") {
    return (
      <div className="act-grid">
        {items.map((a) => (
          <button key={a.id} className="act-icon" onClick={() => go(a)}>
            <span className="act-icon-img">
              {a.image_thumb && <img src={a.image_thumb} alt={a.title} loading="lazy" />}
              {a.badge && <span className="act-badge" style={{ background: a.badge_color || "#ef4444" }}>{a.badge}</span>}
            </span>
            <span className="act-icon-label">{a.title}</span>
          </button>
        ))}
        <style>{`
          .act-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(84px,1fr)); gap:.75rem; padding:.5rem 1rem 1rem; }
          .act-icon { background:none; border:none; padding:0; cursor:pointer; display:flex; flex-direction:column; align-items:center; gap:.4rem; font-family:inherit; }
          .act-icon:active { transform:scale(.94); }
          .act-icon-img { position:relative; width:64px; height:64px; border-radius:18px; overflow:hidden; background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.12); display:flex; align-items:center; justify-content:center; box-shadow:0 6px 14px rgba(0,0,0,.35); }
          .act-icon-img img { width:100%; height:100%; object-fit:cover; }
          .act-icon-label { font-size:.72rem; color:var(--color-text,#e2e8f0); text-align:center; line-height:1.25; max-width:84px; }
          .act-badge { position:absolute; top:3px; right:3px; color:white; font-size:.55rem; font-weight:700; padding:1px 5px; border-radius:99px; }
        `}</style>
      </div>
    );
  }

  // ── การ์ดใหญ่ / แบนเนอร์ ──
  if (slot === "home_card" || slot === "home_banner") {
    return (
      <div className="act-cards">
        {items.map((a) => (
          <button key={a.id} className="act-card" onClick={() => go(a)}>
            {a.image_url && <img src={a.image_url} alt={a.title} loading="lazy" />}
            {(a.title || a.subtitle) && (
              <span className="act-card-text">
                <b>{a.title}</b>
                {a.subtitle && <i>{a.subtitle}</i>}
              </span>
            )}
            {a.badge && <span className="act-badge-lg" style={{ background: a.badge_color || "#ef4444" }}>{a.badge}</span>}
          </button>
        ))}
        <style>{`
          .act-cards { display:flex; flex-direction:column; gap:.75rem; padding:.5rem 1rem; }
          .act-card { position:relative; border:none; padding:0; border-radius:14px; overflow:hidden; cursor:pointer; background:rgba(255,255,255,.05); box-shadow:0 8px 20px rgba(0,0,0,.4); font-family:inherit; }
          .act-card:active { transform:scale(.99); }
          .act-card img { width:100%; display:block; }
          .act-card-text { position:absolute; left:0; right:0; bottom:0; padding:.7rem .9rem; text-align:left; background:linear-gradient(transparent, rgba(0,0,0,.8)); display:flex; flex-direction:column; gap:.15rem; }
          .act-card-text b { color:white; font-size:.95rem; font-weight:700; }
          .act-card-text i { color:rgba(255,255,255,.8); font-size:.78rem; font-style:normal; }
          .act-badge-lg { position:absolute; top:10px; left:10px; color:white; font-size:.7rem; font-weight:700; padding:2px 9px; border-radius:99px; }
        `}</style>
      </div>
    );
  }

    // ── กล่องสมบัติลอย ──
  if (slot === "float_button") {
    return (
      <div className="act-float">
        {items.slice(0, 3).map((a) => (
          <div key={a.id} className="act-box-wrap">
            <button className="act-box" onClick={() => go(a)} title={a.title}>
              <span className="act-spark act-spark-1">✦</span>
              <span className="act-spark act-spark-2">✦</span>
              <span className="act-box-img">
                {a.image_thumb
                  ? <img src={a.image_thumb} alt={a.title} loading="lazy" />
                  : <span className="act-box-text">{a.title.slice(0, 2)}</span>}
              </span>
              {a.badge && <i className="act-box-badge" style={{ background: a.badge_color || "#ef4444" }}>{a.badge}</i>}
            </button>
            <span className="act-box-foot">
              {a.end_at ? <Countdown end={a.end_at} /> : <span className="act-box-name">{a.title}</span>}
            </span>
          </div>
        ))}
        <style>{`
          .act-float { position:fixed; right:10px; bottom:92px; z-index:35; display:flex; flex-direction:column; gap:.7rem; }
          .act-box-wrap { display:flex; flex-direction:column; align-items:center; width:76px; }
          .act-box { position:relative; width:76px; height:72px; border:none; padding:5px; cursor:pointer; border-radius:14px 14px 4px 4px;
            background:linear-gradient(180deg,#facc15 0%,#f59e0b 45%,#b45309 100%);
            box-shadow:0 0 0 2px rgba(253,224,71,.45), 0 6px 0 #78350f, 0 12px 20px rgba(0,0,0,.55), inset 0 2px 0 rgba(255,255,255,.55);
            animation:actShake 2.6s ease-in-out infinite; transition:transform .12s; }
          .act-box:active { transform:translateY(4px); box-shadow:0 0 0 2px rgba(253,224,71,.45), 0 2px 0 #78350f, inset 0 2px 0 rgba(255,255,255,.55); }
          .act-box-img { display:block; width:100%; height:100%; border-radius:10px 10px 3px 3px; overflow:hidden; background:#1e1b4b; display:flex; align-items:center; justify-content:center; }
          .act-box-img img { width:100%; height:100%; object-fit:cover; }
          .act-box-text { color:#fde68a; font-size:.85rem; font-weight:800; }
          .act-box-badge { position:absolute; top:-6px; left:-4px; color:white; font-size:.55rem; font-style:normal; font-weight:700; padding:2px 6px; border-radius:99px; box-shadow:0 2px 5px rgba(0,0,0,.4); }
          .act-box-foot { margin-top:5px; min-height:18px; display:flex; align-items:center; justify-content:center; }
          .act-timer { background:rgba(15,23,42,.92); border:1px solid rgba(253,224,71,.5); color:#fde68a; font-size:.62rem; font-weight:700; padding:2px 7px; border-radius:99px; white-space:nowrap; font-variant-numeric:tabular-nums; }
          .act-timer-hot { color:#fecaca; border-color:rgba(248,113,113,.7); animation:actBlink 1s steps(2) infinite; }
          .act-box-name { background:rgba(15,23,42,.9); color:#e2e8f0; font-size:.6rem; padding:2px 7px; border-radius:99px; max-width:76px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
          .act-spark { position:absolute; color:#fff9c4; font-size:.7rem; pointer-events:none; text-shadow:0 0 6px #fde047; }
          .act-spark-1 { top:-4px; right:2px; animation:actTwinkle 1.8s ease-in-out infinite; }
          .act-spark-2 { bottom:8px; left:-3px; animation:actTwinkle 1.8s ease-in-out .9s infinite; }
          @keyframes actShake { 0%,88%,100% { transform:rotate(0) } 90% { transform:rotate(-5deg) } 94% { transform:rotate(5deg) } 97% { transform:rotate(-3deg) } }
          @keyframes actTwinkle { 0%,100% { opacity:0; transform:scale(.6) } 50% { opacity:1; transform:scale(1.2) } }
          @keyframes actBlink { 0%,100% { opacity:1 } 50% { opacity:.45 } }
        `}</style>
      </div>
    );
  }
  
  return null;
}