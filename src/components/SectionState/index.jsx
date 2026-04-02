import { IconStatusCloudOff, IconStatusInfo, IconStatusWarning } from "components/Icons";

const iconsByTone = {
  info: IconStatusInfo,
  loading: IconStatusInfo,
  empty: IconStatusInfo,
  error: IconStatusWarning,
  network: IconStatusCloudOff
};

export function SectionState({ title, body, action, tone = "info" }) {
  const StateIcon = iconsByTone[tone] || IconStatusInfo;

  return (
    <div className={`section-state section-state-${tone}`}>
      <div className={`section-state-icon section-state-icon-${tone}`}>
        <StateIcon className="section-state-icon-svg" />
      </div>
      <div className="section-state-copy">
        <h3>{title}</h3>
        {body ? <p>{body}</p> : null}
      </div>
      {action}
    </div>
  );
}
