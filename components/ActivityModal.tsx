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
        .am-overlay { position:fixed; inset:0; z-index:90; background:rgba(3,7,18,.78); backdrop-filter:blur(5px); display:flex; align-items:center; justify-content:center; padding:1rem; animation:amFade .18s ease-out; }
        .am-box { position:relative; width:100%; max-width:380px; max-height:88vh; overflow-y:auto; border-radius:20px; background:linear-gradient(180deg,#1e1b4b 0%,#0f0f2e 100%); border:1px solid rgba(253,224,71,.35); box-shadow:0 24px 60px rgba(0,0,0,.7), 0 0 0 1px rgba(255,255,255,.06) inset; animation:amPop .25s cubic-bezier(.2,1.2,.4,1); }
        .am-close { position:absolute; top:10px; right:10px; z-index:2; width:32px; height:32px; border-radius:50%; border:none; background:rgba(0,0,0,.5); color:#fff; font-size:15px; cursor:pointer; }
        .am-img { width:100%; max-height:190px; overflow:hidden; border-radius:20px 20px 0 0; }
        .am-img img { width:100%; display:block; object-fit:cover; }
        .am-body { padding:1.1rem 1.15rem 1.3rem; }
        .am-title { margin:0; font-size:1.2rem; font-weight:800; color:#fde68a; text-align:center; }
        .am-sub { margin:.35rem 0 0; font-size:.83rem; color:rgba(226,232,240,.75); text-align:center; line-height:1.5; }
        .am-pills { display:flex; gap:.4rem; flex-wrap:wrap; justify-content:center; margin:.8rem 0 0; }
        .am-pill { background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.14); color:#e2e8f0; font-size:.74rem; padding:.28rem .7rem; border-radius:99px; }
        .am-pill-gold { background:rgba(253,224,71,.14); border-color:rgba(253,224,71,.45); color:#fde68a; font-weight:700; }
        .am-rules { margin-top:.9rem; background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.1); border-radius:12px; padding:.7rem .85rem; }
        .am-rules-head { font-size:.78rem; font-weight:700; color:#c7d2fe; margin-bottom:.35rem; }
        .am-rule-line { font-size:.78rem; color:rgba(226,232,240,.8); line-height:1.7; }
        .am-question { margin-top:1rem; text-align:center; font-size:.95rem; font-weight:700; color:#fff; }
        .am-options { display:grid; grid-template-columns:repeat(auto-fit,minmax(88px,1fr)); gap:.5rem; margin-top:.7rem; }
        .am-opt { padding:.65rem .5rem; border-radius:12px; border:1.5px solid rgba(255,255,255,.16); background:rgba(255,255,255,.06); color:#e2e8f0; font-size:.83rem; font-weight:600; cursor:pointer; font-family:inherit; transition:all .13s; }
        .am-opt:active { transform:scale(.97); }
        .am-opt-on { border-color:#fbbf24; background:rgba(251,191,36,.18); color:#fde68a; box-shadow:0 0 0 3px rgba(251,191,36,.16); }
        .am-msg { margin-top:.8rem; padding:.55rem .75rem; border-radius:10px; font-size:.8rem; text-align:center; }
        .am-msg-ok { background:rgba(34,197,94,.14); border:1px solid rgba(34,197,94,.4); color:#86efac; }
        .am-msg-err { background:rgba(239,68,68,.14); border:1px solid rgba(239,68,68,.4); color:#fca5a5; }
        .am-cta { width:100%; margin-top:1rem; height:48px; border:none; border-radius:12px; cursor:pointer; font-family:inherit; font-size:.95rem; font-weight:800; color:#3b2409;
          background:linear-gradient(180deg,#fde047 0%,#f59e0b 60%,#b45309 100%);
          box-shadow:0 5px 0 #78350f, 0 10px 20px rgba(0,0,0,.45), inset 0 2px 0 rgba(255,255,255,.5); transition:transform .1s, box-shadow .1s; }
        .am-cta:active:not(:disabled) { transform:translateY(4px); box-shadow:0 1px 0 #78350f, inset 0 2px 0 rgba(255,255,255,.5); }
        .am-cta:disabled { opacity:.65; cursor:not-allowed; }
        @keyframes amFade { from { opacity:0 } to { opacity:1 } }
        @keyframes amPop { from { opacity:0; transform:translateY(16px) scale(.96) } to { opacity:1; transform:translateY(0) scale(1) } }
      `}</style>
    </div>
  );
}