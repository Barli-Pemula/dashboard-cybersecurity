"use client";

import { useEffect, useRef, useState } from "react";

export default function ThreatChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [data, setData] = useState<{ label: string; value: number }[]>([]);

  useEffect(() => {
    const gen = () => {
      const hours = [];
      for (let i = 23; i >= 0; i--) {
        const h = new Date();
        h.setHours(h.getHours() - i);
        hours.push({
          label: h.getHours().toString().padStart(2, "0") + ":00",
          value: Math.floor(Math.random() * 60) + 10,
        });
      }
      return hours;
    };
    setData(gen());
    const iv = setInterval(() => {
      setData((prev) => {
        const nd = [...prev.slice(1)];
        const h = new Date();
        nd.push({
          label: h.getHours().toString().padStart(2, "0") + ":" + h.getMinutes().toString().padStart(2, "0"),
          value: Math.floor(Math.random() * 60) + 10,
        });
        return nd;
      });
    }, 4000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const pad = { top: 16, right: 16, bottom: 28, left: 36 };
    const cw = w - pad.left - pad.right;
    const ch = h - pad.top - pad.bottom;

    ctx.clearRect(0, 0, w, h);
    const max = Math.max(...data.map((d) => d.value), 1);

    // Grid
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + (ch / 4) * i;
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(w - pad.right, y);
      ctx.stroke();

      ctx.fillStyle = "#94a3b8";
      ctx.font = "10px system-ui, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(String(Math.round(max - (max / 4) * i)), pad.left - 6, y + 3);
    }

    // Area gradient
    const grad = ctx.createLinearGradient(0, pad.top, 0, h - pad.bottom);
    grad.addColorStop(0, "rgba(37, 99, 235, 0.08)");
    grad.addColorStop(1, "rgba(37, 99, 235, 0.0)");

    ctx.beginPath();
    ctx.moveTo(pad.left, pad.top + ch);
    data.forEach((pt, i) => {
      const x = pad.left + (cw / (data.length - 1)) * i;
      const y = pad.top + ch - (pt.value / max) * ch;
      if (i === 0) ctx.lineTo(x, y);
      else {
        const px = pad.left + (cw / (data.length - 1)) * (i - 1);
        const py = pad.top + ch - (data[i - 1].value / max) * ch;
        const cpx = (px + x) / 2;
        ctx.bezierCurveTo(cpx, py, cpx, y, x, y);
      }
    });
    ctx.lineTo(w - pad.right, pad.top + ch);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Line
    ctx.beginPath();
    data.forEach((pt, i) => {
      const x = pad.left + (cw / (data.length - 1)) * i;
      const y = pad.top + ch - (pt.value / max) * ch;
      if (i === 0) ctx.moveTo(x, y);
      else {
        const px = pad.left + (cw / (data.length - 1)) * (i - 1);
        const py = pad.top + ch - (data[i - 1].value / max) * ch;
        const cpx = (px + x) / 2;
        ctx.bezierCurveTo(cpx, py, cpx, y, x, y);
      }
    });
    ctx.strokeStyle = "#2563eb";
    ctx.lineWidth = 2;
    ctx.stroke();

    // X labels
    ctx.fillStyle = "#94a3b8";
    ctx.font = "9px system-ui, sans-serif";
    ctx.textAlign = "center";
    data.forEach((pt, i) => {
      if (i % 6 === 0) {
        const x = pad.left + (cw / (data.length - 1)) * i;
        ctx.fillText(pt.label, x, h - 8);
      }
    });
  }, [data]);

  return (
    <div className="card p-4 lg:p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-surface-700">Event activity</p>
        <span className="text-[11px] text-surface-400">Last 24 hours</span>
      </div>
      <canvas ref={canvasRef} className="w-full" style={{ width: "100%", height: "180px" }} />
    </div>
  );
}
