import { useEffect, useMemo, useState } from "react";
import { useCart } from "context/CartContext";
import { useI18n } from "context/I18nContext";
import { useNotification } from "context/NotificationContext";
import { fetchProductDetail, getErrorTone, getReadableErrorMessage } from "services/api";
import { formatCurrency, stockLabelKey } from "shared/utils/format";
import { IconArrowLeft, IconCart } from "components/Icons";
import { SafeImage } from "components/SafeImage";
import { SectionState } from "components/SectionState";

function getProductSpecRows(product, selectedSku, t, resolveTag) {
  const specSummary = selectedSku?.specSummary
    ? selectedSku.specSummary
        .split("/")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

  const rows = [
    {
      key: "sku",
      label: t("product.spec.sku"),
      value: selectedSku?.skuCode || "-"
    },
    {
      key: "variant",
      label: t("product.spec.variant"),
      value: selectedSku?.name || product.name
    },
    {
      key: "spec",
      label: t("product.spec.summary"),
      value: specSummary.join(" / ") || "-"
    },
    {
      key: "stock",
      label: t("product.spec.availableStock"),
      value: `${selectedSku?.stock ?? "-"}`
    },
    {
      key: "category",
      label: t("product.spec.category"),
      value: product.categoryName
    },
    {
      key: "brand",
      label: t("product.spec.brand"),
      value: product.brand
    }
  ];

  if (product.tags?.length) {
    rows.push({
      key: "tags",
      label: t("product.spec.tags"),
      value: product.tags.map(resolveTag).join(" / ")
    });
  }

  return rows;
}

