export const PRICING_METHOD_LABELS: Record<string, string> = {
  hpp: "HPP",
  markup: "Markup",
};

export const INVENTORY_METHOD_LABELS: Record<string, string> = {
  fifo: "FIFO",
  lifo: "LIFO",
  average: "Rata-rata",
};

export const UNKNOWN_PRICING_METHOD_LABEL = "Metode harga tidak dikenal";
export const UNKNOWN_INVENTORY_METHOD_LABEL = "Metode inventori tidak dikenal";

export function formatPricingMethodLabel(method: string | null | undefined): string {
  if (!method) {
    return UNKNOWN_PRICING_METHOD_LABEL;
  }

  return PRICING_METHOD_LABELS[method] ?? UNKNOWN_PRICING_METHOD_LABEL;
}

export function formatInventoryMethodLabel(method: string | null | undefined): string {
  if (!method) {
    return UNKNOWN_INVENTORY_METHOD_LABEL;
  }

  return INVENTORY_METHOD_LABELS[method] ?? UNKNOWN_INVENTORY_METHOD_LABEL;
}
