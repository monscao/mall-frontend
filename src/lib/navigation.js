export function createCatalogPath(categoryCode, sort = "featured") {
  const search = new URLSearchParams();

  if (categoryCode) {
    search.set("category", categoryCode);
  }

  if (sort) {
    search.set("sort", sort);
  }

  return `/catalog${search.toString() ? `?${search.toString()}` : ""}`;
}
