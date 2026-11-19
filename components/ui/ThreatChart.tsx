"use client";
import { useEffect, useId, useRef, useState } from "react";
import type { Threat } from "@/lib/types";

export default function ThreatChart({
  threats,
  hours,
}: {
  threats: Threat[];
  hours: number;
}) {
  const id = useId().replace(/:/g, "");
  const [hovered, setHovered] = useState<number | null>(null);
  const area = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(724);
  useEffect(() => {
    const element = area.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.max(260, Math.round(entry.contentRect.width))));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const now = Date.now();
  const buckets = 12;
  const span = hours * 3600000;
  const data = Array.from({ length: buckets }, (_, i) => {
    const start = now - span + (i * span) / buckets;
    const events = threats.filter(
      (threat) =>
        new Date(threat.timestamp).getTime() >= start &&
        new Date(threat.timestamp).getTime() < start + span / buckets,
    );
    return {
      total: events.length,
      blocked: events.filter(
        (event) => event.status === "blocked" || event.status === "resolved",
      ).length,
      label: new Date(start).toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  });
  const max = Math.max(4, ...data.map((item) => item.total));
  const right = width - 24;
  const x = (i: number) => 44 + (i * (right - 44)) / (buckets - 1);
  const y = (value: number) => 208 - (value / max) * 160;
  const line = (key: "total" | "blocked") =>
    data.map((item, i) => `${i ? "L" : "M"}${x(i)},${y(item[key])}`).join(" ");
  const selected = hovered !== null ? data[hovered] : null;
  const total = data.reduce((sum, item) => sum + item.total, 0);
  return (
    <div className="chart-card">
      <div className="chart-heading">
        <div>
          <h2>Threat activity</h2>
          <p>Event distribution across the last {hours} hours</p>
        </div>
        <div className="chart-summary">
          <strong>{total}</strong>
          <span>total events</span>
        </div>
      </div>
      <div className="chart-legend">
        <span>
          <i />
          All events
        </span>
        <span>
          <i />
          Blocked / resolved
        </span>
      </div>
      <div className="chart-area" ref={area}>
        <svg
          viewBox={`0 0 ${width} 248`}
          role="img"
          aria-label={`${total} events in the last ${hours} hours. ${data.reduce((sum, item) => sum + item.blocked, 0)} blocked or resolved.`}
        >
          <defs>
            <linearGradient id={`chart-fill-${id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#62cbb0" stopOpacity=".23" />
              <stop offset="100%" stopColor="#62cbb0" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0, 1, 2, 3, 4].map((index) => (
            <g key={index}>
              <line
                x1="44"
                x2={right}
                y1={48 + index * 40}
                y2={48 + index * 40}
                stroke="#ffffff"
                strokeOpacity=".08"
                strokeDasharray="3 5"
              />
              <text x="29" y={52 + index * 40} textAnchor="end">
                {Math.round(max * (1 - index / 4))}
              </text>
            </g>
          ))}
          <path
            d={`${line("total")} L${right},208 L44,208 Z`}
            fill={`url(#chart-fill-${id})`}
          />
          <path
            d={line("total")}
            fill="none"
            stroke="#6ed4b8"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path
            d={line("blocked")}
            fill="none"
            stroke="#8998b1"
            strokeWidth="2"
            strokeDasharray="5 5"
            strokeLinejoin="round"
          />
          {data.map((item, index) => (
            <g key={index}>
              {index % (width < 450 ? 3 : 2) === 0 && (
                <text x={x(index)} y="238" textAnchor="middle">
                  {item.label}
                </text>
              )}
              <rect
                x={x(index) - 23}
                y="20"
                width="46"
                height="190"
                fill="transparent"
                onMouseEnter={() => setHovered(index)}
                onMouseLeave={() => setHovered(null)}
              />
            </g>
          ))}
          {hovered !== null && (
            <>
              <line
                x1={x(hovered)}
                x2={x(hovered)}
                y1="35"
                y2="208"
                stroke="#6ed4b8"
                strokeOpacity=".4"
              />
              <circle
                cx={x(hovered)}
                cy={y(data[hovered].total)}
                r="4.5"
                fill="#6ed4b8"
                stroke="#162331"
                strokeWidth="3"
              />
            </>
          )}
        </svg>
        {selected && (
          <div className="chart-tooltip" role="status">
            {selected.label} · {selected.total} events · {selected.blocked}{" "}
            blocked / resolved
          </div>
        )}
      </div>
      <details className="chart-data">
        <summary>View chart data</summary>
        <table>
          <caption>Event counts by time interval</caption>
          <thead>
            <tr>
              <th>Time</th>
              <th>All events</th>
              <th>Blocked / resolved</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.label}>
                <td>{item.label}</td>
                <td>{item.total}</td>
                <td>{item.blocked}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
