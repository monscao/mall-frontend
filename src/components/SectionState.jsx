export function SectionState({ title, body, action }) {
  return (
    <div className="section-state">
      <h3>{title}</h3>
      {body ? <p>{body}</p> : null}
      {action}
    </div>
  );
}
