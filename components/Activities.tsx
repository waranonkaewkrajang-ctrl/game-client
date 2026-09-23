"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

type Act = {
  id: number; type: string; title: string; subtitle: string | null;
  image_url: string | null; image_thumb: string | null;
  slots: string[]; link_url: string | null;
  badge: string | null; badge_color: string | null; show_once: boolean;
};

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

  // ── ปุ่มลอย ──
  if (slot === "float_button") {
    return (
      <div className="act-float">
        {items.slice(0, 3).map((a) => (
          <button key={a.id} onClick={() => go(a)} title={a.title}>
            {a.image_thumb ? <img src={a.image_thumb} alt={a.title} loading="lazy" /> : <span>{a.title.slice(0, 2)}</span>}
            {a.badge && <i style={{ background: a.badge_color || "#ef4444" }}>{a.badge}</i>}
          </button>
        ))}
        <style>{`
          .act-float { position:fixed; right:10px; bottom:96px; z-index:35; display:flex; flex-direction:column; gap:.6rem; }
          .act-float button { position:relative; width:58px; height:58px; border-radius:50%; border:1px solid rgba(255,255,255,.2); background:rgba(15,23,42,.85); cursor:pointer; overflow:hidden; padding:0; box-shadow:0 6px 18px rgba(0,0,0,.5); animation:actBob 3s ease-in-out infinite; }
          .act-float button img { width:100%; height:100%; object-fit:cover; }
          .act-float button span { color:white; font-size:.8rem; font-weight:700; }
          .act-float i { position:absolute; top:-2px; right:-2px; color:white; font-size:.55rem; font-style:normal; font-weight:700; padding:1px 5px; border-radius:99px; }
          @keyframes actBob { 0%,100% { transform:translateY(0) } 50% { transform:translateY(-6px) } }
        `}</style>
      </div>
    );
  }

  return null;
}