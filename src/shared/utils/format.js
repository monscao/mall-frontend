export function formatCurrency(value, locale = "zh-CN") {
  const amount = Number(value || 0);
  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "CNY",
    minimumFractionDigits: 2
  });
  const parts = formatter.formatToParts(amount);
  const currency = parts.find((part) => part.type === "currency")?.value || "";
  const rest = parts
    .filter((part) => part.type !== "currency" && part.type !== "literal")
    .map((part) => part.value)
    .join("");

  if (!currency) {
    return formatter.format(amount);
  }

  return `${currency} ${rest}`;
}

export function stockLabelKey(status) {
  return `stock.${status || "IN_STOCK"}`;
}
