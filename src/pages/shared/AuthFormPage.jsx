import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

const authCopy = {
  login: {
    eyebrow: "Welcome Back",
    title: "登录你的商城账户",
    subtitle: "登录后可以保留购物车浏览节奏，并同步当前用户身份。",
    submitLabel: "立即登录",
    alternateLabel: "还没有账号？去注册",
    alternatePath: "/register"
  },
  register: {
    eyebrow: "Create Account",
    title: "创建新账户",
    subtitle: "注册后会直接获得 CUSTOMER 身份与登录 token。",
    submitLabel: "创建账户",
    alternateLabel: "已经有账号？去登录",
    alternatePath: "/login"
  }
};

export function AuthFormPage({ mode, navigate }) {
  const { login, register } = useAuth();
  const copy = authCopy[mode];
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
      } else {
        await register(form);
      }

      navigate("/");
    } catch (submitError) {
      setError(submitError.message);
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
          <span>用户名</span>
          <input
            required
            value={form.username}
            onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
          />
        </label>

        <label>
          <span>密码</span>
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
              <span>昵称</span>
              <input
                value={form.nickname}
                onChange={(event) => setForm((current) => ({ ...current, nickname: event.target.value }))}
              />
            </label>

            <label>
              <span>邮箱</span>
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              />
            </label>

            <label>
              <span>手机号</span>
              <input
                value={form.phone}
                onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
              />
            </label>
          </>
        ) : null}

        {error ? <p className="form-error">{error}</p> : null}

        <button className="primary-button" disabled={submitting} type="submit">
          {submitting ? "提交中..." : copy.submitLabel}
        </button>

        <button className="text-button align-start" type="button" onClick={() => navigate(copy.alternatePath)}>
          {copy.alternateLabel}
        </button>
      </form>
    </section>
  );
}
