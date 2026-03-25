"use client";

import { useEffect, useState, useRef } from "react";
import SeverityBadge from "@/components/ui/SeverityBadge";

interface ThreatEvent {
  id: string;
  type: string;
  severity: string;
  source: string;
  target: string;
  details: string;
  status: string;
  timestamp: string;
}

export default function ThreatFeed() {
  const [threats, setThreats] = useState<ThreatEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const eventSource = new EventSource("/api/threats/stream");
    eventSource.onopen = () => setConnected(true);
    eventSource.onmessage = (event) => {
      try {
        const threat: ThreatEvent = JSON.parse(event.data);
        setThreats((prev) => [threat, ...prev].slice(0, 50));

        // Note: No toast notifications or sound alerts
        // Threats are displayed in "Recent events" list only
      } catch (e) {
        console.error("Parse error:", e);
      }
    };
    eventSource.onerror = () => setConnected(false);
    return () => eventSource.close();
  }, []);

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  return (
    <div className="card p-4 lg:p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-surface-700">Recent events</p>
        <div className="flex items-center gap-1.5">
          <span className={`status-dot ${connected ? "status-dot-online" : "status-dot-danger"}`} />
          <span className="text-[11px] text-surface-400">
            {connected ? "Live" : "Connecting..."}
          </span>
        </div>
      </div>

      <div ref={feedRef} className="space-y-0 max-h-[380px] overflow-y-auto">
        {threats.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-surface-400">Waiting for event data...</p>
          </div>
        ) : (
          threats.map((threat, i) => (
            <div key={threat.id}>
              {i > 0 && <div className="divider" />}
              <div className="py-3 flex items-start gap-3">
                <SeverityBadge severity={threat.severity} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-surface-700 font-medium">{threat.type}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-surface-400 font-mono">
                    <span>{threat.source}</span>
                    <span className="text-surface-300">→</span>
                    <span>{threat.target}</span>
                  </div>
                </div>
                <span className="text-[11px] text-surface-400 shrink-0">
                  {formatTime(threat.timestamp)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
