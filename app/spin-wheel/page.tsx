"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import Swal from "sweetalert2";

interface Prize {
  id: number; label: string; type: string; value: number;
  color: string; icon: string; image_url: string | null; sort_order: number;
}
interface MultiplierItem {
  id: number; label: string; value: number; color: string; sort_order: number;
}
interface Winner {
  id: number; username: string; phone_tail: string; prize_label: string;
  prize_type: string; final_value: number; multiplier: number;
  image_url: string | null; created_at: string;
}

export default function SpinWheelPage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [multipliers, setMultipliers] = useState<MultiplierItem[]>([]);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [ticketBalance, setTicketBalance] = useState(0);
  const [pointBalance, setPointBalance] = useState(0);
  const [ticketCost, setTicketCost] = useState(1);
  const [pointCost, setPointCost] = useState(500);
  const [remaining, setRemaining] = useState(0);
  const [enabled, setEnabled] = useState(true);
  const [freeEnabled, setFreeEnabled] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [currentAngle, setCurrentAngle] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Record<number, HTMLImageElement>>({});
  const [winnerScrollY, setWinnerScrollY] = useState(0);
  const angleRef = useRef(0);
  const spinAnimRef = useRef<number | null>(null);

  // === Fetch data ===
  useEffect(() => {
    if (!localStorage.getItem("user_token")) { router.push("/login"); return; }
    fetchData();
    fetchWinners();
  }, []);

  const fetchData = () => {
    api.get("/spin-wheel").then((res) => {
      const d = res.data.data;
      setPrizes(d.prizes || []);
      setMultipliers(d.multipliers || []);
      setTicketBalance(d.ticket_balance || 0);
      setPointBalance(d.point_balance || 0);
      setTicketCost(d.ticket_cost || 1);
      setPointCost(d.point_cost || 500);
      setRemaining(d.remaining || 0);
      setEnabled(d.enabled);
      setFreeEnabled(d.free_enabled);
    }).catch(() => {});
  };

  const fetchWinners = () => {
    api.get("/spin-wheel/recent-winners").then((res) => {
      setWinners(res.data.data || []);
    }).catch(() => {});
  };

  // === Preload prize images ===
  useEffect(() => {
    const imgs: Record<number, HTMLImageElement> = {};
    prizes.forEach((p) => {
      if (p.image_url) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = p.image_url;
        img.onload = () => {
          imgs[p.id] = img;
          setLoadedImages((prev) => ({ ...prev, [p.id]: img }));
        };
      }
    });
  }, [prizes]);

  // === Auto scroll winners ===
  useEffect(() => {
    if (winners.length === 0) return;
    const interval = setInterval(() => {
      setWinnerScrollY((prev) => {
        const maxScroll = winners.length * 50; // เปลี่ยนจาก 40 เป็น 50
        return prev >= maxScroll ? 0 : prev + 1;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [winners]);

  // === Draw wheel (Purple Neon Style) ===
  const drawWheel = useCallback((angle: number) => {
    const canvas = canvasRef.current;
    if (!canvas || prizes.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = canvas.width;
    const cx = size / 2;
    const cy = size / 2;
    const outerR = size / 2 - 6;
    const wheelR = outerR - 38;
    const sliceAngle = (2 * Math.PI) / prizes.length;

    ctx.clearRect(0, 0, size, size);

    // === Outer glow ring ===
    const glowGrad = ctx.createRadialGradient(cx, cy, outerR - 10, cx, cy, outerR + 10);
    glowGrad.addColorStop(0, "rgba(139,92,246,0.3)");
    glowGrad.addColorStop(1, "rgba(139,92,246,0)");
    ctx.beginPath();
    ctx.arc(cx, cy, outerR + 10, 0, 2 * Math.PI);
    ctx.fillStyle = glowGrad;
    ctx.fill();

    // === Outer purple ring ===
    ctx.beginPath();
    ctx.arc(cx, cy, outerR, 0, 2 * Math.PI);
    ctx.fillStyle = "#2d1b69";
    ctx.fill();
    ctx.strokeStyle = "#7c3aed";
    ctx.lineWidth = 3;
    ctx.stroke();

    // === Multiplier ring ===
    if (multipliers.length > 0) {
      const multSlice = (2 * Math.PI) / multipliers.length;
      multipliers.forEach((m, i) => {
        const startA = i * multSlice + angle;
        const endA = startA + multSlice;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, outerR - 2, startA, endA);
        ctx.closePath();
        const mGrad = ctx.createRadialGradient(cx, cy, wheelR, cx, cy, outerR);
        mGrad.addColorStop(0, "rgba(109,40,217,0.6)");
        mGrad.addColorStop(1, "rgba(76,29,149,0.9)");
        ctx.fillStyle = mGrad;
        ctx.fill();
        ctx.strokeStyle = "rgba(139,92,246,0.3)";
        ctx.lineWidth = 1;
        ctx.stroke();
        // Label
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(startA + multSlice / 2);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#e9d5ff";
        ctx.font = `bold ${size * 0.026}px sans-serif`;
        ctx.shadowColor = "rgba(168,85,247,0.8)";
        ctx.shadowBlur = 6;
        ctx.fillText(m.label, outerR - 20, 0);
        ctx.shadowBlur = 0;
        ctx.restore();
      });
    }

    // === LED dots around outer ring ===
    const numDots = 16;
    for (let i = 0; i < numDots; i++) {
      const dotAngle = (i / numDots) * 2 * Math.PI + angle * 0.3;
      const dotX = cx + Math.cos(dotAngle) * (outerR - 4);
      const dotY = cy + Math.sin(dotAngle) * (outerR - 4);
      // Glow
      const dotGlow = ctx.createRadialGradient(dotX, dotY, 0, dotX, dotY, 8);
      dotGlow.addColorStop(0, i % 2 === 0 ? "rgba(251,191,36,0.8)" : "rgba(236,72,153,0.8)");
      dotGlow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.beginPath();
      ctx.arc(dotX, dotY, 8, 0, 2 * Math.PI);
      ctx.fillStyle = dotGlow;
      ctx.fill();
      // Dot
      ctx.beginPath();
      ctx.arc(dotX, dotY, 3, 0, 2 * Math.PI);
      ctx.fillStyle = i % 2 === 0 ? "#fbbf24" : "#ec4899";
      ctx.fill();
    }

    // === Inner blue glow ring ===
    ctx.beginPath();
    ctx.arc(cx, cy, wheelR + 5, 0, 2 * Math.PI);
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 4;
    ctx.shadowColor = "rgba(56,189,248,0.6)";
    ctx.shadowBlur = 12;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // === Prize slices ===
    prizes.forEach((p, i) => {
      const startA = i * sliceAngle + angle;
      const endA = startA + sliceAngle;

      // Slice fill — alternating purples
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, wheelR, startA, endA);
      ctx.closePath();
      const sliceGrad = ctx.createRadialGradient(cx, cy, size * 0.06, cx, cy, wheelR);
      if (i % 2 === 0) {
        sliceGrad.addColorStop(0, "#6d28d9");
        sliceGrad.addColorStop(1, "#7c3aed");
      } else {
        sliceGrad.addColorStop(0, "#4c1d95");
        sliceGrad.addColorStop(1, "#5b21b6");
      }
      ctx.fillStyle = sliceGrad;
      ctx.fill();
      ctx.strokeStyle = "rgba(168,85,247,0.4)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Content
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(startA + sliceAngle / 2);

      const imgObj = loadedImages[p.id];
      if (imgObj) {
        const imgSize = size * 0.09;
        ctx.drawImage(imgObj, wheelR * 0.5 - imgSize / 2, -imgSize / 2, imgSize, imgSize);
      }

      // Label
      ctx.fillStyle = "#e9d5ff";
      ctx.font = `bold ${size * 0.024}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.shadowColor = "rgba(0,0,0,0.5)";
      ctx.shadowBlur = 3;
      const labelY = imgObj ? -size * 0.065 : 0;
      ctx.fillText(p.label, wheelR * 0.55, labelY);
      ctx.shadowBlur = 0;
      ctx.restore();
    });

    // === Center circle ===
    const centerR = size * 0.12;
    const centerGrad = ctx.createRadialGradient(cx, cy - centerR * 0.3, 0, cx, cy, centerR);
    centerGrad.addColorStop(0, "#7c3aed");
    centerGrad.addColorStop(0.7, "#4c1d95");
    centerGrad.addColorStop(1, "#2e1065");
    ctx.beginPath();
    ctx.arc(cx, cy, centerR, 0, 2 * Math.PI);
    ctx.fillStyle = centerGrad;
    ctx.fill();
    // Center glow border
    ctx.strokeStyle = "#a78bfa";
    ctx.lineWidth = 3;
    ctx.shadowColor = "rgba(167,139,250,0.6)";
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // SPIN text
    ctx.fillStyle = "#f5f3ff";
    ctx.font = `bold ${size * 0.042}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(139,92,246,0.8)";
    ctx.shadowBlur = 8;
    ctx.fillText("SPIN", cx, cy);
    ctx.shadowBlur = 0;

    

  }, [prizes, multipliers, loadedImages]);

  useEffect(() => { drawWheel(currentAngle); }, [currentAngle, drawWheel]);

  // === Spin logic ===
  const doSpin = async (spinType: "free" | "ticket" | "points") => {
    if (spinning || !enabled) return;
    setSpinning(true);

    try {
      const res = await api.post("/spin-wheel/spin", { spin_type: spinType });
      const data = res.data.data;
      const prizeIndex = prizes.findIndex((p) => p.id === data.prize.id);
      if (prizeIndex === -1) { setSpinning(false); return; }

      // Calculate target angle
      const sliceAngle = 360 / prizes.length;
      const targetSlice = 360 - (prizeIndex * sliceAngle + sliceAngle / 2);
      const totalSpin = 360 * 8 + targetSlice; // 8 full rotations + target

      const startAngle = angleRef.current;
      const duration = 6000;
      const startTime = performance.now();

      const animate = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // easeOutQuart
        const ease = 1 - Math.pow(1 - progress, 4);
        const angle = startAngle + totalSpin * ease;
        const radians = (angle * Math.PI) / 180;

        angleRef.current = angle % 360;
        setCurrentAngle(radians);

        if (progress < 1) {
          spinAnimRef.current = requestAnimationFrame(animate);
        } else {
          // Done spinning
          setSpinning(false);
          setTicketBalance(data.ticket_balance ?? ticketBalance);
          setPointBalance(data.point_balance ?? pointBalance);

          // Show result
          const isNothing = data.prize.type === "nothing";
          Swal.fire({
            icon: isNothing ? "info" : "success",
            title: isNothing ? "เสียใจด้วย" : "ยินดีด้วย! 🎉",
            html: `
              <div style="text-align:center">
                ${data.prize.image_url ? `<img src="${data.prize.image_url}" style="width:80px;height:80px;object-fit:contain;margin:0 auto 12px;display:block;border-radius:10px" />` : ""}
                <p style="font-size:1.2rem;font-weight:bold;margin:0 0 8px;color:#111">${data.prize.label}</p>
                ${data.multiplier > 1 ? `<p style="font-size:0.9rem;color:#d97706;margin:0 0 4px">ตัวคูณ ×${data.multiplier}</p>` : ""}
                <p style="font-size:1rem;color:#4f46e5;font-weight:600;margin:0">${data.message}</p>
              </div>
            `,
            background: "#0f0f1a",
            color: "#e2e8f0",
            confirmButtonColor: "#7c3aed",
            confirmButtonText: "เยี่ยม!",
          });

          fetchData();
          fetchWinners();
        }
      };

      spinAnimRef.current = requestAnimationFrame(animate);

    } catch (err: any) {
      setSpinning(false);
      Swal.fire({
        icon: "error", title: "ไม่สามารถหมุนได้",
        text: err.response?.data?.message || "กรุณาลองใหม่",
        background: "#0f0f1a", color: "#e2e8f0", confirmButtonColor: "#dc2626",
      });
    }
  };

  return (
    <div style={{ minHeight: "100dvh", paddingBottom: "80px", background: "linear-gradient(180deg, #0a0a1a 0%, #1a1035 50%, #0a0a14 100%)", position: "relative", overflowX: "hidden" }}>

      {/* Sparkle stars background */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        {[...Array(20)].map((_, i) => (
          <div key={i} style={{
            position: "absolute",
            left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
            width: `${2 + Math.random() * 3}px`, height: `${2 + Math.random() * 3}px`,
            background: "#facc15", borderRadius: "50%",
            opacity: 0.3 + Math.random() * 0.5,
            animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 3}s`,
          }} />
        ))}
      </div>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", padding: "16px 20px", position: "relative", zIndex: 10 }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", color: "#fff", fontSize: "1.3rem", cursor: "pointer", padding: "4px 8px" }}>←</button>
        <h1 style={{ flex: 1, textAlign: "center", color: "#facc15", fontSize: "1.1rem", fontWeight: 800, margin: 0, textShadow: "0 2px 8px rgba(250,204,21,0.3)" }}>วงล้อเสี่ยงโชค</h1>
        <div style={{ width: "32px" }} />
      </div>

      {/* Ticket Bar */}
      <div style={{ display: "flex", justifyContent: "center", padding: "0 20px 12px", position: "relative", zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.08)", borderRadius: "25px", padding: "8px 24px", border: "1px solid rgba(250,204,21,0.2)" }}>
          <span style={{ fontSize: "1rem" }}>🎫</span>
          <span style={{ color: "#ccc", fontSize: "0.85rem" }}>ตั๋ว</span>
          <span style={{ color: "#facc15", fontWeight: 800, fontSize: "1.2rem" }}>{ticketBalance}</span>
          <span style={{ color: "#ccc", fontSize: "0.8rem" }}>ใบ</span>
        </div>
      </div>

     {/* Recent Winners Feed (สไตล์โปร่งใส ลอยตัว ไร้กรอบ มีเส้นคั่น) */}
      {winners.length > 0 && (
        <div style={{ 
          margin: "8px 20px 16px", 
          height: "150px", 
          position: "relative", 
          zIndex: 10, 
          overflow: "hidden",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)",
          maskImage: "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)"
        }}>
          <div style={{ position: "relative", height: "100%", overflow: "hidden" }}>
            <div style={{ transform: `translateY(-${winnerScrollY}px)`, transition: "transform 0.05s linear" }}>
              {[...winners, ...winners].map((w, i) => (
                <div key={`${w.id}-${i}`} style={{ 
                  display: "flex", alignItems: "center", gap: "12px", 
                  padding: "6px 4px", height: "50px", boxSizing: "border-box",
                  borderBottom: "1px solid rgba(250, 204, 21, 0.2)" 
                }}>
                  
                  {/* อวตาร (วงกลม) */}
                  <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "linear-gradient(135deg, #7c3aed, #2563eb)", border: "1px solid rgba(250,204,21,0.5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", color: "#fff", fontWeight: 700, flexShrink: 0 }}>
                    {w.username.slice(0, 2).toUpperCase()}
                  </div>
                  
                  {/* ชื่อ และ เบอร์โทร (จัดเรียงแนวตั้งบนล่าง) */}
                  <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>
                    <span style={{ color: "#facc15", fontSize: "0.85rem", fontWeight: 700, lineHeight: 1.2 }}>
                      {w.username}
                    </span>
                    <span style={{ color: "#fde047", fontSize: "0.7rem", opacity: 0.8 }}>
                      {w.phone_tail ? `********${w.phone_tail}` : ""}
                    </span>
                  </div>
                  
                  {/* รูปภาพรางวัล และ ชื่อรางวัล */}
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", justifyContent: "flex-end" }}>
                    {w.image_url && (
                      <img src={w.image_url} alt="prize" style={{ width: "24px", height: "24px", objectFit: "contain", filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.5))" }} />
                    )}
                    <span style={{ color: "#ffffff", fontSize: "0.8rem", fontWeight: 700, textShadow: "0 1px 2px rgba(0,0,0,0.8)" }}>
                      {w.prize_label}
                    </span>
                  </div>

                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mission & Rewards Buttons */}
      <div style={{ display: "flex", justifyContent: "space-between", padding: "0 20px 8px", position: "relative", zIndex: 10 }}>
        <button style={{ background: "linear-gradient(135deg, #dc2626, #991b1b)", color: "#fff", border: "none", padding: "8px 20px", borderRadius: "20px", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer" }}>
          ทำภารกิจ
        </button>
        <button style={{ background: "linear-gradient(135deg, #d97706, #92400e)", color: "#fff", border: "none", padding: "8px 20px", borderRadius: "20px", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer" }}>
          รางวัล
        </button>
      </div>

     {/* LUCKY WHEEL Title (ป้ายทองโค้ง 3 มิติ) */}
      <div style={{ display: "flex", justifyContent: "center", position: "relative", zIndex: 15, marginBottom: "-50px", marginTop: "10px" }}>
        <svg width="340" height="110" viewBox="0 0 340 110" style={{ filter: "drop-shadow(0 8px 6px rgba(0,0,0,0.6))" }}>
          <defs>
            {/* ไล่สีทองแบบในรูปภาพ */}
            <linearGradient id="banner-gold" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="30%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#854d0e" />
            </linearGradient>
            {/* เส้นโค้งซ่อนไว้สำหรับให้ข้อความวิ่งตาม (ปรับความโค้งให้รับกับวงล้อ) */}
            <path id="text-arc" d="M 30,85 Q 170,10 310,85" />
          </defs>

          {/* ฐาน 3D (เงาความหนาด้านล่างของป้าย) */}
          <path d="M 30,91 Q 170,16 310,91" fill="none" stroke="#451a03" strokeWidth="44" strokeLinecap="round" />
          
          {/* ตัวป้ายริบบิ้นสีทอง */}
          <path d="M 30,85 Q 170,10 310,85" fill="none" stroke="url(#banner-gold)" strokeWidth="44" strokeLinecap="round" />

          {/* ไฮไลท์แสงสะท้อนขอบบนของป้าย */}
          <path d="M 30,64 Q 170,-11 310,64" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" />

          {/* ข้อความโค้งตามเส้น */}
          <text fontSize="26" fontWeight="900" fill="#451a03" letterSpacing="5" fontFamily="sans-serif">
            <textPath href="#text-arc" startOffset="50%" textAnchor="middle" dominantBaseline="middle">
              LUCKY WHEEL
            </textPath>
          </text>
        </svg>
      </div>

      {/* Wheel Canvas (ดีไซน์ใหม่) */}
      <div style={{ display: "flex", justifyContent: "center", padding: "16px 10px", position: "relative", zIndex: 10 }}>
        
        {/* เข็มชี้ (ใช้ SVG เพื่อความคมชัด และใส่ Drop Shadow ให้เรืองแสง) */}
        <svg
          width="42" height="52" viewBox="0 0 40 50"
          style={{
            position: "absolute",
            top: "-2px",
            zIndex: 20,
            filter: "drop-shadow(0 6px 6px rgba(0,0,0,0.6)) drop-shadow(0 0 12px rgba(244,63,94,0.8))"
          }}
        >
          <defs>
            <linearGradient id="pointer-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fb7185" />
              <stop offset="100%" stopColor="#e11d48" />
            </linearGradient>
          </defs>
          <path 
            d="M5.5 4 C4 4 3 5.5 3.5 7 L18.5 46 C19 47.5 21 47.5 21.5 46 L36.5 7 C37 5.5 36 4 34.5 4 Z" 
            fill="url(#pointer-grad)" 
            stroke="#ffffff" 
            strokeWidth="2.5" 
            strokeLinejoin="round" 
          />
        </svg>

        {/* กรอบเรืองแสงรอบวงล้อ */}
        <div style={{
          position: "relative",
          display: "inline-block",
          padding: "10px",
          background: "rgba(255, 255, 255, 0.02)",
          borderRadius: "50%",
          boxShadow: "0 0 40px rgba(139, 92, 246, 0.3), inset 0 0 20px rgba(255, 255, 255, 0.05)",
        }}>
          <canvas
            ref={canvasRef}
            width={380}
            height={380}
            style={{ 
              width: "min(90vw, 380px)", 
              height: "min(90vw, 380px)", 
              cursor: spinning ? "not-allowed" : "pointer",
              borderRadius: "50%",
              boxShadow: "0 10px 25px rgba(0,0,0,0.6)"
            }}
            onClick={() => {}}
          />
        </div>
      </div>

      {/* Spin Buttons (สไตล์ 3D แบบคู่ตามภาพ) */}
      <div className="spin-btn-container">
        {/* ปุ่มหมุนด้วยตั๋ว (สีฟ้า) */}
        <button
          className="spin-btn spin-btn-blue"
          onClick={() => doSpin("ticket")}
          disabled={spinning || ticketBalance < ticketCost}
        >
          <span className="btn-text-main">หมุน 1 ครั้ง</span>
          <span className="btn-text-sub">
            <span style={{ fontSize: "1.1rem", filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.5))" }}>🎫</span> {ticketCost}
          </span>
        </button>

        {/* ปุ่มหมุนด้วยพอยท์ (สีเหลือง) */}
        <button
          className="spin-btn spin-btn-yellow"
          onClick={() => doSpin("points")}
          disabled={spinning || pointBalance < pointCost}
        >
          <span className="btn-text-main">หมุน 1 ครั้ง</span>
          <span className="btn-text-sub">
            <span style={{ fontSize: "1.1rem", filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.3))" }}>💎</span> {pointCost}
          </span>
        </button>
      </div>

        <style dangerouslySetInnerHTML={{ __html: `
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.5); }
        }

        /* --- สไตล์ปุ่ม 3D คู่ (เหมือนในภาพเป๊ะ) --- */
        .spin-btn-container {
          display: flex;
          justify-content: center;
          gap: 16px;
          padding: 12px 20px 36px;
          position: relative;
          z-index: 10;
        }

        .spin-btn {
          position: relative;
          flex: 1;
          max-width: 160px;
          height: 64px;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-family: inherit;
          /* อนิเมชั่นเวลากด */
          transition: transform 0.1s, box-shadow 0.1s, filter 0.2s;
          outline: none;
          -webkit-tap-highlight-color: transparent;
        }

        /* สถานะเมื่อปุ่มถูกล็อค (ตั๋ว/พอยท์ ไม่พอ หรือกำลังหมุน) */
        .spin-btn:disabled {
          cursor: not-allowed;
          filter: grayscale(80%) brightness(0.7);
          transform: translateY(6px);
          box-shadow: 0 0 0 transparent, 0 6px 0 #2a2a35 !important;
        }

        /* สถานะตอนเอานิ้วกด (ปุ่มยุบตัว) */
        .spin-btn:active:not(:disabled) {
          transform: translateY(6px);
          box-shadow: 0 0 0 transparent, 0 6px 0 #2a2a35 !important;
        }

        /* --- ปุ่มสีฟ้า (ตั๋ว) --- */
        .spin-btn-blue {
          background: linear-gradient(180deg, #38bdf8 0%, #0284c7 100%);
          color: #ffffff;
          /* เงา 2 ชั้น: ชั้นขอบสีน้ำเงินเข้ม + ชั้นฐานสีเทาเข้ม */
          box-shadow: 0 6px 0 #0369a1, 0 12px 0 #2a2a35;
          text-shadow: 0 1px 2px rgba(0,0,0,0.3);
        }
        /* ไฮไลท์แสงสะท้อนขอบบน */
        .spin-btn-blue::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 12px;
          box-shadow: inset 0 2px 0 rgba(255,255,255,0.3);
          pointer-events: none;
        }

        /* --- ปุ่มสีเหลือง (พอยท์) --- */
        .spin-btn-yellow {
          background: linear-gradient(180deg, #fde047 0%, #eab308 100%);
          color: #713f12; /* ข้อความสีน้ำตาลตามภาพ */
          /* เงา 2 ชั้น: ชั้นขอบสีทองเข้ม + ชั้นฐานสีเทาเข้ม */
          box-shadow: 0 6px 0 #a16207, 0 12px 0 #2a2a35;
        }
        /* ไฮไลท์แสงสะท้อนขอบบน */
        .spin-btn-yellow::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 12px;
          box-shadow: inset 0 2px 0 rgba(255,255,255,0.5);
          pointer-events: none;
        }

        /* --- จัดระเบียบข้อความในปุ่ม --- */
        .btn-text-main {
          font-size: 1.1rem;
          font-weight: 900;
          line-height: 1.2;
        }
        .btn-text-sub {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.95rem;
          font-weight: 800;
        }
      `}} />
    </div>
  );
}