export function ProductPage({ navigate, slug }) {
  const { addItem } = useCart();
  const { locale, resolveTag, resolveText, t } = useI18n();
  const { pushNotification } = useNotification();
  const [state, setState] = useState({
    loading: true,
    product: null,
    error: "",
    selectedSkuCode: "",
    selectedImageIndex: 0
  });

  useEffect(() => {
    let active = true;

    setState({
      loading: true,
      product: null,
      error: "",
      selectedSkuCode: "",
      selectedImageIndex: 0
    });

    fetchProductDetail(slug)
      .then((product) => {
        if (active) {
          const defaultSku = (product.skus || []).find((sku) => sku.isDefault) || product.skus?.[0];
          setState({
            loading: false,
            product,
            error: "",
            selectedSkuCode: defaultSku?.skuCode || "",
            selectedImageIndex: 0
          });
        }
      })
      .catch((error) => {
        if (active) {
          setState({
            loading: false,
            product: null,
            error,
            selectedSkuCode: "",
            selectedImageIndex: 0
          });
        }
      });

    return () => {
      active = false;
    };
  }, [slug]);

  const selectedSku = useMemo(() => {
    return state.product?.skus?.find((sku) => sku.skuCode === state.selectedSkuCode) || state.product?.skus?.[0];
  }, [state.product, state.selectedSkuCode]);

  const gallery = useMemo(() => {
    const assetImages = (state.product?.galleryImages || []).map((item) => item.imageUrl);
    const skuImages = (state.product?.skus || []).map((sku) => sku.coverImage).filter(Boolean);
    const images = Array.from(new Set([state.product?.coverImage, ...assetImages, ...skuImages].filter(Boolean)));
    if (selectedSku?.coverImage) {
      return Array.from(new Set([selectedSku.coverImage, ...images]));
    }
    return images;
  }, [selectedSku, state.product]);

  const specRows = useMemo(() => {
    if (!state.product) {
      return [];
    }

    return getProductSpecRows(state.product, selectedSku, t, resolveTag).map((row) => ({
      ...row,
      value: row.key === "tags" ? row.value : resolveText(row.value)
    }));
  }, [resolveTag, resolveText, selectedSku, state.product, t]);

  const selectedImage = gallery[state.selectedImageIndex] || selectedSku?.coverImage || state.product?.coverImage;

  useEffect(() => {
    setState((current) => ({
      ...current,
      selectedImageIndex: 0
    }));
  }, [state.selectedSkuCode]);

  if (state.loading) {
    return <SectionState title={t("product.loading.title")} body={t("product.loading.body")} tone="loading" />;
  }

  if (state.error) {
    return (
      <SectionState
        title={t("product.error.title")}
        body={getReadableErrorMessage(state.error, t)}
        tone={getErrorTone(state.error)}
        action={
          <button className="primary-button" type="button" onClick={() => navigate("/catalog")}>
            {t("product.backToCatalog")}
          </button>
        }
      />
    );
  }

  const product = state.product;

  return (
    <div className="page-stack">
      <section className="panel product-detail-panel">
        <div className="product-gallery">
          <div className="gallery-main">
            <SafeImage alt={product.name} src={selectedImage} />
            {gallery.length > 1 ? (
              <>
                <button
                  aria-label={t("product.galleryPrev")}
                  className="gallery-nav gallery-nav-prev"
                  type="button"
                  onClick={() =>
                    setState((current) => ({
                      ...current,
                      selectedImageIndex:
                        current.selectedImageIndex === 0 ? gallery.length - 1 : current.selectedImageIndex - 1
                    }))
                  }
                >
                  ←
                </button>
                <button
                  aria-label={t("product.galleryNext")}
                  className="gallery-nav gallery-nav-next"
                  type="button"
                  onClick={() =>
                    setState((current) => ({
                      ...current,
                      selectedImageIndex: (current.selectedImageIndex + 1) % gallery.length
                    }))
                  }
                >
                  →
                </button>
              </>
            ) : null}
          </div>
          <div className="gallery-thumb-row">
            {gallery.map((image, index) => (
              <button
                className={`gallery-thumb ${index === state.selectedImageIndex ? "is-selected" : ""}`}
                key={image}
                type="button"
                onClick={() => setState((current) => ({ ...current, selectedImageIndex: index }))}
              >
                <SafeImage alt={`${product.name}-${index + 1}`} src={image} />
              </button>
            ))}
          </div>
        </div>

        <div className="product-summary">
          <span className="eyebrow">{resolveText(product.categoryName)}</span>
          <h1>{product.name}</h1>
          <p className="detail-subtitle">{resolveText(product.subtitle)}</p>

          <div className="detail-meta">
            <span>{product.brand}</span>
            <span>{product.rating}</span>
            <span>{t(stockLabelKey(product.stockStatus))}</span>
            <span>
              {t("product.sales")} {product.salesCount}
            </span>
          </div>

          <div className="price-block">
            <strong>{formatCurrency(selectedSku?.salePrice || product.priceFrom, locale)}</strong>
            {selectedSku?.marketPrice || product.marketPrice ? (
              <span>{formatCurrency(selectedSku?.marketPrice || product.marketPrice, locale)}</span>
            ) : null}
          </div>

          <div className="sku-list">
            {(product.skus || []).map((sku) => (
              <button
                className={`sku-card ${selectedSku?.skuCode === sku.skuCode ? "is-selected" : ""}`}
                key={sku.skuCode}
                type="button"
                onClick={() => setState((current) => ({ ...current, selectedSkuCode: sku.skuCode }))}
              >
                <div className="sku-card-copy">
                  <strong>{sku.name}</strong>
                  <p>{sku.specSummary}</p>
                </div>
                <div className="sku-card-footer">
                  <span>{formatCurrency(sku.salePrice, locale)}</span>
                  <small>
                    {t("product.stockLabel")} {sku.stock}
                  </small>
                </div>
              </button>
            ))}
          </div>

          <div className="tag-row">
            {(product.tags || []).map((tag) => (
              <span className="tag-pill muted" key={tag}>
                {resolveTag(tag)}
              </span>
            ))}
          </div>

          <div className="detail-actions">
            <button
              className="primary-button"
              type="button"
              onClick={async () => {
                if (!selectedSku) {
                  return;
                }

                try {
                  await addItem({
                    skuCode: selectedSku.skuCode,
                    productSlug: product.slug,
                    productName: product.name,
                    skuName: selectedSku.name,
                    salePrice: selectedSku.salePrice,
                    marketPrice: selectedSku.marketPrice,
                    stock: selectedSku.stock,
                    coverImage: selectedSku.coverImage || product.coverImage,
                    quantity: 1
                  });
                  pushNotification({
                    tone: "success",
                    title: t("product.added.title"),
                    message: t("product.added.body", { name: product.name })
                  });
                  navigate("/cart");
                } catch (error) {
                  pushNotification({
                    tone: "error",
                    title: t("product.error.title"),
                    message: getReadableErrorMessage(error, t)
                  });
                }
              }}
            >
              <IconCart className="button-icon-svg" />
              {t("product.addToCart")}
            </button>
            <button className="secondary-button" type="button" onClick={() => navigate("/catalog")}>
              <IconArrowLeft className="button-icon-svg" />
              {t("product.backList")}
            </button>
          </div>
        </div>
      </section>

      <section className="panel product-story-panel">
        <div className="section-heading">
          <span>{t("product.descriptionEyebrow")}</span>
          <h2>{t("product.descriptionTitle")}</h2>
          <p>{resolveText(product.description)}</p>
        </div>

        <div className="spec-table">
          {specRows.map((row) => (
            <div className="spec-row" key={row.key}>
              <span>{row.label}</span>
              <strong>{row.value}</strong>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
