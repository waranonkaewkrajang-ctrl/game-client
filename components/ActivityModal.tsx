"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export type ActItem = {
  id: number; type: string; title: string; subtitle: string | null;
  image_url: string | null; image_thumb: string | null;
  slots: string[]; link_url: string | null;
  badge: string | null; badge_color: string | null;
  end_at?: string | null; config?: any;
};

export default function ActivityModal({ act, onClose }: { act: ActItem; onClose: () => void }) {
  const router = useRouter();
  const cfg = act.config || {};
  const options: { key: string; label: string }[] = Array.isArray(cfg.options) ? cfg.options : [];
  const rules: string = cfg.rules || "";
  const rewardText: string = cfg.reward_text || "";
  const costText: string = cfg.cost_text || "";

  const [picked, setPicked] = useState<string>("");
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", esc);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", esc); document.body.style.overflow = ""; };
  }, [onClose]);

  const goLink = () => {
    api.post(`/activities/${act.id}/click`).catch(() => {});
    const url = act.link_url || "";
    onClose();
    if (!url) return;
    if (url.startsWith("http")) window.open(url, "_blank");
    else router.push(url);
  };

  const submit = async () => {
    if (!picked) { setMsg({ ok: false, text: "กรุณาเลือกคำตอบก่อน" }); return; }
    setSending(true);
    setMsg(null);
    try {
      const res = await api.post(`/activities/${act.id}/entry`, { answer: picked });
      setMsg({ ok: true, text: res.data?.message || "ส่งคำทายเรียบร้อย" });
    } catch (e: any) {
      setMsg({ ok: false, text: e.response?.data?.message || "ส่งคำทายไม่สำเร็จ" });
    }
    setSending(false);
  };

  const isPlay = act.type === "football" || act.type === "lotto2";

  return (
    <div className="am-overlay" onClick={onClose}>
      <div className="am-box" onClick={(e) => e.stopPropagation()}>
        <button className="am-close" onClick={onClose} aria-label="ปิด">✕</button>

        {act.image_url && (
          <div className="am-img"><img src={act.image_url} alt={act.title} /></div>
        )}

        <div className="am-body">
          <h2 className="am-title">{act.title}</h2>
          {act.subtitle && <p className="am-sub">{act.subtitle}</p>}

          {(rewardText || costText) && (
            <div className="am-pills">
              {rewardText && <span className="am-pill am-pill-gold">🎁 {rewardText}</span>}
              {costText && <span className="am-pill">🎫 {costText}</span>}
            </div>
          )}

          {rules && (
            <div className="am-rules">
              <div className="am-rules-head">📋 กติกา</div>
              {rules.split("\n").filter(Boolean).map((line, i) => (
                <div key={i} className="am-rule-line">• {line}</div>
              ))}
            </div>
          )}

          {isPlay && options.length > 0 && (
            <>
              {cfg.question && <div className="am-question">{cfg.question}</div>}
              <div className="am-options">
                {options.map((o) => (
                  <button key={o.key} className={`am-opt ${picked === o.key ? "am-opt-on" : ""}`} onClick={() => { setPicked(o.key); setMsg(null); }}>
                    {o.label}
                  </button>
                ))}
              </div>
            </>
          )}

          {msg && <div className={`am-msg ${msg.ok ? "am-msg-ok" : "am-msg-err"}`}>{msg.text}</div>}

          {isPlay ? (
            <button className="am-cta" onClick={submit} disabled={sending || (msg?.ok ?? false)}>
              {sending ? "กำลังส่ง..." : msg?.ok ? "ส่งแล้ว ✓" : "ส่งคำทาย"}
            </button>
          ) : (
            <button className="am-cta" onClick={goLink}>{cfg.button_text || "เข้าร่วมกิจกรรม"}</button>
          )}
        </div>
      </div>

      <style>{`
                .am-overlay { position:fixed; inset:0; z-index:90; background:rgba(15,23,42,.62); backdrop-filter:blur(6px); display:flex; align-items:center; justify-content:center; padding:1rem; animation:amFade .18s ease-out; }
        .am-box { position:relative; width:100%; max-width:380px; max-height:88vh; overflow-y:auto; border-radius:24px;
          background:linear-gradient(180deg,#ffffff 0%,#f6f8ff 60%,#eef1ff 100%);
          border:1px solid rgba(255,255,255,.9);
          box-shadow:0 0 0 1px rgba(99,102,241,.1), 0 10px 0 -4px #dbe3ff, 0 18px 0 -8px #b9c6ff, 0 34px 70px -18px rgba(30,41,59,.55);
          animation:amPop .28s cubic-bezier(.2,1.25,.4,1); }
        .am-close { position:absolute; top:12px; right:12px; z-index:2; width:34px; height:34px; border-radius:50%; border:none; background:rgba(255,255,255,.95); color:#475569; font-size:15px; font-weight:700; cursor:pointer; box-shadow:0 3px 10px rgba(15,23,42,.25); }
        .am-close:active { transform:scale(.92); }
        .am-img { width:100%; max-height:186px; overflow:hidden; border-radius:24px 24px 0 0; }
        .am-img img { width:100%; display:block; object-fit:cover; }
        .am-body { padding:1.2rem 1.2rem 1.35rem; }
        .am-title { margin:0; font-size:1.3rem; font-weight:800; text-align:center; letter-spacing:-.01em;
          background:linear-gradient(90deg,#4f46e5,#9333ea 55%,#f59e0b); -webkit-background-clip:text; background-clip:text; color:transparent; }
        .am-sub { margin:.35rem 0 0; font-size:.84rem; color:#64748b; text-align:center; line-height:1.55; }
        .am-pills { display:flex; gap:.45rem; flex-wrap:wrap; justify-content:center; margin:.85rem 0 0; }
        .am-pill { background:#f1f5f9; border:1px solid #e2e8f0; color:#475569; font-size:.75rem; font-weight:600; padding:.32rem .75rem; border-radius:99px; }
        .am-pill-gold { background:linear-gradient(180deg,#fef3c7,#fde68a); border-color:#fbbf24; color:#92400e; font-weight:800; box-shadow:0 2px 0 #f59e0b; }
        .am-rules { margin-top:.95rem; background:white; border:1px solid #e8ecf7; border-radius:16px; padding:.85rem .95rem; box-shadow:0 2px 8px rgba(79,70,229,.06); }
        .am-rules-head { font-size:.8rem; font-weight:800; color:#4f46e5; margin-bottom:.4rem; }
        .am-rule-line { font-size:.8rem; color:#475569; line-height:1.75; }
        .am-question { margin-top:1.05rem; text-align:center; font-size:1rem; font-weight:800; color:#0f172a; }
        .am-options { display:grid; grid-template-columns:repeat(auto-fit,minmax(90px,1fr)); gap:.55rem; margin-top:.75rem; }
        .am-opt { padding:.7rem .5rem; border-radius:16px; border:none; cursor:pointer; font-family:inherit; font-size:.85rem; font-weight:700; color:#334155;
          background:linear-gradient(180deg,#ffffff,#eef2ff);
          box-shadow:0 4px 0 #c7d2fe, 0 8px 14px rgba(79,70,229,.14), inset 0 1px 0 #fff;
          transition:transform .12s, box-shadow .12s; }
        .am-opt:active { transform:translateY(3px); box-shadow:0 1px 0 #c7d2fe, inset 0 1px 0 #fff; }
        .am-opt-on { color:#3730a3;
          background:linear-gradient(180deg,#e0e7ff,#c7d2fe);
          box-shadow:0 4px 0 #818cf8, 0 10px 18px rgba(79,70,229,.3), inset 0 1px 0 #fff, 0 0 0 2px #6366f1; }
        .am-msg { margin-top:.85rem; padding:.6rem .8rem; border-radius:12px; font-size:.8rem; text-align:center; font-weight:600; }
        .am-msg-ok { background:#dcfce7; border:1px solid #86efac; color:#15803d; }
        .am-msg-err { background:#fee2e2; border:1px solid #fca5a5; color:#b91c1c; }
        .am-cta { width:100%; margin-top:1.1rem; height:52px; border:none; border-radius:18px; cursor:pointer; font-family:inherit; font-size:1rem; font-weight:800; color:#fff; letter-spacing:.01em;
          background:linear-gradient(180deg,#818cf8 0%,#4f46e5 55%,#4338ca 100%);
          box-shadow:0 6px 0 #312e81, 0 14px 24px rgba(67,56,202,.42), inset 0 2px 0 rgba(255,255,255,.4);
          transition:transform .1s, box-shadow .1s, filter .15s; }
        .am-cta:hover:not(:disabled) { filter:brightness(1.07); }
        .am-cta:active:not(:disabled) { transform:translateY(5px); box-shadow:0 1px 0 #312e81, inset 0 2px 0 rgba(255,255,255,.4); }
        .am-cta:disabled { opacity:.6; cursor:not-allowed; }
        @keyframes amFade { from { opacity:0 } to { opacity:1 } }
        @keyframes amPop { from { opacity:0; transform:translateY(20px) scale(.94) } to { opacity:1; transform:translateY(0) scale(1) } }
      `}</style>
    </div>
  );
}