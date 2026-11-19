export default function SeverityBadge({ severity }: { severity: string }) {
  const s = severity.toLowerCase();
  const className =
    s === "critical"
      ? "badge-critical"
      : s === "high"
        ? "badge-high"
        : s === "medium"
          ? "badge-medium"
          : s === "low"
            ? "badge-low"
            : "badge-info";

  return <span className={className}>{s}</span>;
}
