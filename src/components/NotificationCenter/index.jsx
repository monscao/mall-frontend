import { useNotification } from "context/NotificationContext";
import { IconBell, IconSparkles } from "components/Icons";

function NotificationIcon({ tone }) {
  if (tone === "success") {
    return <IconSparkles className="notification-icon-svg" />;
  }

  return <IconBell className="notification-icon-svg" />;
}

export function NotificationCenter() {
  const { notifications, removeNotification } = useNotification();

  return (
    <div className="notification-stack" aria-live="polite" aria-relevant="additions text">
      {notifications.map((item) => (
        <article className={`notification-card is-${item.tone}`} key={item.id}>
          <div className={`notification-icon tone-${item.tone}`}>
            <NotificationIcon tone={item.tone} />
          </div>
          <div className="notification-copy">
            <strong>{item.title}</strong>
            {item.message ? <p>{item.message}</p> : null}
          </div>
          <button className="notification-close" type="button" onClick={() => removeNotification(item.id)}>
            ×
          </button>
        </article>
      ))}
    </div>
  );
}
