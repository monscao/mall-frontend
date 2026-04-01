export function formatCurrency(value) {
  const amount = Number(value || 0);

  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    minimumFractionDigits: 2
  }).format(amount);
}

export function stockLabel(status) {
  if (status === "LOW_STOCK") {
    return "库存紧张";
  }

  if (status === "OUT_OF_STOCK") {
    return "暂时缺货";
  }

  return "现货供应";
}
