import Icon, { type IconName } from "@/components/ui/Icon";
export default function StatsCard({
  title,
  value,
  detail,
  icon,
  tone = "neutral",
}: {
  title: string;
  value: string | number;
  detail: string;
  icon: IconName;
  tone?: "neutral" | "danger" | "positive";
}) {
  return (
    <div className="stat-card">
      <div className="stat-label">
        <span>{title}</span>
        <Icon name={icon} size={18} />
      </div>
      <div className="stat-value">{value}</div>
      <div className={`stat-detail ${tone}`}>
        <span className="small-dot" />
        {detail}
      </div>
    </div>
  );
}
