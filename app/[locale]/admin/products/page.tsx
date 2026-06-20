"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  categories,
  DEFAULT_CATEGORY_ID,
  getCategoryLabel,
  normalizeCategoryId,
} from "@/lib/categories";
import { priceUnits, getUnitLabel } from "@/lib/units";
import { useTranslations, useLocale } from "next-intl";
import {
  Squares2X2Icon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";

// Supabase Storage bucket for product images/videos (must exist in Supabase Storage).
const STORAGE_BUCKET = "products";

const isVideoUrl = (url: string): boolean => /\.(mp4|webm|mov|avi|quicktime)(\?|$)/i.test(url);
const isVideoFile = (file: File): boolean => file.type.startsWith("video/");

function slugify(text: string): string {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const navItems = [
  { labelKey: "nav_dashboard", href: "/admin/dashboard", icon: "dashboard" },
  { labelKey: "nav_properties", href: "/admin/products", icon: "properties" },
  { labelKey: "nav_messages", href: "/admin/messages", icon: "messages" },
];

function getIcon(iconType: string) {
  switch (iconType) {
    case "dashboard":
      return <Squares2X2Icon className="h-5 w-5" />;
    case "properties":
      return (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      );
    case "messages":
      return (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
        </svg>
      );
    case "evaluations":
      return <ClipboardDocumentCheckIcon className="h-5 w-5" />;
    default:
      return null;
  }
}

interface Product {
  id: string;
  title: string;
  slug: string;
  category: string;
  dimensions: string | null;
  thickness: string | null;
  price: number;
  price_unit: string | null;
  is_promotion: boolean;
  promo_price: number | null;
  free_delivery: boolean;
  stock_status: string;
  is_visible: boolean;
  images?: string[];
  description?: string;
}

const emptyForm = {
  title: "",
  category: DEFAULT_CATEGORY_ID,
  dimensions: "",
  thickness: "",
  price: "",
  price_unit: "pièce",
  is_promotion: false,
  promo_price: "",
  free_delivery: false,
  stock_status: "in_stock",
  is_visible: true,
  description: "",
};

export default function AdminProductsPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("admin");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStock, setFilterStock] = useState("");
  const [formData, setFormData] = useState(emptyForm);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [saveError, setSaveError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [mainImageIndex, setMainImageIndex] = useState<number>(0);
  const [objectUrls, setObjectUrls] = useState<string[]>([]);
  const [notification, setNotification] = useState<string>("");
  const [fetchError, setFetchError] = useState<string>("");

  useEffect(() => {
    async function checkAuth() {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error || !data.session) {
          router.push(`/${locale}/admin`);
          return;
        }
        setIsCheckingAuth(false);
        await fetchProducts();
      } catch {
        router.push(`/${locale}/admin`);
      }
    }
    checkAuth();
  }, [router]);

  useEffect(() => {
    return () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [objectUrls]);

  async function fetchProducts() {
    setLoading(true);
    setFetchError("");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setFetchError(t("session_expired"));
        setProducts([]);
        return;
      }

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data ?? []);
    } catch (err) {
      console.error("Error fetching products:", err);
      const message = err instanceof Error ? err.message : t("load_products_error");
      setFetchError(message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    setLogoutLoading(true);
    try {
      await supabase.auth.signOut();
      router.push(`/${locale}/admin`);
    } catch {
      setLogoutLoading(false);
    }
  }

  function extractFilePathFromUrl(imageUrl: string): string | null {
    try {
      const url = new URL(imageUrl);
      const pathParts = url.pathname.split("/public/");
      if (pathParts.length < 2) return null;
      const pathComponents = pathParts[1].split("/");
      if (pathComponents.length < 2) return null;
      return pathComponents.slice(1).join("/");
    } catch {
      return null;
    }
  }

  async function deleteImageFromStorage(imageUrl: string): Promise<void> {
    const filePath = extractFilePathFromUrl(imageUrl);
    if (!filePath) return;
    const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([filePath]);
    if (error) {
      console.error("Storage remove error:", error);
      return;
    }
    setNotification(t("image_deleted"));
    setTimeout(() => setNotification(""), 3000);
  }

  async function deleteImagesFromStorage(imageUrls: string[]): Promise<void> {
    const filePaths = imageUrls
      .map((url) => extractFilePathFromUrl(url))
      .filter((p): p is string => p !== null);
    if (filePaths.length === 0) return;
    await supabase.storage.from(STORAGE_BUCKET).remove(filePaths);
  }

  async function handleDeleteProduct(id: string) {
    try {
      const product = products.find((p) => p.id === id);
      if (product?.images && product.images.length > 0) {
        await deleteImagesFromStorage(product.images);
      }
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Error deleting product:", err);
      alert(t("delete_product_error"));
    }
  }

  function moveMainImageToFront(images: string[], mainIndex: number): string[] {
    if (mainIndex <= 0 || mainIndex >= images.length) return images;
    const reordered = [...images];
    const mainImage = reordered.splice(mainIndex, 1)[0];
    return [mainImage, ...reordered];
  }

  async function handleSaveProduct(e: React.FormEvent) {
    e.preventDefault();
    setSaveError("");
    setIsSaving(true);

    try {
      const newlyUploadedUrls: string[] = [];

      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { error: uploadError } = await supabase.storage.from(STORAGE_BUCKET).upload(filePath, file);
        if (uploadError) throw new Error(t("upload_failed", { index: i + 1, message: uploadError.message }));

        const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);
        newlyUploadedUrls.push(urlData.publicUrl);
      }

      const finalImageUrls = [...existingImages, ...newlyUploadedUrls];
      const reorderedImages = moveMainImageToFront(finalImageUrls, mainImageIndex);

      const baseSlug = slugify(formData.title) || "produit";
      const productData = {
        title: formData.title,
        slug: editingProductId ? undefined : `${baseSlug}-${Date.now().toString(36)}`,
        category: formData.category,
        dimensions: formData.dimensions || null,
        thickness: formData.thickness || null,
        price: Number(formData.price),
        price_unit: formData.price_unit,
        is_promotion: formData.is_promotion,
        promo_price: formData.is_promotion && formData.promo_price ? Number(formData.promo_price) : null,
        free_delivery: formData.free_delivery,
        stock_status: formData.stock_status,
        is_visible: formData.is_visible,
        description: formData.description || null,
        images: reorderedImages,
      };

      if (editingProductId) {
        const { slug, ...updateData } = productData;
        const { data: updatedRows, error: updateError } = await supabase
          .from("products")
          .update(updateData)
          .eq("id", editingProductId)
          .select("*");
        if (updateError) throw new Error(updateError.message || t("update_failed"));
        if (updatedRows?.[0]) {
          setProducts((prev) => prev.map((p) => (p.id === editingProductId ? updatedRows[0] : p)));
        } else {
          await fetchProducts();
        }
      } else {
        const { data: insertedRows, error: insertError } = await supabase
          .from("products")
          .insert(productData)
          .select("*");
        if (insertError) throw new Error(insertError.message || t("save_failed"));
        if (insertedRows?.[0]) {
          setProducts((prev) => [insertedRows[0], ...prev]);
        } else {
          await fetchProducts();
        }
      }

      cleanupAndClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t("save_error_generic");
      setSaveError(errorMessage);
      console.error("Full error:", err);
    } finally {
      setIsSaving(false);
    }
  }

  function cleanupAndClose() {
    objectUrls.forEach((url) => URL.revokeObjectURL(url));
    setFormData(emptyForm);
    setImageFiles([]);
    setExistingImages([]);
    setPreviewImages([]);
    setObjectUrls([]);
    setMainImageIndex(0);
    setEditingProductId(null);
    setShowModal(false);
    setSaveError("");
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setImageFiles((prev) => [...prev, ...files]);
    const newObjectUrls: string[] = [];
    files.forEach((file) => {
      const objectUrl = URL.createObjectURL(file);
      newObjectUrls.push(objectUrl);
    });
    setObjectUrls((prev) => [...prev, ...newObjectUrls]);
    setPreviewImages((prev) => [...prev, ...newObjectUrls]);
    e.target.value = "";
  }

  function removePreviewImage(index: number) {
    const isExisting = index < existingImages.length;
    if (isExisting) {
      const imageUrl = existingImages[index];
      deleteImageFromStorage(imageUrl).then(() => {
        const updated = existingImages.filter((_, i) => i !== index);
        setExistingImages(updated);
        if (mainImageIndex >= updated.length && mainImageIndex > 0) setMainImageIndex(mainImageIndex - 1);
      });
    } else {
      const fileIndex = index - existingImages.length;
      if (previewImages[fileIndex]) URL.revokeObjectURL(previewImages[fileIndex]);
      setImageFiles((prev) => prev.filter((_, i) => i !== fileIndex));
      setPreviewImages((prev) => prev.filter((_, i) => i !== fileIndex));
      setObjectUrls((prev) => prev.filter((_, i) => i !== fileIndex));
      if (mainImageIndex >= existingImages.length + imageFiles.length && mainImageIndex > 0)
        setMainImageIndex(mainImageIndex - 1);
    }
  }

  async function handleToggleVisible(id: string, current: boolean) {
    try {
      const { error } = await supabase.from("products").update({ is_visible: !current }).eq("id", id);
      if (error) throw error;
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, is_visible: !current } : p)));
    } catch (err) {
      console.error("Error updating visibility:", err);
    }
  }

  function closeSidebar() {
    setSidebarOpen(false);
  }

  function handleEditProduct(product: Product) {
    setFormData({
      title: product.title,
      category: normalizeCategoryId(product.category) || DEFAULT_CATEGORY_ID,
      dimensions: product.dimensions || "",
      thickness: product.thickness || "",
      price: product.price?.toString() || "",
      price_unit: product.price_unit || "pièce",
      is_promotion: product.is_promotion || false,
      promo_price: product.promo_price?.toString() || "",
      free_delivery: product.free_delivery || false,
      stock_status: product.stock_status || "in_stock",
      is_visible: product.is_visible ?? true,
      description: product.description || "",
    });
    setExistingImages(product.images || []);
    setMainImageIndex(0);
    setEditingProductId(product.id);
    setImageFiles([]);
    setSaveError("");
    setShowModal(true);
  }

  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-[#EFBA1C]"></div>
          <p className="mt-4 text-gray-600">{t("loading")}</p>
        </div>
      </div>
    );
  }

  const filteredProducts = products.filter((p) => {
    const q = searchQuery.toLowerCase();
    const categoryLabel = getCategoryLabel(p.category, locale).toLowerCase();
    const matchesSearch =
      p.title.toLowerCase().includes(q) ||
      (p.category || "").toLowerCase().includes(q) ||
      categoryLabel.includes(q);
    const matchesCategory =
      filterCategory === "" || normalizeCategoryId(p.category) === filterCategory;
    const matchesStock = filterStock === "" || p.stock_status === filterStock;
    return matchesSearch && matchesCategory && matchesStock;
  });

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-gray-200 bg-[#f8f8f8] text-[#404040] shadow-lg transition-transform duration-300 ease-in-out md:relative md:top-auto md:translate-x-0 top-16 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <nav className="flex-1 space-y-2 px-4 pt-10 md:pt-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={`/${locale}${item.href}`}
                onClick={closeSidebar}
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-[#404040] transition-colors hover:bg-gray-200 focus:bg-gray-200 focus:outline-none"
              >
                <span className="text-[#EFBA1C]">{getIcon(item.icon)}</span>
                {t(item.labelKey)}
              </Link>
            ))}
          </nav>
          <div className="border-t border-gray-200 p-4">
            <button
              onClick={handleLogout}
              disabled={logoutLoading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#EFBA1C] px-4 py-3 text-sm font-semibold text-[#404040] transition-colors hover:bg-[#F0C040] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
              {logoutLoading ? t("logging_out") : t("logout")}
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={closeSidebar} />}

      <main className="w-full flex-1 overflow-x-hidden">
        <div className="w-full overflow-x-hidden p-4 pt-4 sm:p-6 md:p-8 md:pt-0">
          {notification && (
            <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800">
              ✓ {notification}
            </div>
          )}

          {fetchError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              <p className="font-semibold">{t("fetch_error_title")}</p>
              <p className="mt-1">{fetchError}</p>
            </div>
          )}

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="mb-4 inline-flex items-center justify-center rounded-lg p-2 text-[#404040] hover:bg-white/50 focus:outline-none focus:ring-2 focus:ring-[#EFBA1C] md:hidden"
            aria-label="Toggle menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="mb-8 mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-[#404040] sm:text-3xl">{t("manage_products_title")}</h2>
              <p className="mt-1 text-sm text-gray-600">{t("products_count", { count: filteredProducts.length })}</p>
            </div>
            <button
              onClick={() => {
                setFormData(emptyForm);
                setEditingProductId(null);
                setShowModal(true);
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-[#EFBA1C] px-4 py-3 text-sm font-semibold text-[#404040] transition-colors hover:bg-[#F0C040]"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              {t("add_product")}
            </button>
          </div>

          <div className="mb-6 flex w-full flex-col gap-4 sm:flex-row">
            <input
              type="text"
              placeholder={t("search_placeholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-[#404040] placeholder:text-gray-400 focus:border-[#EFBA1C] focus:outline-none focus:ring-2 focus:ring-[#EFBA1C]/30"
            />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-[#404040] focus:border-[#EFBA1C] focus:outline-none focus:ring-2 focus:ring-[#EFBA1C]/30 sm:min-w-[170px]"
            >
              <option value="">{t("all_categories")}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {getCategoryLabel(c.id, locale)}
                </option>
              ))}
            </select>
            <select
              value={filterStock}
              onChange={(e) => setFilterStock(e.target.value)}
              className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-[#404040] focus:border-[#EFBA1C] focus:outline-none focus:ring-2 focus:ring-[#EFBA1C]/30 sm:min-w-[150px]"
            >
              <option value="">{t("all_availability")}</option>
              <option value="in_stock">{t("in_stock")}</option>
              <option value="out_of_stock">{t("out_of_stock")}</option>
            </select>
          </div>

          {loading ? (
            <div className="rounded-xl border border-gray-100 bg-white p-8 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-[#EFBA1C]"></div>
              <p className="mt-3 text-gray-600">{t("loading_products")}</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="rounded-xl border border-gray-100 bg-white p-8 text-center">
              <p className="text-gray-600">{t("no_products_found")}</p>
            </div>
          ) : (
            <div className="w-full overflow-x-auto rounded-xl border border-gray-100 shadow-md">
              <table className="w-full">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#404040]">{t("image")}</th>
                    <th className="min-w-[160px] px-4 py-3 text-left text-xs font-semibold text-[#404040]">{t("title")}</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#404040]">{t("category")}</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#404040]">{t("price")}</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#404040]">{t("stock")}</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-[#404040]">{t("visible")}</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-[#404040]">{t("actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="transition-colors hover:bg-gray-50">
                      <td className="px-4 py-3">
                        {product.images && product.images.length > 0 ? (
                          isVideoUrl(product.images[0]) ? (
                            <video src={product.images[0]} className="h-10 w-10 rounded object-cover" muted />
                          ) : (
                            <img src={product.images[0]} alt={product.title} className="h-10 w-10 rounded object-cover" />
                          )
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded bg-gray-100">
                            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5z" />
                            </svg>
                          </div>
                        )}
                      </td>
                      <td className="min-w-[160px] px-4 py-3 text-sm font-medium text-[#404040] whitespace-normal wrap-break-word align-top">
                        {product.title}
                        {product.is_promotion && (
                          <span className="ml-2 rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-green-700">{t("promo_badge")}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-block rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
                          {getCategoryLabel(product.category, locale)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-[#EFBA1C]">
                        {product.is_promotion && product.promo_price != null
                          ? product.promo_price.toLocaleString()
                          : product.price.toLocaleString()}{" "}
                        MAD
                        <span className="text-xs font-normal text-gray-400"> /{getUnitLabel(product.price_unit, locale)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            product.stock_status === "out_of_stock" ? "bg-orange-100 text-orange-800" : "bg-green-100 text-green-800"
                          }`}
                        >
                          {product.stock_status === "out_of_stock" ? t("out_of_stock") : t("in_stock")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleToggleVisible(product.id, product.is_visible)}
                          className={`inline-flex items-center justify-center rounded-full p-1.5 transition-colors ${
                            product.is_visible ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
                          }`}
                          title={product.is_visible ? t("visible_on_site") : t("hidden")}
                        >
                          {product.is_visible ? (
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          ) : (
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.243 4.243L9.88 9.88" />
                            </svg>
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleEditProduct(product)} className="rounded bg-blue-100 p-1.5 text-blue-600 transition-colors hover:bg-blue-200">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button onClick={() => setDeleteId(product.id)} className="rounded bg-red-100 p-1.5 text-red-600 transition-colors hover:bg-red-200">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
<div className="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-2xl">            <div className="sticky top-0 border-b border-gray-200 bg-white p-6 sm:p-8">
              <button type="button" onClick={cleanupAndClose} className="absolute right-4 top-4 p-1 text-gray-400 transition-colors hover:text-gray-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h3 className="text-2xl font-bold text-[#404040]">{editingProductId ? t("edit_product") : t("add_product")}</h3>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-5 p-6 sm:p-8">
              {saveError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <p className="text-sm font-medium text-red-800">{saveError}</p>
                </div>
              )}

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-[#404040]">{t("title_required_label")}</label>
                  <input type="text" required placeholder={t("title_placeholder")} value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-[#404040] placeholder:text-gray-400 focus:border-[#EFBA1C] focus:outline-none focus:ring-2 focus:ring-[#EFBA1C]/30" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#404040]">{t("category_required_label")}</label>
                  <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-[#404040] focus:border-[#EFBA1C] focus:outline-none focus:ring-2 focus:ring-[#EFBA1C]/30">
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {getCategoryLabel(c.id, locale)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-[#404040]">{t("dimensions_label")}</label>
                  <input type="text" placeholder={t("dimensions_placeholder")} value={formData.dimensions} onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })} className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-[#404040] placeholder:text-gray-400 focus:border-[#EFBA1C] focus:outline-none focus:ring-2 focus:ring-[#EFBA1C]/30" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#404040]">{t("thickness_label")}</label>
                  <input type="text" placeholder={t("thickness_placeholder")} value={formData.thickness} onChange={(e) => setFormData({ ...formData, thickness: e.target.value })} className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-[#404040] placeholder:text-gray-400 focus:border-[#EFBA1C] focus:outline-none focus:ring-2 focus:ring-[#EFBA1C]/30" />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-[#404040]">{t("price_mad_label")}</label>
                  <input type="number" step="0.01" required placeholder="210.00" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-[#404040] placeholder:text-gray-400 focus:border-[#EFBA1C] focus:outline-none focus:ring-2 focus:ring-[#EFBA1C]/30" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#404040]">{t("price_unit_label")}</label>
                  <select value={formData.price_unit} onChange={(e) => setFormData({ ...formData, price_unit: e.target.value })} className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-[#404040] focus:border-[#EFBA1C] focus:outline-none focus:ring-2 focus:ring-[#EFBA1C]/30">
                    {priceUnits.map((u) => (
                      <option key={u.id} value={u.id}>
                        {getUnitLabel(u.id, locale)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-[#404040]">{t("availability_label")}</label>
                  <select value={formData.stock_status} onChange={(e) => setFormData({ ...formData, stock_status: e.target.value })} className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-[#404040] focus:border-[#EFBA1C] focus:outline-none focus:ring-2 focus:ring-[#EFBA1C]/30">
                    <option value="in_stock">{t("in_stock")}</option>
                    <option value="out_of_stock">{t("out_of_stock")}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#404040]">{t("promo_price_label")}</label>
                  <input type="number" step="0.01" placeholder={t("promo_price_placeholder")} disabled={!formData.is_promotion} value={formData.promo_price} onChange={(e) => setFormData({ ...formData, promo_price: e.target.value })} className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-[#404040] placeholder:text-gray-400 focus:border-[#EFBA1C] focus:outline-none focus:ring-2 focus:ring-[#EFBA1C]/30 disabled:cursor-not-allowed disabled:bg-gray-100" />
                </div>
              </div>

              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-2 text-sm font-medium text-[#404040]">
                  <input type="checkbox" checked={formData.is_promotion} onChange={(e) => setFormData({ ...formData, is_promotion: e.target.checked })} className="h-4 w-4 rounded border-gray-300 text-[#EFBA1C] focus:ring-[#EFBA1C]" />
                  {t("on_promotion")}
                </label>
                <label className="flex items-center gap-2 text-sm font-medium text-[#404040]">
                  <input type="checkbox" checked={formData.free_delivery} onChange={(e) => setFormData({ ...formData, free_delivery: e.target.checked })} className="h-4 w-4 rounded border-gray-300 text-[#EFBA1C] focus:ring-[#EFBA1C]" />
                  {t("free_delivery_label")}
                </label>
                <label className="flex items-center gap-2 text-sm font-medium text-[#404040]">
                  <input type="checkbox" checked={formData.is_visible} onChange={(e) => setFormData({ ...formData, is_visible: e.target.checked })} className="h-4 w-4 rounded border-gray-300 text-[#EFBA1C] focus:ring-[#EFBA1C]" />
                  {t("visible_on_site_label")}
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#404040]">{t("description_label")}</label>
                <textarea placeholder={t("description_placeholder")} rows={6} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="mt-2 w-full resize-none rounded-lg border border-gray-200 px-4 py-2.5 leading-relaxed text-[#404040] placeholder:text-gray-400 focus:border-[#EFBA1C] focus:outline-none focus:ring-2 focus:ring-[#EFBA1C]/30" />
              </div>

              {(existingImages.length > 0 || previewImages.length > 0) && (
                <div>
                  <label className="mb-3 block text-sm font-medium text-[#404040]">{t("images_videos")}</label>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                    {existingImages.map((imageUrl, index) => (
                      <div key={`existing-${index}`} className="group relative">
                        <div
                          className={`aspect-square cursor-pointer overflow-hidden rounded-lg border-2 transition-colors ${
                            mainImageIndex === index ? "border-[#EFBA1C] shadow-lg" : "border-gray-200 hover:border-[#EFBA1C]"
                          }`}
                          onClick={() => setMainImageIndex(index)}
                        >
                          {isVideoUrl(imageUrl) ? (
                            <video src={imageUrl} className="h-full w-full object-cover" muted preload="metadata" />
                          ) : (
                            <img src={imageUrl} alt={`Image ${index + 1}`} className="h-full w-full object-cover" />
                          )}
                        </div>
                        <button type="button" onClick={() => removePreviewImage(index)} className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-lg">×</button>
                        {mainImageIndex === index && (
                          <div className="absolute bottom-0 left-0 right-0 bg-[#EFBA1C] py-1 text-center text-xs font-semibold text-[#404040]">{t("cover_image")}</div>
                        )}
                      </div>
                    ))}
                    {previewImages.map((previewUrl, index) => (
                      <div key={`preview-${index}`} className="group relative">
                        <div
                          className={`aspect-square cursor-pointer overflow-hidden rounded-lg border-2 border-dashed transition-colors ${
                            mainImageIndex === existingImages.length + index ? "border-[#EFBA1C] bg-[#EFBA1C]/5 shadow-lg" : "border-blue-300 hover:border-[#EFBA1C]"
                          }`}
                          onClick={() => setMainImageIndex(existingImages.length + index)}
                        >
                          {imageFiles[index] && isVideoFile(imageFiles[index]) ? (
                            <video src={previewUrl} className="h-full w-full object-cover" muted preload="metadata" />
                          ) : (
                            <img src={previewUrl} alt={`Nouvelle image ${index + 1}`} className="h-full w-full object-cover" />
                          )}
                          <div className="absolute left-1 top-1 rounded bg-blue-500 px-2 py-0.5 text-xs font-semibold text-white">{t("new_badge")}</div>
                        </div>
                        <button type="button" onClick={() => removePreviewImage(existingImages.length + index)} className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-lg">×</button>
                        {mainImageIndex === existingImages.length + index && (
                          <div className="absolute bottom-0 left-0 right-0 bg-[#EFBA1C] py-1 text-center text-xs font-semibold text-[#404040]">{t("cover_image")}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-[#404040]">{t("add_photos_videos")}</label>
                <input type="file" accept="image/*,video/*" multiple onChange={handleFileSelect} className="mt-2 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-[#404040] file:mr-4 file:rounded-md file:border-0 file:bg-[#404040] file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white hover:file:bg-[#606060] focus:border-[#EFBA1C] focus:outline-none focus:ring-2 focus:ring-[#EFBA1C]/30" />
                {imageFiles.length > 0 && <p className="mt-1.5 text-xs text-gray-600">{t("files_selected", { count: imageFiles.length })}</p>}
              </div>

              <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                <button type="button" onClick={cleanupAndClose} className="rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-[#404040] transition-colors hover:bg-gray-50">
                  {t("cancel")}
                </button>
                <button type="submit" disabled={isSaving} className="rounded-lg bg-[#EFBA1C] px-6 py-2.5 text-sm font-semibold text-[#404040] transition-colors hover:bg-[#F0C040] disabled:cursor-not-allowed disabled:opacity-50">
                  {isSaving ? t("saving") : t("save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-xl">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <span className="text-3xl text-red-500">🗑️</span>
            </div>
            <h3 className="mb-2 text-xl font-bold text-gray-900">{t("delete_product_title")}</h3>
            <p className="mb-6 text-gray-500">{t("delete_confirm")}</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50">{t("cancel")}</button>
              <button onClick={() => { handleDeleteProduct(deleteId); setDeleteId(null); }} className="flex-1 rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600">{t("delete")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// max-h