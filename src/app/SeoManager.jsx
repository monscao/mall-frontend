import { useEffect, useMemo } from "react";
import { useI18n } from "context/I18nContext";

function upsertMeta(selector, attributeName, attributeValue, content) {
  let element = document.head.querySelector(selector);

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attributeName, attributeValue);
    document.head.appendChild(element);
  }

  element.setAttribute("content", content);
}

function upsertLink(selector, rel, href) {
  let element = document.head.querySelector(selector);

  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", rel);
    document.head.appendChild(element);
  }

  element.setAttribute("href", href);
}

export function SeoManager({ pathname, productSlug }) {
  const { t } = useI18n();

  const seo = useMemo(() => {
    if (pathname === "/") {
      return {
        title: t("seo.home.title"),
        description: t("seo.home.description")
      };
    }

    if (pathname === "/catalog") {
      return {
        title: t("seo.catalog.title"),
        description: t("seo.catalog.description")
      };
    }

    if (productSlug) {
      return {
        title: t("seo.product.title"),
        description: t("seo.product.description")
      };
    }

    if (pathname === "/login") {
      return {
        title: t("seo.login.title"),
        description: t("seo.login.description"),
        robots: "noindex,nofollow"
      };
    }

    if (pathname === "/register") {
      return {
        title: t("seo.register.title"),
        description: t("seo.register.description"),
        robots: "noindex,nofollow"
      };
    }

    if (pathname === "/cart" || pathname === "/checkout" || pathname === "/orders" || pathname === "/account") {
      return {
        title: t("seo.account.title"),
        description: t("seo.account.description"),
        robots: "noindex,nofollow"
      };
    }

    return {
      title: t("seo.default.title"),
      description: t("seo.default.description")
    };
  }, [pathname, productSlug, t]);

  useEffect(() => {
    const title = seo.title || "MONSCAO";
    const description = seo.description || t("seo.default.description");
    const robots = seo.robots || "index,follow";
    const canonical = `${window.location.origin}${pathname}`;

    document.title = title;
    document.documentElement.lang = t("seo.lang");

    upsertMeta('meta[name="description"]', "name", "description", description);
    upsertMeta('meta[name="robots"]', "name", "robots", robots);
    upsertMeta('meta[property="og:title"]', "property", "og:title", title);
    upsertMeta('meta[property="og:description"]', "property", "og:description", description);
    upsertMeta('meta[property="og:url"]', "property", "og:url", canonical);
    upsertMeta('meta[name="twitter:title"]', "name", "twitter:title", title);
    upsertMeta('meta[name="twitter:description"]', "name", "twitter:description", description);
    upsertLink('link[rel="canonical"]', "canonical", canonical);
  }, [pathname, seo, t]);

  return null;
}
