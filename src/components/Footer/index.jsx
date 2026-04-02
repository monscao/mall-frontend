import { useI18n } from "context/I18nContext";
import { AppLink } from "components/AppLink";
import { IconBell, IconInstagram, IconLinkedIn, IconYouTube } from "components/Icons";

export function Footer({ navigate }) {
  const { language, t } = useI18n();
  const footerGroups = [
    {
      title: t("footer.mall"),
      links: [
        { label: t("footer.home"), to: "/" },
        { label: t("footer.catalog"), to: "/catalog" },
        { label: t("footer.cart"), to: "/cart" }
      ]
    },
    {
      title: t("footer.account"),
      links: [
        { label: t("footer.login"), to: "/login" },
        { label: t("footer.register"), to: "/register" },
        { label: t("footer.orders"), to: "/orders" },
        { label: t("footer.latest"), to: "/catalog?sort=latest" }
      ]
    },
    {
      title: t("footer.service"),
      links: [
        { label: t("footer.hot"), to: "/catalog?sort=sales" },
        { label: t("footer.phones"), to: "/catalog?category=phones" },
        { label: t("footer.laptops"), to: "/catalog?category=laptops" }
      ]
    },
    {
      title: t("footer.section.help"),
      links: [
        { label: t("footer.help.shipping"), to: "/help?section=shipping" },
        { label: t("footer.help.payment"), to: "/help?section=payment" },
        { label: t("footer.help.support"), to: "/help?section=support" }
      ]
    },
    {
      title: t("footer.section.featured"),
      links: [
        { label: t("footer.featured.audio"), to: "/catalog?category=audio" },
        { label: t("footer.featured.wearables"), to: "/catalog?category=wearables" },
        { label: t("footer.latest"), to: "/catalog?sort=latest" }
      ]
    }
  ];

  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="footer-brand-column footer-brand-column-wide">
          <div className="footer-brand">
            <span className="brand-mark">AL</span>
            <div>
              <h3>{t("footer.title")}</h3>
              <p>{t("footer.subtitle")}</p>
            </div>
          </div>
          <div className="footer-badge-row">
            <span className="footer-badge">{t("footer.badge.1")}</span>
            <span className="footer-badge">{t("footer.badge.2")}</span>
            <span className="footer-badge">{t("footer.badge.3")}</span>
          </div>
        </div>

        <div className="footer-callout footer-subscribe-card">
          <span className="eyebrow">{t("footer.callout.eyebrow")}</span>
          <h3>{t("footer.callout.title")}</h3>
          <p>{t("footer.callout.body")}</p>
          <div className="footer-subscribe-row">
            <input
              className="footer-subscribe-input"
              placeholder={t("footer.callout.placeholder")}
              type="email"
            />
            <button className="secondary-button footer-subscribe-button" type="button">
              <IconBell className="button-icon-svg" />
              {t("footer.callout.button")}
            </button>
          </div>
        </div>
      </div>

      <div className="footer-links footer-links-expanded">
        {footerGroups.map((group) => (
          <section key={group.title}>
            <span>{group.title}</span>
            {group.links.map((link, index) => (
              <AppLink className="footer-link" key={`${group.title}-${link.to}-${index}`} navigate={navigate} to={link.to}>
                {link.label}
              </AppLink>
            ))}
          </section>
        ))}
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-left">
          <span>{t("footer.bottom.left")}</span>
          <span>{t("footer.bottom.right")}</span>
        </div>
        <div className="footer-bottom-right">
          <span className="footer-social" aria-hidden="true">
            <IconLinkedIn className="footer-social-icon" />
          </span>
          <span className="footer-social" aria-hidden="true">
            <IconInstagram className="footer-social-icon" />
          </span>
          <span className="footer-social" aria-hidden="true">
            <IconYouTube className="footer-social-icon" />
          </span>
          <span className="footer-meta-pill">{t(language === "zh" ? "footer.language.switch.zh" : "footer.language.switch.en")}</span>
        </div>
      </div>
    </footer>
  );
}
