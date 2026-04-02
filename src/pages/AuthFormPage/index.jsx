import { useState } from "react";
import { useAuth } from "context/AuthContext";
import { useI18n } from "context/I18nContext";
import { useNotification } from "context/NotificationContext";
import { getReadableErrorMessage } from "services/api";

export function AuthFormPage({ mode, navigate }) {
  const { login, register } = useAuth();
  const { t } = useI18n();
  const { pushNotification } = useNotification();
  const copy = {
    eyebrow: t(`auth.${mode}.eyebrow`),
    title: t(`auth.${mode}.title`),
    subtitle: t(`auth.${mode}.subtitle`),
    submitLabel: t(`auth.${mode}.submit`),
    alternateLabel: t(`auth.${mode}.alt`),
    alternatePath: mode === "login" ? "/register" : "/login"
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      if (mode === "login") {
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
        title: t("auth.requestFailed.title"),
        message
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="auth-page panel">
      <div className="auth-copy">
        <span className="eyebrow">{copy.eyebrow}</span>
        <h1>{copy.title}</h1>
        <p>{copy.subtitle}</p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
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

        {mode === "register" ? (
          <>
            <label>
              <span>{t("auth.nickname")}</span>
              <input
                value={form.nickname}
                onChange={(event) => setForm((current) => ({ ...current, nickname: event.target.value }))}
              />
            </label>

            <label>
              <span>{t("auth.email")}</span>
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              />
            </label>

            <label>
              <span>{t("auth.phone")}</span>
              <input
                value={form.phone}
                onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
              />
            </label>
          </>
        ) : null}

        {error ? <p className="form-error">{error}</p> : null}

        <button className="primary-button" disabled={submitting} type="submit">
          {submitting ? t("auth.submitting") : copy.submitLabel}
        </button>

        <button className="text-button align-start" type="button" onClick={() => navigate(copy.alternatePath)}>
          {copy.alternateLabel}
        </button>
      </form>
    </section>
  );
}
