import Icon from "@/components/ui/Icon";
export function ErrorMessage({
  message,
  retry,
}: {
  message: string;
  retry?: () => void;
}) {
  return (
    <div className="error-message" role="alert">
      <Icon name="alert" />
      <div>
        <p>{message}</p>
        {retry && (
          <button className="text-link" onClick={retry}>
            Try again
          </button>
        )}
      </div>
    </div>
  );
}
export function LoadingState({
  label = "Loading workspace",
}: {
  label?: string;
}) {
  return (
    <div className="loading-state" role="status">
      <span className="loading-spinner" />
      <span>{label}…</span>
    </div>
  );
}
export function EmptyState({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="empty-state">
      <Icon name="reports" size={28} />
      <h3>{title}</h3>
      <p>{description}</p>
      {children}
    </div>
  );
}
