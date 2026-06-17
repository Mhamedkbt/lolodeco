"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useTranslations, useLocale } from "next-intl";
import {
  Squares2X2Icon,
  ClipboardDocumentCheckIcon,
  Cog6ToothIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

const isVideoUrl = (url: string): boolean => {
  return /\.(mp4|webm|mov|avi|quicktime)(\?|$)/i.test(url)
}

const isVideoFile = (file: File): boolean => file.type.startsWith('video/')

const navItems = [
  { labelKey: "nav_dashboard", href: "/admin/dashboard", icon: "dashboard" },
  { labelKey: "nav_properties", href: "/admin/properties", icon: "properties" },
  { labelKey: "nav_messages", href: "/admin/messages", icon: "messages" },
  { labelKey: "nav_evaluations", href: "/admin/evaluations", icon: "evaluations" },
];

function getIcon(iconType: string) {
  switch (iconType) {
    case "dashboard":
  return <Squares2X2Icon className="h-5 w-5" />;
    case "properties":
      return (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
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

interface Property {
  id: string;
  title: string;
  city: string;
  type: string;
  status: string;
  price: number;
  featured: boolean;
  images?: string[];
  description?: string;
  surface?: number;
  rooms?: number;
}

export default function PropertiesPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("admin");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    type: "Apartment",
    city: "",
    price: "",
    surface: "",
    rooms: "",
    status: "Sale",
    description: "",
    featured: false,
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [saveError, setSaveError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [editingPropertyId, setEditingPropertyId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [mainImageIndex, setMainImageIndex] = useState<number>(0);
  const [objectUrls, setObjectUrls] = useState<string[]>([]);
  const [notification, setNotification] = useState<string>("");

  useEffect(() => {
    async function checkAuth() {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error || !data.session) {
          router.push(`/${locale}/admin`);
          return;
        }
        setIsCheckingAuth(false);
        await fetchProperties();
      } catch (err) {
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

  async function fetchProperties() {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("properties").select("*");
      if (error) throw error;
      setProperties(data || []);
    } catch (err) {
      console.error("Error fetching properties:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    setLogoutLoading(true);
    try {
      await supabase.auth.signOut();
      router.push(`/${locale}/admin`);
    } catch (err) {
      setLogoutLoading(false);
    }
  }

  function extractFilePathFromUrl(imageUrl: string): string | null {
    try {
      console.log("Extracting path from URL:", imageUrl);
      
      const url = new URL(imageUrl);
      const pathname = url.pathname;
      console.log("Full pathname:", pathname);

      const pathParts = pathname.split("/public/");
      if (pathParts.length < 2) {
        console.error("Could not find /public/ in pathname");
        return null;
      }

      let fullPath = pathParts[1];
      console.log("Full path after /public/:", fullPath);

      const pathComponents = fullPath.split("/");
      console.log("Path components:", pathComponents);

      if (pathComponents.length < 2) {
        console.error("Path too short, expected at least bucket name + file");
        return null;
      }

      const bucketName = pathComponents[0];
      console.log("Detected bucket name:", bucketName);

      const filePath = pathComponents.slice(1).join("/");
      console.log("File path after removing bucket prefix:", filePath);
      console.log("Final path to delete:", filePath);

      return filePath;
    } catch (err) {
      console.error("Error extracting file path from URL:", err);
      return null;
    }
  }

  async function deleteImageFromStorage(imageUrl: string): Promise<void> {
    try {
      const filePath = extractFilePathFromUrl(imageUrl);
      if (!filePath) {
        console.warn("Could not extract file path from URL:", imageUrl);
        return;
      }

      console.log(`Attempting to delete from storage: "${filePath}"`);

      const { data, error } = await supabase.storage
        .from("properties")
        .remove([filePath]);

      if (error) {
        console.error("Supabase storage remove error:", error);
        console.error("Error details:", {
          message: error.message,
          statusCode: error.statusCode,
          filePath: filePath,
        });
        return;
      }

      console.log(`✓ Image successfully deleted from storage: ${filePath}`);
      console.log("Remove response data:", data);
      setNotification("Image removed successfully");
      setTimeout(() => setNotification(""), 3000);
    } catch (err) {
      console.error("Exception in deleteImageFromStorage:", err);
      if (err instanceof Error) {
        console.error("Error message:", err.message);
        console.error("Error stack:", err.stack);
      }
    }
  }

  async function deleteImagesFromStorage(imageUrls: string[]): Promise<void> {
    const filePaths = imageUrls
      .map((url) => extractFilePathFromUrl(url))
      .filter((path): path is string => path !== null);

    if (filePaths.length === 0) {
      console.warn("No valid file paths to delete from:", imageUrls);
      return;
    }

    console.log(`Attempting to delete ${filePaths.length} images:`, filePaths);

    try {
      const { data, error } = await supabase.storage
        .from("properties")
        .remove(filePaths);

      if (error) {
        console.error("Supabase storage remove error:", error);
        console.error("Error details:", {
          message: error.message,
          statusCode: error.statusCode,
          filePaths: filePaths,
        });
        return;
      }

      console.log(`✓ Successfully deleted ${filePaths.length} image(s) from storage`);
      console.log("Deleted file paths:", filePaths);
      console.log("Remove response data:", data);
      setNotification(`${filePaths.length} image(s) removed`);
      setTimeout(() => setNotification(""), 3000);
    } catch (err) {
      console.error("Exception in deleteImagesFromStorage:", err);
      if (err instanceof Error) {
        console.error("Error message:", err.message);
        console.error("Error stack:", err.stack);
      }
    }
  }

  async function handleDeleteProperty(id: string) {
    try {
      const property = properties.find((p) => p.id === id);
      if (property && property.images && property.images.length > 0) {
        await deleteImagesFromStorage(property.images);
      }

      const { error } = await supabase.from("properties").delete().eq("id", id);
      if (error) throw error;

      setProperties((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Error deleting property:", err);
      alert("Error deleting property");
    }
  }

  async function handleAddProperty(e: React.FormEvent) {
    e.preventDefault();
    setSaveError("");
    setIsSaving(true);

    try {
      let finalImageUrls: string[] = [];
      const newlyUploadedUrls: string[] = [];

      if (imageFiles.length > 0) {
        for (let i = 0; i < imageFiles.length; i++) {
          const file = imageFiles[i];
          const fileExt = file.name.split(".").pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
          const filePath = `properties/${fileName}`;

          const { data, error: uploadError } = await supabase.storage
            .from("properties")
            .upload(filePath, file);

          if (uploadError) {
            console.error(`Error uploading image ${i + 1}:`, uploadError);
            throw new Error(`Failed to upload image ${i + 1}: ${uploadError.message}`);
          }

          const { data: urlData } = supabase.storage
            .from("properties")
            .getPublicUrl(filePath);

          newlyUploadedUrls.push(urlData.publicUrl);
        }
      }

      if (editingPropertyId) {
        finalImageUrls = [...existingImages.filter((_, i) => !previewImages.includes(existingImages[i])), ...newlyUploadedUrls];
      } else {
        finalImageUrls = [...existingImages, ...newlyUploadedUrls];
      }

      const reorderedImages = moveMainImageToFront(finalImageUrls, mainImageIndex);

      const propertyData = {
        title: formData.title,
        type: formData.type,
        city: formData.city,
        price: Number(formData.price),
        surface: formData.surface ? Number(formData.surface) : null,
        rooms: formData.rooms ? Number(formData.rooms) : null,
        status: formData.status,
        description: formData.description,
        featured: formData.featured,
        images: reorderedImages,
      };

      if (editingPropertyId) {
        const { error: updateError } = await supabase
          .from("properties")
          .update(propertyData)
          .eq("id", editingPropertyId);

        if (updateError) {
          console.error("Error updating property:", updateError);
          throw new Error(updateError.message || "Failed to update property");
        }

        setProperties((prev) =>
          prev.map((p) =>
            p.id === editingPropertyId
              ? ({
                  ...p,
                  title: propertyData.title,
                  type: propertyData.type,
                  city: propertyData.city,
                  price: propertyData.price,
                  surface: propertyData.surface || undefined,
                  rooms: propertyData.rooms || undefined,
                  status: propertyData.status,
                  description: propertyData.description,
                  featured: propertyData.featured,
                  images: propertyData.images,
                } as Property)
              : p
          )
        );
      } else {
        const { data: insertedData, error: insertError } = await supabase
          .from("properties")
          .insert(propertyData)
          .select();

        if (insertError) {
          console.error("Error inserting property:", insertError);
          throw new Error(insertError.message || "Failed to save property");
        }

        if (insertedData && insertedData.length > 0) {
          setProperties((prev) => [...prev, insertedData[0]]);
        }
      }

      cleanupAndClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error saving property. Please try again.";
      setSaveError(errorMessage);
      console.error("Full error:", err);
    } finally {
      setIsSaving(false);
    }
  }

  function moveMainImageToFront(images: string[], mainIndex: number): string[] {
    if (mainIndex === 0 || mainIndex < 0 || mainIndex >= images.length) return images;
    const reordered = [...images];
    const mainImage = reordered.splice(mainIndex, 1)[0];
    return [mainImage, ...reordered];
  }

  function cleanupAndClose() {
    objectUrls.forEach((url) => URL.revokeObjectURL(url));
    setFormData({
      title: "",
      type: "Apartment",
      city: "",
      price: "",
      surface: "",
      rooms: "",
      status: "Sale",
      description: "",
      featured: false,
    });
    setImageFiles([]);
    setExistingImages([]);
    setPreviewImages([]);
    setObjectUrls([]);
    setMainImageIndex(0);
    setEditingPropertyId(null);
    setShowModal(false);
    setSaveError("");
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newFiles = [...imageFiles, ...files];
    setImageFiles(newFiles);

    const newObjectUrls: string[] = [];
    const newPreviewUrls: string[] = [];

    files.forEach((file) => {
      const objectUrl = URL.createObjectURL(file);
      newObjectUrls.push(objectUrl);
      newPreviewUrls.push(objectUrl);
    });

    setObjectUrls((prev) => [...prev, ...newObjectUrls]);
    setPreviewImages((prev) => [...prev, ...newPreviewUrls]);

    e.target.value = "";
  }

  function removePreviewImage(index: number) {
    const isExisting = index < existingImages.length;

    if (isExisting) {
      const imageUrl = existingImages[index];
      deleteImageFromStorage(imageUrl).then(() => {
        const updated = existingImages.filter((_, i) => i !== index);
        setExistingImages(updated);
        if (mainImageIndex >= updated.length && mainImageIndex > 0) {
          setMainImageIndex(mainImageIndex - 1);
        }
      });
    } else {
      const fileIndex = index - existingImages.length;
      const previewIndex = fileIndex;

      if (previewImages[previewIndex]) {
        URL.revokeObjectURL(previewImages[previewIndex]);
      }

      setImageFiles((prev) => prev.filter((_, i) => i !== fileIndex));
      setPreviewImages((prev) => prev.filter((_, i) => i !== previewIndex));
      setObjectUrls((prev) => prev.filter((_, i) => i !== previewIndex));

      if (mainImageIndex >= existingImages.length + imageFiles.length && mainImageIndex > 0) {
        setMainImageIndex(mainImageIndex - 1);
      }
    }
  }

  function resetFormAndClose() {
    cleanupAndClose();
  }

  async function handleToggleFeatured(id: string, currentFeatured: boolean) {
    try {
      const { error } = await supabase
        .from("properties")
        .update({ featured: !currentFeatured })
        .eq("id", id);
      if (error) throw error;

      setProperties((prev) =>
        prev.map((p) => (p.id === id ? { ...p, featured: !currentFeatured } : p))
      );
    } catch (err) {
      console.error("Error updating featured status:", err);
    }
  }

  function closeSidebar() {
    setSidebarOpen(false);
  }

  function handleEditProperty(property: Property) {
    setFormData({
      title: property.title,
      type: property.type,
      city: property.city,
      price: property.price.toString(),
      surface: property.surface?.toString() || "",
      rooms: property.rooms?.toString() || "",
      status: property.status,
      description: property.description || "",
      featured: property.featured,
    });
    setExistingImages(property.images || []);
    setMainImageIndex(0);
    setEditingPropertyId(property.id);
    setImageFiles([]);
    setSaveError("");
    setShowModal(true);
  }

  function handleRemoveExistingImage(index: number) {
    const updated = existingImages.filter((_, i) => i !== index);
    setExistingImages(updated);
    if (mainImageIndex >= updated.length && mainImageIndex > 0) {
      setMainImageIndex(mainImageIndex - 1);
    }
  }

  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#c9a84c]"></div>
          <p className="mt-4 text-gray-600">{t("loading")}</p>
        </div>
      </div>
    );
  }

  const filteredProperties = properties.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "" || p.type === filterType;
    const matchesStatus = filterStatus === "" || p.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#1a2b4a] text-white shadow-lg transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:top-auto top-16 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <nav className="flex-1 px-4 pt-6 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={`/${locale}${item.href}`}
                onClick={closeSidebar}
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors hover:bg-white/10 focus:outline-none focus:bg-white/10"
              >
                <span className="text-[#c9a84c]">{getIcon(item.icon)}</span>
                {t(item.labelKey)}
              </Link>
            ))}
          </nav>

          <div className="border-t border-white/10 p-4">
            <button
              onClick={handleLogout}
              disabled={logoutLoading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#c9a84c] px-4 py-3 text-sm font-semibold text-[#1a2b4a] transition-colors hover:bg-[#d4b85e] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#c9a84c]"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
              {logoutLoading ? t("logging_out") : t("logout")}
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={closeSidebar}
        />
      )}

      <main className="flex-1 w-full overflow-x-hidden">
        <div className="p-4 sm:p-6 md:p-8 w-full overflow-x-hidden pt-4 md:pt-0">
          {notification && (
            <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm font-medium text-green-800">
              ✓ {notification}
            </div>
          )}

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="mb-4 inline-flex md:hidden items-center justify-center rounded-lg p-2 text-[#1a2b4a] hover:bg-white/50 focus:outline-none focus:ring-2 focus:ring-[#c9a84c]"
            aria-label="Toggle menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              {sidebarOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          <div className="mt-8 mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#1a2b4a]">{t("manage_properties_title")}</h2>
              <p className="mt-1 text-sm text-gray-600">{filteredProperties.length} properties</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-[#c9a84c] px-4 py-3 text-sm font-semibold text-[#1a2b4a] transition-colors hover:bg-[#d4b85e] focus:outline-none focus:ring-2 focus:ring-[#c9a84c]"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              {t("add_property")}
            </button>
          </div>

          <div className="mb-6 flex flex-col sm:flex-row gap-4 w-full">
            <input
              type="text"
              placeholder={t("search_placeholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-[#1a2b4a] placeholder:text-gray-400 focus:border-[#c9a84c] focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/30 flex-1"
            />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-[#1a2b4a] focus:border-[#c9a84c] focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/30 sm:min-w-[150px]"
            >
              <option value="">{t("all_types")}</option>
              <option value="Apartment">{t("apartment")}</option>
              <option value="Villa">{t("villa")}</option>
              <option value="Land">{t("land")}</option>
              <option value="Commercial">{t("commercial")}</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-[#1a2b4a] focus:border-[#c9a84c] focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/30 sm:min-w-[150px]"
            >
              <option value="">{t("all_statuses")}</option>
              <option value="Sale">{t("sale")}</option>
              <option value="Rent">{t("rent")}</option>
            </select>
          </div>

          {loading ? (
            <div className="rounded-xl border border-gray-100 bg-white p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#c9a84c]"></div>
              <p className="mt-3 text-gray-600">{t("loading_properties")}</p>
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="rounded-xl border border-gray-100 bg-white p-8 text-center">
              <p className="text-gray-600">{t("no_properties")}</p>
            </div>
          ) : (
            <div className="w-full overflow-x-auto rounded-xl border border-gray-100 shadow-md">
              <table className="w-full">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#1a2b4a]">{t("image")}</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#1a2b4a]">{t("title")}</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#1a2b4a]">{t("city")}</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#1a2b4a]">{t("type")}</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#1a2b4a]">{t("status")}</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#1a2b4a]">{t("price")}</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-[#1a2b4a]">{t("featured")}</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-[#1a2b4a]">{t("actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredProperties.map((property) => (
                    <tr key={property.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        {property.images && property.images.length > 0 ? (
                          <img
                            src={property.images[0]}
                            alt={property.title}
                            className="h-10 w-10 rounded object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded bg-gray-100 flex items-center justify-center">
                            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0z" />
                            </svg>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-[#1a2b4a]">{property.title}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{property.city}</td>
                      <td className="px-4 py-3">
                        <span className="inline-block rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
                          {property.type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            property.status === "Sale"
                              ? "bg-green-100 text-green-800"
                              : "bg-orange-100 text-orange-800"
                          }`}
                        >
                          {property.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-[#c9a84c]">
                        {property.price.toLocaleString()} MAD
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleToggleFeatured(property.id, property.featured)}
                          className={`inline-flex items-center justify-center rounded-full p-1.5 transition-colors ${
                            property.featured
                              ? "bg-[#c9a84c]/20 text-[#c9a84c]"
                              : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </button>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditProperty(property)}
                            className="rounded bg-blue-100 p-1.5 text-blue-600 hover:bg-blue-200 transition-colors"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setDeleteId(property.id)}
                            className="rounded bg-red-100 p-1.5 text-red-600 hover:bg-red-200 transition-colors"
                          >
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
          <div className="max-h-screen w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-2xl">
            <div className="sticky top-0 border-b border-gray-200 bg-white p-6 sm:p-8">
              <button
                type="button"
                onClick={() => cleanupAndClose()}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1"
                title="Close modal"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h3 className="text-2xl font-bold text-[#1a2b4a]">
                {editingPropertyId ? t("edit_property") : t("add_property")}
              </h3>
            </div>

            <form onSubmit={handleAddProperty} className="p-6 sm:p-8 space-y-5">
              {saveError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <p className="text-sm font-medium text-red-800">{saveError}</p>
                </div>
              )}

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-[#1a2b4a]">{t("title_required")}</label>
                  <input
                    type="text"
                    required
                    placeholder="Property title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-[#1a2b4a] placeholder:text-gray-400 focus:border-[#c9a84c] focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1a2b4a]">{t("type_required")}</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-[#1a2b4a] focus:border-[#c9a84c] focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/30"
                  >
                    <option value="Apartment">Apartment</option>
                    <option value="Villa">Villa</option>
                    <option value="Land">Land</option>
                    <option value="Commercial">Commercial</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-[#1a2b4a]">{t("city_required")}</label>
                  <input
                    type="text"
                    required
                    placeholder="City name"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-[#1a2b4a] placeholder:text-gray-400 focus:border-[#c9a84c] focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1a2b4a]">{t("price_required")}</label>
                  <input
                    type="number"
                    required
                    placeholder="Price"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-[#1a2b4a] placeholder:text-gray-400 focus:border-[#c9a84c] focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/30"
                  />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-[#1a2b4a]">{t("surface_label")}</label>
                  <input
                    type="number"
                    placeholder="Surface"
                    value={formData.surface}
                    onChange={(e) => setFormData({ ...formData, surface: e.target.value })}
                    className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-[#1a2b4a] placeholder:text-gray-400 focus:border-[#c9a84c] focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1a2b4a]">{t("rooms_label")}</label>
                  <input
                    type="number"
                    placeholder="Number of rooms"
                    value={formData.rooms}
                    onChange={(e) => setFormData({ ...formData, rooms: e.target.value })}
                    className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-[#1a2b4a] placeholder:text-gray-400 focus:border-[#c9a84c] focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1a2b4a]">{t("status_required")}</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-[#1a2b4a] focus:border-[#c9a84c] focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/30"
                >
                  <option value="Sale">Sale</option>
                  <option value="Rent">Rent</option>
                </select>
              </div>

<div>
  <label className="block text-sm font-medium text-[#1a2b4a]">{t("description_label")}</label>
  <textarea
    placeholder="Property description"
    rows={6}
    value={formData.description}
    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
    className="mt-2 w-full resize-none rounded-lg border border-gray-200 px-4 py-2.5 text-[#1a2b4a] placeholder:text-gray-400 focus:border-[#c9a84c] focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/30 leading-relaxed"
  />
</div>

              <div className="flex items-center gap-3">
                <input
                  id="featured"
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-[#c9a84c] focus:ring-[#c9a84c]"
                />
                <label htmlFor="featured" className="text-sm font-medium text-[#1a2b4a]">
                  Featured Property
                </label>
              </div>

              {(existingImages.length > 0 || previewImages.length > 0) && (
                <div>
                  <label className="block text-sm font-medium text-[#1a2b4a] mb-3">{t("current_images")}</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {existingImages.map((imageUrl, index) => (
                      <div key={`existing-${index}`} className="relative group">
                        <div
                          className={`aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-colors ${
                            mainImageIndex === index
                              ? "border-[#c9a84c] shadow-lg"
                              : "border-gray-200 hover:border-[#c9a84c]"
                          }`}
                          onClick={() => setMainImageIndex(index)}
                        >
                          {isVideoUrl(imageUrl) ? (
                            <div className="relative h-full w-full bg-gray-900 
                                            flex items-center justify-center">
                              <video
                                src={imageUrl}
                                className="h-full w-full object-cover"
                                muted
                                preload="metadata"
                              />
                              <div className="absolute inset-0 flex items-center 
                                              justify-center bg-black/40">
                                <svg xmlns="http://www.w3.org/2000/svg"
                                     className="w-6 h-6 text-white" fill="currentColor"
                                     viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z"/>
                                </svg>
                              </div>
                              <div className="absolute bottom-1 left-1 bg-black/70 
                                              text-white text-xs px-1.5 py-0.5 rounded">
                                VIDEO
                              </div>
                            </div>
                          ) : (
                            <img
                              src={imageUrl}
                              alt={`Property image ${index + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.currentTarget.style.display = 'none' }}
                            />
                          )}
                          {mainImageIndex === index && (
                            <div className="absolute inset-0 bg-[#c9a84c]/20 flex items-center justify-center">
                              <span className="text-xl font-bold text-[#c9a84c]">★</span>
                            </div>
                          )}
                        </div>
                        <button
  type="button"
  onClick={() => removePreviewImage(index)}
  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center transition-opacity shadow-lg"
  title="Remove this image"
>
  ×
</button>
                        {mainImageIndex === index && (
                          <div className="absolute bottom-0 left-0 right-0 bg-[#c9a84c] text-[#1a2b4a] text-xs font-semibold py-1 text-center">
                            Main Cover
                          </div>
                        )}
                      </div>
                    ))}
                    {previewImages.map((previewUrl, index) => (
                      <div key={`preview-${index}`} className="relative group">
                        <div
                          className={`aspect-square rounded-lg overflow-hidden border-2 border-dashed cursor-pointer transition-colors ${
                            mainImageIndex === existingImages.length + index
                              ? "border-[#c9a84c] shadow-lg bg-[#c9a84c]/5"
                              : "border-blue-300 hover:border-[#c9a84c]"
                          }`}
                          onClick={() => setMainImageIndex(existingImages.length + index)}
                        >
                          {isVideoFile(imageFiles[index]) ? (
                            <div className="relative h-full w-full bg-gray-900 
                                            flex items-center justify-center overflow-hidden">
                              <video
                                src={URL.createObjectURL(imageFiles[index])}
                                className="h-full w-full object-cover"
                                muted
                                preload="metadata"
                              />
                              <div className="absolute inset-0 flex items-center 
                                              justify-center bg-black/40">
                                <svg xmlns="http://www.w3.org/2000/svg"
                                     className="w-6 h-6 text-white" fill="currentColor"
                                     viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z"/>
                                </svg>
                              </div>
                              <div className="absolute bottom-1 left-1 bg-black/70 
                                              text-white text-xs px-1.5 py-0.5 rounded font-medium">
                                VIDEO
                              </div>
                            </div>
                          ) : (
                            <img
                              src={previewUrl}
                              alt={`New image ${index + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.currentTarget.style.display = 'none' }}
                            />
                          )}
                          {mainImageIndex === existingImages.length + index && (
                            <div className="absolute inset-0 bg-[#c9a84c]/20 flex items-center justify-center">
                              <span className="text-xl font-bold text-[#c9a84c]">★</span>
                            </div>
                          )}
                          <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-2 py-0.5 rounded font-semibold">
                            New
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removePreviewImage(existingImages.length + index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                          title="Remove this image"
                        >
                          ×
                        </button>
                        {mainImageIndex === existingImages.length + index && (
                          <div className="absolute bottom-0 left-0 right-0 bg-[#c9a84c] text-[#1a2b4a] text-xs font-semibold py-1 text-center">
                            Main Cover
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-[#1a2b4a]">{t("upload_photos")}</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="mt-2 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-[#1a2b4a] file:mr-4 file:rounded-md file:border-0 file:bg-[#1a2b4a] file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white hover:file:bg-[#243a5e] focus:border-[#c9a84c] focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/30"
                />
                {imageFiles.length > 0 && (
                  <p className="mt-1.5 text-xs text-gray-600">{imageFiles.length} file(s) selected for upload</p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => cleanupAndClose()}
                  className="rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-[#1a2b4a] transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-lg bg-[#c9a84c] px-6 py-2.5 text-sm font-semibold text-[#1a2b4a] transition-colors hover:bg-[#d4b85e] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#c9a84c]"
                >
                  {isSaving ? t("saving") : t("save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 text-center shadow-xl">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-500 text-3xl">🗑️</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{t("delete_property")}</h3>
            <p className="text-gray-500 mb-6">{t("delete_confirm")}</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">{t("cancel")}</button>
              <button onClick={() => { handleDeleteProperty(deleteId); setDeleteId(null); }} className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">{t("delete")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



// Remove this image   placeholder