export type ProductCategory = {
  id: string;
  fr: string;
  ar: string;
};

export const categories: ProductCategory[] = [
  { id: "bardage-pvc", fr: "Bardage PVC", ar: "بديل الخشب PVC" },
  { id: "moulures-pvc", fr: "Moulures PVC", ar: "إطارات وديكورات PVC" },
  { id: "marbre-pvc", fr: "Marbre PVC", ar: "بديل الرخام PVC" },
  { id: "papier-peint", fr: "Papier peint", ar: "ورق الحائط" },
  { id: "cheminees", fr: "Cheminées", ar: "المدافئ الإلكترونية" },
  { id: "parquet", fr: "Parquet", ar: "أرضيات الباركيه" },
  { id: "tasseaux", fr: "Tasseaux", ar: "أعمدة خشبية للديكور" },
  { id: "accessoires", fr: "Accessoires & Outils", ar: "إكسسوارات وأدوات التثبيت" },
  { id: "other", fr: "Autre", ar: "أخرى / منتجات متنوعة" },
];

export const DEFAULT_CATEGORY_ID = categories[0].id;

export function findCategory(value: string | null | undefined): ProductCategory | undefined {
  if (!value) return undefined;
  return categories.find((c) => c.id === value || c.fr === value || c.ar === value);
}

export function normalizeCategoryId(value: string | null | undefined): string {
  return findCategory(value)?.id ?? value ?? "";
}

export function getCategoryLabel(value: string | null | undefined, locale: string): string {
  const category = findCategory(value);
  if (!category) return value ?? "";
  return locale === "ar" ? category.ar : category.fr;
}

/** Values stored in DB (id + legacy French labels). */
export function getCategoryFilterValues(categoryId: string): string[] {
  const category = findCategory(categoryId);
  if (!category) return [categoryId];
  return [category.id, category.fr];
}
