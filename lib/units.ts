export type PriceUnit = {
  id: string;
  fr: string;
  ar: string;
};

export const priceUnits: PriceUnit[] = [
  { id: "pièce", fr: "pièce", ar: "قطعة" },
  { id: "m²", fr: "m²", ar: "م²" },
  { id: "rouleau", fr: "rouleau", ar: "لفة" },
  { id: "panneau", fr: "panneau", ar: "لوح" },
  { id: "ml", fr: "ml", ar: "متر طولي" },
];

export function getUnitLabel(value: string | null | undefined, locale: string): string {
  const fallback = value ?? "pièce";
  const unit = priceUnits.find((u) => u.id === value || u.fr === value || u.ar === value);
  if (!unit) return fallback;
  return locale === "ar" ? unit.ar : unit.fr;
}
