export function createCatalogPath(categoryOrOptions, sort = "featured") {
  const options =
    typeof categoryOrOptions === "object" && categoryOrOptions !== null
      ? categoryOrOptions
      : { categoryCode: categoryOrOptions, sort };

  const search = new URLSearchParams();
  const categoryCode = options.categoryCode || "";
  const nextSort = options.sort || "featured";
  const keyword = options.keyword || options.q || "";
  const page = Number(options.page || 1);

  if (categoryCode) {
    search.set("category", categoryCode);
  }

  if (nextSort) {
    search.set("sort", nextSort);
  }

  if (keyword) {
    search.set("q", keyword);
  }

  if (page > 1) {
    search.set("page", String(page));
  }

  return `/catalog${search.toString() ? `?${search.toString()}` : ""}`;
}
