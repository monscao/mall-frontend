import { SectionState } from "components/SectionState";
import { useAuth } from "context/AuthContext";
import { useI18n } from "context/I18nContext";

export function UserProfilePage({ navigate }) {
  const { isAuthenticated, session } = useAuth();
  const { t } = useI18n();

  if (!isAuthenticated) {
    return (
      <SectionState
        title={t("profile.auth.title")}
        body={t("profile.auth.body")}
        action={
          <button className="primary-button" type="button" onClick={() => navigate("/login")}>
            {t("profile.auth.cta")}
          </button>
        }
      />
    );
  }

  const user = session?.currentUser;

  return (
    <div className="page-stack">
      <section className="account-overview">
        <div className="account-copy">
          <h1>{t("profile.title")}</h1>
          <p>{t("profile.subtitle")}</p>
        </div>
      </section>

      <section className="account-grid">
        <article className="panel account-card">
          <span className="account-label">{t("profile.username")}</span>
          <strong>{user?.username || session?.username}</strong>
        </article>
        <article className="panel account-card">
          <span className="account-label">{t("profile.nickname")}</span>
          <strong>{user?.nickname || t("profile.notSet")}</strong>
        </article>
        <article className="panel account-card">
          <span className="account-label">{t("profile.email")}</span>
          <strong>{user?.email || t("profile.notSet")}</strong>
        </article>
        <article className="panel account-card">
          <span className="account-label">{t("profile.phone")}</span>
          <strong>{user?.phone || t("profile.notSet")}</strong>
        </article>
        <article className="panel account-card">
          <span className="account-label">{t("profile.roles")}</span>
          <strong>{(user?.roleCodes || session?.roleCodes || []).join(", ") || "CUSTOMER"}</strong>
        </article>
        <article className="panel account-card">
          <span className="account-label">{t("profile.status")}</span>
          <strong>{user?.enabled === false ? t("profile.status.disabled") : t("profile.status.active")}</strong>
        </article>
      </section>
    </div>
  );
}
