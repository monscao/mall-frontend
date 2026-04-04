import { useEffect, useState } from "react";
import { ProductCard } from "components/ProductCard";
import { SafeImage } from "components/SafeImage";
import { SectionState } from "components/SectionState";
import { IconArrowRight, IconSparkles } from "components/Icons";
import { useI18n } from "context/I18nContext";
import { fetchHome, getErrorTone, getReadableErrorMessage } from "services/api";
import { formatCurrency } from "shared/utils/format";
import { createCatalogPath } from "shared/utils/navigation";

export function HomePage({ navigate }) {
  const { locale, resolveText, t } = useI18n();
  const [state, setState] = useState({
    loading: true,
    data: null,
    error: ""
  });

  useEffect(() => {
    let active = true;

    fetchHome()
      .then((data) => {
        if (active) {
          setState({
            loading: false,
            data,
            error: ""
          });
        }
      })
      .catch((error) => {
        if (active) {
          setState({
            loading: false,
            data: null,
            error
          });
        }
      });

    return () => {
      active = false;
    };
  }, []);

  if (state.loading) {
    return <SectionState title={t("home.loading.title")} body={t("home.loading.body")} tone="loading" />;
  }

  if (state.error) {
    return (
      <SectionState
        title={t("home.error.title")}
        body={getReadableErrorMessage(state.error, t)}
        tone={getErrorTone(state.error)}
        action={
          <button className="primary-button" type="button" onClick={() => window.location.reload()}>
            {t("common.retry")}
          </button>
        }
      />
    );
  }

  const data = state.data;
  const heroProduct = data?.hero?.product;
  const heroSecondaryCategory = (data?.featuredCategories || [])[0];

  return (
    <div className="page-stack">
      <section className="hero-panel">
        <div className="hero-copy">
          <span className="eyebrow">{resolveText(data.hero?.eyebrow)}</span>
          <h1>{resolveText(data.hero?.title)}</h1>
          <p>{resolveText(data.hero?.subtitle)}</p>
          <div className="hero-cta">
            <button className="primary-button" type="button" onClick={() => navigate("/catalog")}>
              <IconSparkles className="button-icon-svg" />
              {t("home.enter")}
            </button>
            <button
              className="secondary-button"
              type="button"
              onClick={() => navigate(createCatalogPath("phones", "featured"))}
            >
              <IconArrowRight className="button-icon-svg" />
              {t("home.browsePhones")}
            </button>
          </div>
        </div>

        {heroProduct ? (
          <div className="hero-product">
            <SafeImage alt={heroProduct.name} src={heroProduct.coverImage} />
            <div className="hero-product-card">
              <div className="hero-product-copy">
                <h2>{heroProduct.name}</h2>
                <p>{resolveText(heroProduct.subtitle)}</p>
              </div>
              <div className="hero-product-footer">
                <span className="price hero-product-price">{formatCurrency(heroProduct.priceFrom, locale)}</span>
                <button className="text-link" type="button" onClick={() => navigate("/catalog")}>
                  {t("home.continue")}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {heroSecondaryCategory ? (
          <button
            className="hero-secondary-card"
            type="button"
            onClick={() => navigate(createCatalogPath(heroSecondaryCategory.code, "featured"))}
          >
            <div className="hero-secondary-copy">
              <span className="eyebrow">{heroSecondaryCategory.code}</span>
              <strong>{resolveText(heroSecondaryCategory.name)}</strong>
              <p>{resolveText(heroSecondaryCategory.description)}</p>
            </div>
            <IconArrowRight className="button-icon-svg" />
          </button>
        ) : null}
      </section>

      <section className="panel">
        <div className="section-heading section-heading-simple">
          <h2>{t("home.featuredCategories")}</h2>
        </div>

        <div className="category-grid">
          {(data.featuredCategories || []).map((category) => (
            <button
              className="category-card"
              key={category.code}
              type="button"
              onClick={() => navigate(createCatalogPath(category.code, "featured"))}
            >
              <SafeImage alt={category.name} src={category.bannerImage} />
              <div className="overlay" />
              <div className="category-content">
                <span>{category.code}</span>
                <h3>{resolveText(category.name)}</h3>
                <p>{resolveText(category.description)}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {(data.sections || []).map((section) => (
        <section className="panel" key={section.code}>
          <div className="section-heading section-heading-row">
            <div className="section-heading-copy">
              <span>{section.code}</span>
              <h2>{resolveText(section.title)}</h2>
            </div>
            <button className="text-link section-more-link" type="button" onClick={() => navigate("/catalog")}>
              {t("home.more")}
              <IconArrowRight className="button-icon-svg" />
            </button>
          </div>

          <div className="product-grid">
            {(section.products || []).map((product) => (
              <ProductCard key={`${section.code}-${product.slug || product.name}`} navigate={navigate} product={product} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
