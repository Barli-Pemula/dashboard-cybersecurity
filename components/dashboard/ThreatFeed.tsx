"use client";
import { useEffect, useMemo, useState } from "react";
import SeverityBadge from "@/components/ui/SeverityBadge";
import Icon from "@/components/ui/Icon";
import Modal from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/Feedback";
import type { Threat } from "@/lib/types";
export default function ThreatFeed({
  threats,
  demo,
}: {
  threats: Threat[];
  demo: boolean;
}) {
  const [query, setQuery] = useState("");
  const [severity, setSeverity] = useState("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Threat | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [connection, setConnection] = useState("Paused");
  const [streamEvents, setStreamEvents] = useState<Threat[]>([]);
  useEffect(() => {
    if (!streaming) {
      setConnection("Paused");
      return;
    }
    setConnection("Connecting");
    const source = new EventSource("/api/threats/stream");
    source.onopen = () => setConnection("Streaming");
    source.onmessage = (event) => {
      try {
        const value = JSON.parse(event.data) as Threat;
        setStreamEvents((previous) => [value, ...previous].slice(0, 100));
      } catch {
        setConnection("Invalid event");
      }
    };
    source.onerror = () => setConnection("Reconnecting");
    return () => source.close();
  }, [streaming]);
  const filtered = useMemo(
    () =>
      [...streamEvents, ...threats].filter(
        (threat) =>
          (severity === "all" || threat.severity === severity) &&
          `${threat.type} ${threat.source} ${threat.target}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [streamEvents, threats, severity, query],
  );
  const pages = Math.max(1, Math.ceil(filtered.length / 6));
  const current = Math.min(page, pages);
  const visible = filtered.slice((current - 1) * 6, current * 6);
  return (
    <>
      <div className="card events-card">
        <div className="events-heading">
          <div>
            <h2>Recent security events</h2>
            <p>
              {demo
                ? "Example events for your demo environment"
                : "Recorded events and optional simulated stream"}
            </p>
          </div>
          <button
            className={`btn-secondary stream-button ${streaming ? "is-streaming" : ""}`}
            onClick={() => setStreaming(!streaming)}
            aria-pressed={streaming}
          >
            <Icon name={streaming ? "pause" : "play"} size={15} />
            {streaming ? "Pause stream" : "Start simulation"}
          </button>
        </div>
        <div className="table-toolbar">
          <div className="search-field">
            <Icon name="search" size={18} />
            <label htmlFor="event-search" className="sr-only">
              Search events
            </label>
            <input
              id="event-search"
              placeholder="Search events, sources, targets…"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="event-filter">
            <label htmlFor="event-severity" className="sr-only">
              Filter event severity
            </label>
            <select
              id="event-severity"
              className="input"
              value={severity}
              onChange={(event) => {
                setSeverity(event.target.value);
                setPage(1);
              }}
            >
              <option value="all">All severities</option>
              {["critical", "high", "medium", "low", "info"].map((value) => (
                <option key={value} value={value}>
                  {value[0].toUpperCase() + value.slice(1)}
                </option>
              ))}
            </select>
            <span className="stream-state">
              <span
                className={`small-dot ${streaming && connection === "Streaming" ? "live" : ""}`}
              />
              {connection}
            </span>
          </div>
        </div>
        {!visible.length ? (
          <EmptyState
            title="No matching events"
            description={
              query || severity !== "all"
                ? "Change your search or severity filter to see more events."
                : "No recorded events yet. Start the simulation to explore an event feed."
            }
          />
        ) : (
          <div className="event-table">
            <div className="event-table-head">
              <span>Event / source</span>
              <span>Severity</span>
              <span>Target</span>
              <span>Status</span>
              <span>Time</span>
              <span />
            </div>
            {visible.map((threat) => (
              <button
                key={threat.id}
                className="event-row"
                onClick={() => setSelected(threat)}
                aria-label={`Inspect ${threat.type}`}
              >
                <span className="event-identity">
                  <span className={`event-icon ${threat.severity}`}>
                    <Icon
                      name={
                        threat.severity === "critical" ||
                        threat.severity === "high"
                          ? "alert"
                          : "activity"
                      }
                      size={18}
                    />
                  </span>
                  <span>
                    <strong>{threat.type}</strong>
                    <small>{threat.source}</small>
                  </span>
                </span>
                <span className="event-severity">
                  <SeverityBadge severity={threat.severity} />
                </span>
                <span className="event-target">{threat.target}</span>
                <span className={`event-status ${threat.status}`}>
                  {threat.status}
                </span>
                <span className="event-time">
                  {new Date(threat.timestamp).toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <Icon name="chevron" size={16} />
              </button>
            ))}
          </div>
        )}
        <div className="table-footer">
          <span>
            {filtered.length
              ? `${(current - 1) * 6 + 1}–${Math.min(current * 6, filtered.length)} of ${filtered.length} events`
              : "0 events"}
          </span>
          <div>
            <button
              className="pagination-button"
              disabled={current === 1}
              onClick={() => setPage(current - 1)}
            >
              Previous
            </button>
            <span>
              {current} / {pages}
            </span>
            <button
              className="pagination-button"
              disabled={current === pages}
              onClick={() => setPage(current + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
      {selected && (
        <Modal title="Event details" onClose={() => setSelected(null)}>
          <div className="event-detail">
            <SeverityBadge severity={selected.severity} />
            <h3>{selected.type}</h3>
            <p>{selected.details}</p>
            <dl>
              <div>
                <dt>Source</dt>
                <dd className="mono">{selected.source}</dd>
              </div>
              <div>
                <dt>Target</dt>
                <dd>{selected.target}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd className="capitalize">{selected.status}</dd>
              </div>
              <div>
                <dt>Recorded at</dt>
                <dd>{new Date(selected.timestamp).toLocaleString()}</dd>
              </div>
            </dl>
            <p className="disclosure">
              {selected.id.startsWith("demo-") ||
              selected.id.startsWith("threat-")
                ? "This is a simulated event."
                : "An event from your recorded threat feed."}
            </p>
          </div>
        </Modal>
      )}
    </>
  );
}
