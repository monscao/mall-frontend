import { useI18n } from "context/I18nContext";

export function NotFoundPage({ navigate }) {
  const { t } = useI18n();

  return (
    <section className="panel empty-cart">
      <h3>{t("notfound.title")}</h3>
      <p>{t("notfound.body")}</p>
      <button className="primary-button" type="button" onClick={() => navigate("/")}>
        {t("notfound.cta")}
      </button>
    </section>
  );
}
