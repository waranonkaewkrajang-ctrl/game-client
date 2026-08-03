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
        const maxScroll = winners.length * 40;
        return prev >= maxScroll ? 0 : prev + 1;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [winners]);

  // === Draw wheel ===
  const drawWheel = useCallback((angle: number) => {
    const canvas = canvasRef.current;
    if (!canvas || prizes.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = canvas.width;
    const cx = size / 2;
    const cy = size / 2;
    const outerR = size / 2 - 8;
    const wheelR = outerR - 36;
    const sliceAngle = (2 * Math.PI) / prizes.length;

    ctx.clearRect(0, 0, size, size);

    // === Multiplier ring (outer) ===
    if (multipliers.length > 0) {
      const multSlice = (2 * Math.PI) / multipliers.length;
      multipliers.forEach((m, i) => {
        const startA = i * multSlice + angle;
        const endA = startA + multSlice;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, outerR, startA, endA);
        ctx.closePath();
        ctx.fillStyle = m.color;
        ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.3)";
        ctx.lineWidth = 1;
        ctx.stroke();
        // Label
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(startA + multSlice / 2);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#fff";
        ctx.font = `bold ${size * 0.028}px sans-serif`;
        ctx.shadowColor = "rgba(0,0,0,0.5)";
        ctx.shadowBlur = 3;
        ctx.fillText(m.label, outerR - 18, 0);
        ctx.shadowBlur = 0;
        ctx.restore();
      });
    }

    // === Blue border ring ===
    ctx.beginPath();
    ctx.arc(cx, cy, wheelR + 4, 0, 2 * Math.PI);
    ctx.strokeStyle = "#2563eb";
    ctx.lineWidth = 8;
    ctx.stroke();

    // === Gold border ring ===
    ctx.beginPath();
    ctx.arc(cx, cy, wheelR + 1, 0, 2 * Math.PI);
    ctx.strokeStyle = "#facc15";
    ctx.lineWidth = 3;
    ctx.stroke();

    // === Prize slices ===
    prizes.forEach((p, i) => {
      const startA = i * sliceAngle + angle;
      const endA = startA + sliceAngle;

      // Slice fill
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, wheelR, startA, endA);
      ctx.closePath();
      ctx.fillStyle = i % 2 === 0 ? "#ffffff" : "#ff1a1a";
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.1)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Content (image or text)
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(startA + sliceAngle / 2);

      const imgObj = loadedImages[p.id];
      if (imgObj) {
        const imgSize = size * 0.09;
        ctx.drawImage(imgObj, wheelR * 0.5 - imgSize / 2, -imgSize / 2, imgSize, imgSize);
      }

      // Label text
      ctx.fillStyle = i % 2 === 0 ? "#111" : "#fff";
      ctx.font = `bold ${size * 0.025}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const labelY = imgObj ? -size * 0.07 : 0;
      ctx.fillText(p.label, wheelR * 0.55, labelY);

      ctx.restore();
    });

    // === Center circle ===
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.1);
    grad.addColorStop(0, "#3b82f6");
    grad.addColorStop(1, "#1d4ed8");
    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.1, 0, 2 * Math.PI);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = "#facc15";
    ctx.lineWidth = 3;
    ctx.stroke();

    // SPIN text
    ctx.fillStyle = "#fff";
    ctx.font = `bold ${size * 0.045}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("SPIN", cx, cy);

    // === Pointer (top) ===
    ctx.save();
    ctx.translate(cx, cy - outerR + 2);
    ctx.beginPath();
    ctx.moveTo(0, 14);
    ctx.lineTo(-12, -10);
    ctx.lineTo(12, -10);
    ctx.closePath();
    ctx.fillStyle = "#facc15";
    ctx.fill();
    ctx.strokeStyle = "#b45309";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

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
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, #0a0a1a 0%, #1a1035 50%, #0a0a14 100%)", position: "relative", overflow: "hidden" }}>

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

      {/* Recent Winners Feed */}
      {winners.length > 0 && (
        <div style={{ margin: "0 20px 12px", background: "rgba(0,0,0,0.3)", borderRadius: "12px", overflow: "hidden", height: "120px", position: "relative", zIndex: 10, border: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ position: "relative", height: "100%", overflow: "hidden" }}>
            <div style={{ transform: `translateY(-${winnerScrollY}px)`, transition: "transform 0.05s linear" }}>
              {[...winners, ...winners].map((w, i) => (
                <div key={`${w.id}-${i}`} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 14px", height: "40px", boxSizing: "border-box" }}>
                  <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "linear-gradient(135deg, #7c3aed, #2563eb)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", color: "#fff", fontWeight: 700, flexShrink: 0 }}>
                    {w.username.slice(0, 2)}
                  </div>
                  <span style={{ color: "#9ca3af", fontSize: "0.75rem", flex: 1 }}>
                    {w.username}{w.phone_tail ? ` ****${w.phone_tail}` : ""}
                  </span>
                  <span style={{ color: "#facc15", fontSize: "0.75rem", fontWeight: 700, textAlign: "right" }}>
                    {w.prize_label}
                  </span>
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

      {/* LUCKY WHEEL Title */}
      <div style={{ textAlign: "center", padding: "4px 0", position: "relative", zIndex: 10 }}>
        <span style={{
          fontSize: "1.5rem", fontWeight: 900, letterSpacing: "4px",
          background: "linear-gradient(90deg, #facc15, #f59e0b, #facc15)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          textShadow: "none", filter: "drop-shadow(0 2px 4px rgba(250,204,21,0.3))",
        }}>
          LUCKY WHEEL
        </span>
      </div>

      {/* Wheel Canvas */}
      <div style={{ display: "flex", justifyContent: "center", padding: "8px 10px", position: "relative", zIndex: 10 }}>
        <canvas
          ref={canvasRef}
          width={380}
          height={380}
          style={{ width: "min(90vw, 380px)", height: "min(90vw, 380px)", cursor: spinning ? "not-allowed" : "pointer" }}
          onClick={() => {}}
        />
      </div>

      {/* Spin Button — ตั๋วเท่านั้น */}
      <div style={{ display: "flex", justifyContent: "center", padding: "12px 20px 24px", position: "relative", zIndex: 10 }}>
        <button
          onClick={() => doSpin("ticket")}
          disabled={spinning || ticketBalance < ticketCost}
          style={{
            width: "100%", maxWidth: "320px", padding: "16px 8px", borderRadius: "14px", border: "2px solid rgba(250,204,21,0.4)",
            background: spinning || ticketBalance < ticketCost ? "rgba(30,30,50,0.5)" : "linear-gradient(135deg, #f59e0b, #d97706)",
            color: "#fff", cursor: spinning || ticketBalance < ticketCost ? "not-allowed" : "pointer",
            opacity: spinning || ticketBalance < ticketCost ? 0.5 : 1,
            display: "flex", flexDirection: "column", alignItems: "center", gap: "4px",
          }}
        >
          <span style={{ fontSize: "1rem", fontWeight: 700 }}>หมุน 1 ครั้ง</span>
          <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.85rem", opacity: 0.9 }}>
            🎫 {ticketCost} ใบ
          </span>
        </button>
      </div>

        <style dangerouslySetInnerHTML={{ __html: `
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.5); }
        }
      `}} />
    </div>
  );
}