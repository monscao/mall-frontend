import { IconSparkles } from "components/Icons";

export function EmptyState({ title, body, action, className = "", framed = true, icon = null }) {
  return (
    <section className={`${framed ? "panel " : ""}empty-state ${className}`.trim()}>
      <div className="empty-state-icon">{icon || <IconSparkles className="notification-icon-svg" />}</div>
      <div className="empty-state-copy">
        <h3>{title}</h3>
        {body ? <p>{body}</p> : null}
      </div>
      {action ? <div className="empty-state-action">{action}</div> : null}
    </section>
  );
}
