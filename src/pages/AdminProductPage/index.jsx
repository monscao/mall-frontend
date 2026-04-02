import { useEffect, useMemo, useState } from "react";
import { createProduct, fetchCategories, getReadableErrorMessage, resolveAssetUrl, uploadProductImage } from "services/api";
import { IconPlus, IconSparkles } from "components/Icons";
import { useAuth } from "context/AuthContext";
import { useI18n } from "context/I18nContext";
import { useNotification } from "context/NotificationContext";

const MAX_UPLOAD_SIZE = 10 * 1024 * 1024;

function createUploadItem(result, previewUrl, fallbackName) {
  return {
    key: result.fileName,
    url: resolveAssetUrl(result.url),
    name: result.originalName || fallbackName || result.fileName,
    previewUrl: previewUrl || resolveAssetUrl(result.url)
  };
}

function emptySku() {
  return {
    skuCode: "",
    name: "",
    specSummary: "",
    salePrice: "",
    marketPrice: "",
    stock: 1,
    coverImage: "",
    isDefault: false
  };
}

export function AdminProductPage({ navigate }) {
  const { isAdmin, session } = useAuth();
  const { t } = useI18n();
  const { pushNotification } = useNotification();
  const [categories, setCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    categoryCode: "",
    name: "",
    subtitle: "",
    slug: "",
    brand: "",
    coverImage: "",
    coverImageKey: "",
    coverImageName: "",
    priceFrom: "",
    priceTo: "",
    marketPrice: "",
    stockStatus: "IN_STOCK",
    description: "",
    tags: "",
    featured: true,
    onShelf: true,
    galleryImages: [],
    skus: [emptySku()]
  });
  const [uploading, setUploading] = useState({
    cover: false,
    gallery: false
  });

  useEffect(() => {
    fetchCategories().then((data) => {
      setCategories(data);
      if (data[0]) {
        setForm((current) => ({
          ...current,
          categoryCode: current.categoryCode || data[0].code
        }));
      }
    });
  }, []);

  const canSubmit = useMemo(() => Boolean(form.coverImage && form.name && form.categoryCode), [form]);

  if (!isAdmin) {
    return (
      <section className="panel empty-cart">
        <h3>{t("admin.only.title")}</h3>
        <p>{t("admin.only.body")}</p>
      </section>
    );
  }

  const token = session?.token;

  async function handleUpload(files, target) {
    const list = Array.from(files || []);
    if (!list.length || !token) {
      return;
    }

    const oversizedFile = list.find((file) => file.size > MAX_UPLOAD_SIZE);
    if (oversizedFile) {
      const message = t("admin.upload.tooLarge", { name: oversizedFile.name });
      setError(message);
      pushNotification({
        tone: "error",
        title: t("admin.upload.failed"),
        message
      });
      return;
    }

    setUploading((current) => ({ ...current, [target]: true }));
    setError("");

    const previewUrls = list.map((file) => URL.createObjectURL(file));

    const uploaded = [];
    try {
      for (const [index, file] of list.entries()) {
        const result = await uploadProductImage(file, token);
        uploaded.push(createUploadItem(result, previewUrls[index], file.name));
      }

      if (target === "cover") {
        setForm((current) => ({
          ...current,
          coverImage: uploaded[0].url,
          coverImageKey: uploaded[0].key,
          coverImageName: uploaded[0].name
        }));
        pushNotification({
          tone: "success",
          title: t("admin.upload.coverSuccess.title"),
          message: t("admin.upload.coverSuccess.body")
        });
        return;
      }

      setForm((current) => ({
        ...current,
        galleryImages: [...current.galleryImages, ...uploaded]
      }));
      pushNotification({
        tone: "success",
        title: t("admin.upload.gallerySuccess.title"),
        message: t("admin.upload.gallerySuccess.body", { count: uploaded.length })
      });
    } catch (uploadError) {
      const message = getReadableErrorMessage(uploadError, t);
      setError(message);
      pushNotification({
        tone: "error",
        title: t("admin.upload.failed"),
        message
      });
    } finally {
      setUploading((current) => ({ ...current, [target]: false }));
    }
  }

  return (
    <div className="page-stack">
      <section className="panel section-heading">
        <span>{t("admin.eyebrow")}</span>
        <h2>{t("admin.title")}</h2>
        <p>{t("admin.subtitle")}</p>
      </section>

      <section className="admin-product-layout">
        <form
          className="panel admin-product-form"
          onSubmit={async (event) => {
            event.preventDefault();
            setSubmitting(true);
            setError("");
            setMessage("");

            try {
              const payload = {
                ...form,
                tags: form.tags.split(",").map((item) => item.trim()).filter(Boolean),
                galleryImages: form.galleryImages.map((image) => ({
                  key: image.key,
                  url: image.url,
                  name: image.name
                })),
                skus: form.skus.map((sku, index) => ({
                  ...sku,
                  stock: Number(sku.stock),
                  isDefault: index === 0 ? true : sku.isDefault
                }))
              };

              const created = await createProduct(payload, token);
              setMessage(t("admin.create.successInline"));
              pushNotification({
                tone: "success",
                title: t("admin.create.success.title"),
                message: t("admin.create.success.body")
              });
              navigate(`/product/${created.slug}`);
            } catch (submitError) {
              const message = getReadableErrorMessage(submitError, t);
              setError(message);
              pushNotification({
                tone: "error",
                title: t("admin.create.failed"),
                message
              });
            } finally {
              setSubmitting(false);
            }
          }}
        >
          <div className="admin-grid">
            <label>
              <span>{t("admin.field.productName")}</span>
              <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required />
            </label>
            <label>
              <span>{t("admin.field.slug")}</span>
              <input value={form.slug} onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))} />
            </label>
            <label>
              <span>{t("admin.field.brand")}</span>
              <input value={form.brand} onChange={(event) => setForm((current) => ({ ...current, brand: event.target.value }))} />
            </label>
            <label>
              <span>{t("admin.field.category")}</span>
              <select value={form.categoryCode} onChange={(event) => setForm((current) => ({ ...current, categoryCode: event.target.value }))}>
                {categories.map((category) => (
                  <option key={category.code} value={category.code}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label>
            <span>{t("admin.field.subtitle")}</span>
            <input value={form.subtitle} onChange={(event) => setForm((current) => ({ ...current, subtitle: event.target.value }))} />
          </label>

          <label>
            <span>{t("admin.field.description")}</span>
            <textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
          </label>

          <div className="admin-grid">
            <label>
              <span>{t("admin.field.priceFrom")}</span>
              <input value={form.priceFrom} onChange={(event) => setForm((current) => ({ ...current, priceFrom: event.target.value }))} required />
            </label>
            <label>
              <span>{t("admin.field.priceTo")}</span>
              <input value={form.priceTo} onChange={(event) => setForm((current) => ({ ...current, priceTo: event.target.value }))} required />
            </label>
            <label>
              <span>{t("admin.field.marketPrice")}</span>
              <input value={form.marketPrice} onChange={(event) => setForm((current) => ({ ...current, marketPrice: event.target.value }))} required />
            </label>
            <label>
              <span>{t("admin.field.tags")}</span>
              <input value={form.tags} onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))} placeholder="旗舰, 热销, 轻薄" />
            </label>
          </div>

          <div className="upload-section">
            <div className="upload-block upload-block-clickable">
              <span>{t("admin.field.coverUpload")}</span>
              <label className="upload-trigger">
                <input className="upload-input" type="file" accept="image/*" onChange={(event) => handleUpload(event.target.files, "cover")} />
                <span className="upload-trigger-button">
                  <IconPlus className="button-icon-svg" />
                  {uploading.cover ? t("admin.uploading") : t("admin.cover.select")}
                </span>
              </label>
              {form.coverImage ? (
                <div className="uploaded-asset-card">
                  <img alt={form.coverImageName || "cover"} className="upload-preview" src={resolveAssetUrl(form.coverImage)} />
                  <div className="uploaded-asset-meta">
                    <strong>{form.coverImageName || t("admin.cover.defaultName")}</strong>
                    <span>{form.coverImageKey}</span>
                  </div>
                  <button
                    className="text-button uploaded-asset-remove"
                    type="button"
                    onClick={() =>
                      setForm((current) => ({
                        ...current,
                        coverImage: "",
                        coverImageKey: "",
                        coverImageName: ""
                      }))
                    }
                  >
                    {t("common.remove")}
                  </button>
                </div>
              ) : null}
            </div>

            <div className="upload-block upload-block-clickable">
              <span>{t("admin.field.galleryUpload")}</span>
              <label className="upload-trigger">
                <input className="upload-input" type="file" accept="image/*" multiple onChange={(event) => handleUpload(event.target.files, "gallery")} />
                <span className="upload-trigger-button">
                  <IconPlus className="button-icon-svg" />
                  {uploading.gallery ? t("admin.uploading") : t("admin.gallery.add")}
                </span>
              </label>
              <div className="upload-gallery">
                {form.galleryImages.map((image) => (
                  <article className="uploaded-gallery-card" key={image.key}>
                    <img alt={image.name} className="upload-preview small" src={resolveAssetUrl(image.previewUrl || image.url)} />
                    <div className="uploaded-asset-meta">
                      <strong>{image.name}</strong>
                      <span>{image.key}</span>
                    </div>
                    <button
                      className="text-button uploaded-asset-remove"
                      type="button"
                      onClick={() =>
                        setForm((current) => ({
                          ...current,
                          galleryImages: current.galleryImages.filter((item) => item.key !== image.key)
                        }))
                      }
                    >
                      {t("common.remove")}
                    </button>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <div className="admin-sku-section">
            <div className="section-heading-row">
              <h3>{t("admin.sku.heading")}</h3>
              <button
                className="secondary-button admin-add-sku-button"
                type="button"
                onClick={() => setForm((current) => ({ ...current, skus: [...current.skus, emptySku()] }))}
              >
                <IconPlus className="button-icon-svg" />
                {t("admin.sku.add")}
              </button>
            </div>

            <div className="admin-sku-list">
              {form.skus.map((sku, index) => (
                <div className="admin-sku-card" key={`${index}-${sku.skuCode}`}>
                  <div className="admin-grid">
                    <label>
                      <span>SKU Code</span>
                      <input
                        value={sku.skuCode}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            skus: current.skus.map((item, itemIndex) =>
                              itemIndex === index ? { ...item, skuCode: event.target.value } : item
                            )
                          }))
                        }
                      />
                    </label>
                    <label>
                      <span>{t("admin.sku.name")}</span>
                      <input
                        value={sku.name}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            skus: current.skus.map((item, itemIndex) =>
                              itemIndex === index ? { ...item, name: event.target.value } : item
                            )
                          }))
                        }
                      />
                    </label>
                    <label>
                      <span>{t("admin.sku.specSummary")}</span>
                      <input
                        value={sku.specSummary}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            skus: current.skus.map((item, itemIndex) =>
                              itemIndex === index ? { ...item, specSummary: event.target.value } : item
                            )
                          }))
                        }
                      />
                    </label>
                    <label>
                      <span>{t("admin.sku.stock")}</span>
                      <input
                        type="number"
                        value={sku.stock}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            skus: current.skus.map((item, itemIndex) =>
                              itemIndex === index ? { ...item, stock: event.target.value } : item
                            )
                          }))
                        }
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {error ? <p className="form-error">{error}</p> : null}
          {message ? <p className="form-success">{message}</p> : null}

          <button className="primary-button" disabled={!canSubmit || submitting} type="submit">
            <IconSparkles className="button-icon-svg" />
            {submitting ? t("auth.submitting") : t("admin.submit")}
          </button>
        </form>
      </section>
    </div>
  );
}
