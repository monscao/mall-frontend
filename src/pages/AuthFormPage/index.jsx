import { useState } from "react";
import { IconStatusWarning } from "components/Icons";
import { useAuth } from "context/AuthContext";
import { useI18n } from "context/I18nContext";
import { useNotification } from "context/NotificationContext";
import { SectionState } from "components/SectionState";
import { getReadableErrorMessage } from "services/api";

export function AuthFormPage({ mode, navigate }) {
  const { isAuthenticated, login, register } = useAuth();
  const { t } = useI18n();
  const { pushNotification } = useNotification();
  const isLogin = mode === "login";
  const copy = {
    title: t(`auth.${mode}.title`),
    submitLabel: t(`auth.${mode}.submit`),
    alternateLabel: t(`auth.${mode}.alt`),
    alternatePath: isLogin ? "/register" : "/login"
  };
  const [form, setForm] = useState({
    username: "",
    password: "",
    nickname: "",
    email: "",
    phone: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (isAuthenticated) {
    return (
      <SectionState
        title={t("auth.already.title")}
        body={t("auth.already.body")}
        tone="info"
        action={
          <button className="primary-button" type="button" onClick={() => navigate("/account")}>
            {t("auth.already.cta")}
          </button>
        }
      />
    );
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      if (isLogin) {
        await login({
          username: form.username,
          password: form.password
        });
        pushNotification({
          tone: "success",
          title: t("auth.loginSuccess.title"),
          message: t("auth.loginSuccess.body")
        });
      } else {
        await register(form);
        pushNotification({
          tone: "success",
          title: t("auth.registerSuccess.title"),
          message: t("auth.registerSuccess.body")
        });
      }

      navigate("/");
    } catch (submitError) {
      const message = getReadableErrorMessage(submitError, t);
      setError(message);
      pushNotification({
        tone: "error",
        title: t(mode === "login" ? "auth.loginFailed.title" : "auth.registerFailed.title"),
        message
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-standalone">
        <div className="auth-card-shell auth-card-shell-standalone">
          <div className="auth-copy auth-copy-compact auth-copy-centered">
            <h1>{copy.title}</h1>
          </div>

          <form className="auth-form auth-form-card auth-form-card-standalone" onSubmit={handleSubmit}>
            <label>
              <span>{t("auth.username")}</span>
              <input
                required
                value={form.username}
                onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
              />
            </label>

            <label>
              <span>{t("auth.password")}</span>
              <input
                required
                minLength={6}
                type="password"
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              />
            </label>

            {!isLogin ? (
              <div className="auth-form-grid">
                <label>
                  <span>{t("auth.nickname")}</span>
                  <input
                    value={form.nickname}
                    onChange={(event) => setForm((current) => ({ ...current, nickname: event.target.value }))}
                  />
                </label>

                <label>
                  <span>{t("auth.phone")}</span>
                  <input
                    value={form.phone}
                    onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                  />
                </label>

                <label className="auth-form-grid-wide">
                  <span>{t("auth.email")}</span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  />
                </label>
              </div>
            ) : null}

            {error ? (
              <div className="form-error-banner" role="alert">
                <IconStatusWarning className="form-error-icon" />
                <span>{error}</span>
              </div>
            ) : null}

            <button className="primary-button auth-submit-button auth-submit-button-standalone" disabled={submitting} type="submit">
              {submitting ? t("auth.submitting") : copy.submitLabel}
            </button>

            {isLogin ? (
              <button className="text-button auth-support-link" type="button">
                {t("auth.help")}
              </button>
            ) : null}

            <button className="text-button auth-alt-link" type="button" onClick={() => navigate(copy.alternatePath)}>
              {copy.alternateLabel}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
