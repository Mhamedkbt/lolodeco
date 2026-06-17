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

interface Message {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  read: boolean;
  created_at: string;
}

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

export default function MessagesPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("admin");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error || !data.session) {
          router.push(`/${locale}/admin`);
          return;
        }
        setIsCheckingAuth(false);
        await fetchMessages();
      } catch (err) {
        router.push(`/${locale}/admin`);
      }
    }

    checkAuth();
  }, [router]);

  async function fetchMessages() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      console.error("Error fetching messages:", err);
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

  async function handleToggleStatus(id: string, currentRead: boolean) {
    try {
      const newRead = !currentRead;
      console.log(`Toggling message ${id} from ${currentRead} to ${newRead}`);
      
      const { error } = await supabase
        .from("messages")
        .update({ read: newRead })
        .eq("id", id);
      
      if (error) {
        console.error("Supabase error updating message read status:", {
          message: error.message,
          code: error.code,
          id,
          newRead,
        });
        throw new Error(`Failed to update message read status: ${error.message}`);
      }

      console.log(`Successfully updated message ${id} to read=${newRead}`);
      
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id === id) {
            console.log(`Updating local state for message ${id}`);
            return { ...m, read: newRead };
          }
          return m;
        })
      );

      if (selectedMessage?.id === id) {
        console.log(`Updating selected message modal`);
        setSelectedMessage({ ...selectedMessage, read: newRead });
      }
    } catch (err) {
      console.error("Error in handleToggleStatus:", err);
      if (err instanceof Error) {
        console.error("Error details:", {
          message: err.message,
          stack: err.stack,
        });
      }
      alert("Failed to update message read status. Please try again.");
    }
  }

  async function handleDeleteMessage(id: string) {
    setIsDeleting(true);
    try {
      const { error } = await supabase.from("messages").delete().eq("id", id);
      if (error) throw error;

      setMessages((prev) => prev.filter((m) => m.id !== id));
      if (selectedMessage?.id === id) {
        setShowModal(false);
        setSelectedMessage(null);
      }
      setDeleteConfirmId(null);
    } catch (err) {
      console.error("Error deleting message:", err);
    } finally {
      setIsDeleting(false);
    }
  }

  function closeSidebar() {
    setSidebarOpen(false);
  }

  function openMessage(message: Message) {
    setSelectedMessage(message);
    setShowModal(true);
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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

          <div className="mt-8 mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1a2b4a]">{t("manage_messages_title")}</h2>
            <p className="mt-1 text-sm text-gray-600">{messages.length} message{messages.length !== 1 ? "s" : ""}</p>
          </div>

          {loading ? (
            <div className="rounded-xl border border-gray-100 bg-white p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#c9a84c]"></div>
              <p className="mt-3 text-gray-600">{t("loading_messages")}</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="rounded-xl border border-gray-100 bg-white p-12 text-center">
              <svg className="h-12 w-12 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              <p className="mt-4 text-lg font-medium text-gray-600">No messages found</p>
              <p className="mt-1 text-sm text-gray-500">Messages will appear here when someone submits a form.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`rounded-lg border p-4 cursor-pointer transition-all ${
                    !message.read
                      ? "border-[#c9a84c] bg-[#c9a84c]/10 shadow-sm hover:shadow-md"
                      : "border-gray-100 bg-white hover:shadow-md"
                  }`}
                  onClick={() => openMessage(message)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className={`text-sm font-semibold ${message.read ? "text-gray-600" : "text-[#1a2b4a]"}`}>
                          {message.name}
                        </h3>
                        {!message.read && (
                          <span className="inline-block h-2 w-2 rounded-full bg-[#c9a84c]"></span>
                        )}
                      </div>
                      <p className={`text-xs mt-0.5 ${message.read ? "text-gray-500" : "text-gray-600"}`}>{message.email}</p>
                      <p className={`text-sm mt-2 line-clamp-2 ${message.read ? "text-gray-600" : "text-gray-700 font-medium"}`}>
                        {message.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">{formatDate(message.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                    <button
  onClick={(e) => {
    e.stopPropagation();
    handleToggleStatus(message.id, message.read);
  }}
  className="p-2 rounded-lg text-gray-400 hover:text-[#c9a84c] hover:bg-gray-100 transition-colors"
  title={message.read ? "Mark as unread" : "Mark as read"}
>

    <ClipboardDocumentCheckIcon className="h-5 w-5" />

</button>

<button
  onClick={(e) => {
    e.stopPropagation();
    window.location.href = `mailto:${message.email}`;
  }}
  className="p-2 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
  title="Reply via email"
>
  <EnvelopeIcon className="h-5 w-5" />
</button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirmId(message.id);
                        }}
                        className="p-2 text-red-500 hover:text-red-800 hover:bg-red-100 rounded-lg transition-colors flex items-center justify-center"
                        title="Delete message"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {showModal && selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl max-h-screen overflow-y-auto rounded-xl bg-white shadow-2xl">
            <div className="sticky top-0 border-b border-gray-200 bg-white p-6 sm:p-8 flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-bold text-[#1a2b4a]">Message from {selectedMessage.name}</h3>
                <p className="mt-1 text-sm text-gray-600">{formatDate(selectedMessage.created_at)}</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-600 mb-2">Sender Information</h4>
                <div className="space-y-2 text-sm">
                <p>
  <span className="font-medium text-[#1a2b4a]">Name:</span>{" "}
  <span className="text-[#c9a84c]">
    {selectedMessage.name}
  </span>
</p>
                  <p>
                    <span className="font-medium text-[#1a2b4a]">Email:</span>{" "}
                    <a href={`mailto:${selectedMessage.email}`} className="text-[#c9a84c] hover:underline">
                      {selectedMessage.email}
                    </a>
                  </p>
                  {selectedMessage.phone && (
                    <p>
                      <span className="font-medium text-[#1a2b4a]">Phone:</span>{" "}
                      <a href={`tel:${selectedMessage.phone}`} className="text-[#c9a84c] hover:underline">
                        {selectedMessage.phone}
                      </a>
                    </p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-600 mb-2">Message</h4>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedMessage.message}</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    handleToggleStatus(selectedMessage.id, selectedMessage.read);
                  }}
                  className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-[#1a2b4a] transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  {selectedMessage.read ? "Mark as Unread" : "Mark as Read"}
                </button>
                <button
                  onClick={() => {
                    window.location.href = `mailto:${selectedMessage.email}`;
                  }}
                  className="flex-1 rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  Reply via Email
                </button>
                <button
                  onClick={() => {
                    setDeleteConfirmId(selectedMessage.id);
                  }}
                  className="flex-1 rounded-lg border border-red-300 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-400"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-xl shadow-2xl">
            <div className="p-6 sm:p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t("delete_message")}</h3>
              <p className="text-gray-700 mb-6">Are you sure you want to permanently delete this message? This action cannot be undone.</p>
              
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 font-semibold transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteConfirmId && handleDeleteMessage(deleteConfirmId)}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold transition-colors hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-400"
                >
                  {isDeleting ? t("deleting") : t("delete")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}







// delete message