"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Copy,
  Trash2,
  Plus,
  LogOut,
  Check,
  Video,
  Clock,
  ExternalLink,
  X,
  Loader2,
  Users,
  CheckCircle2,
  CircleDot,
} from "lucide-react";

interface Recording {
  id: string;
  uploadUrl: string;
  durationSec: number | null;
  fileSizeMB: number | null;
  createdAt: string;
}

interface TestimonialLink {
  id: string;
  token: string;
  recipientName: string;
  recipientEmail: string | null;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  createdAt: string;
  recording: Recording | null;
}

function StatusBadge({ status }: { status: TestimonialLink["status"] }) {
  if (status === "COMPLETED") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-400">
        <CheckCircle2 className="h-3 w-3" />
        Completed
      </span>
    );
  }
  if (status === "IN_PROGRESS") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-500/10 px-2.5 py-1 text-xs font-medium text-yellow-400">
        <CircleDot className="h-3 w-3" />
        In Progress
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#3c4043] px-2.5 py-1 text-xs font-medium text-[#9aa0a6]">
      <Clock className="h-3 w-3" />
      Pending
    </span>
  );
}

function formatDuration(sec: number | null) {
  if (!sec) return "—";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function AdminDashboard() {
  const [links, setLinks] = useState<TestimonialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchLinks = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/links");
      if (res.ok) setLinks(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const getRecordingUrl = (token: string) =>
    `${window.location.origin}/record/${token}`;

  const copyLink = async (token: string, id: string) => {
    await navigator.clipboard.writeText(getRecordingUrl(token));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const deleteLink = async (id: string) => {
    if (!confirm("Delete this testimonial link? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await fetch(`/api/admin/links/${id}`, { method: "DELETE" });
      setLinks((prev) => prev.filter((l) => l.id !== id));
    } finally {
      setDeletingId(null);
    }
  };

  const createLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/admin/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientName: createName, recipientEmail: createEmail }),
      });
      if (res.ok) {
        const newLink = await res.json();
        setLinks((prev) => [newLink, ...prev]);
        setShowCreateModal(false);
        setCreateName("");
        setCreateEmail("");
      }
    } finally {
      setCreating(false);
    }
  };

  const pending = links.filter((l) => l.status === "PENDING").length;
  const inProgress = links.filter((l) => l.status === "IN_PROGRESS").length;
  const completed = links.filter((l) => l.status === "COMPLETED").length;
  const recordings = links.filter((l) => l.recording);

  return (
    <div className="min-h-screen bg-[#202124]">
      {/* Header */}
      <header className="border-b border-[#3c4043] bg-[#292a2d] px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#8ab4f8]/10">
              <Video className="h-5 w-5 text-[#8ab4f8]" />
            </div>
            <div>
              <h1 className="text-base font-medium text-white">Testimonial Admin</h1>
              <p className="text-xs text-[#9aa0a6]">Tenon Link Connect</p>
            </div>
          </div>
          <a
            href="/api/admin/logout"
            className="flex items-center gap-2 rounded-full border border-[#3c4043] px-4 py-2 text-sm text-[#9aa0a6] hover:bg-[#3c4043] transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 p-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Total", value: links.length, icon: Users },
            { label: "Pending", value: pending, icon: Clock },
            { label: "In Progress", value: inProgress, icon: CircleDot },
            { label: "Completed", value: completed, icon: CheckCircle2 },
          ].map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="rounded-xl bg-[#292a2d] border border-[#3c4043] p-4 text-center"
            >
              <Icon className="mx-auto mb-2 h-5 w-5 text-[#8ab4f8]" />
              <p className="text-2xl font-semibold text-white">{value}</p>
              <p className="text-xs text-[#9aa0a6]">{label}</p>
            </div>
          ))}
        </div>

        {/* Links table */}
        <div className="rounded-2xl bg-[#292a2d] border border-[#3c4043] overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#3c4043] px-6 py-4">
            <h2 className="text-sm font-medium text-white">Testimonial Links</h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 rounded-full bg-[#8ab4f8] px-4 py-2 text-sm font-medium text-[#202124] hover:bg-[#aecbfa] transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create Link
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-[#8ab4f8]" />
            </div>
          ) : links.length === 0 ? (
            <div className="py-16 text-center text-sm text-[#9aa0a6]">
              No links yet. Create one to get started.
            </div>
          ) : (
            <div className="divide-y divide-[#3c4043]">
              {links.map((link) => (
                <div
                  key={link.id}
                  className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white">{link.recipientName}</p>
                    <p className="text-xs text-[#9aa0a6] mt-0.5">
                      {link.recipientEmail ?? "No email"} · {formatDate(link.createdAt)}
                    </p>
                  </div>

                  <StatusBadge status={link.status} />

                  {link.recording && (
                    <a
                      href={link.recording.uploadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 rounded-full bg-[#8ab4f8]/10 px-3 py-1.5 text-xs font-medium text-[#8ab4f8] hover:bg-[#8ab4f8]/20 transition-colors"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View Recording
                      {link.recording.durationSec && (
                        <span className="text-[#9aa0a6]">
                          · {formatDuration(link.recording.durationSec)}
                        </span>
                      )}
                    </a>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyLink(link.token, link.id)}
                      title="Copy recording link"
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3c4043] hover:bg-[#4a4d51] text-[#9aa0a6] transition-colors"
                    >
                      {copiedId === link.id ? (
                        <Check className="h-4 w-4 text-green-400" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => deleteLink(link.id)}
                      disabled={deletingId === link.id}
                      title="Delete link"
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3c4043] hover:bg-red-500/20 text-[#9aa0a6] hover:text-red-400 transition-colors disabled:opacity-50"
                    >
                      {deletingId === link.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recordings section */}
        {recordings.length > 0 && (
          <div className="rounded-2xl bg-[#292a2d] border border-[#3c4043] overflow-hidden">
            <div className="border-b border-[#3c4043] px-6 py-4">
              <h2 className="text-sm font-medium text-white">Recordings</h2>
            </div>
            <div className="divide-y divide-[#3c4043]">
              {recordings.map((link) => (
                <div
                  key={link.id}
                  className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:gap-4"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#8ab4f8]/10">
                    <Video className="h-5 w-5 text-[#8ab4f8]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white">{link.recipientName}</p>
                    <p className="text-xs text-[#9aa0a6] mt-0.5">
                      {link.recording!.durationSec
                        ? `${formatDuration(link.recording!.durationSec)} · `
                        : ""}
                      {link.recording!.fileSizeMB
                        ? `${link.recording!.fileSizeMB.toFixed(1)} MB · `
                        : ""}
                      {formatDate(link.recording!.createdAt)}
                    </p>
                  </div>
                  <a
                    href={link.recording!.uploadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-full bg-[#8ab4f8] px-4 py-2 text-sm font-medium text-[#202124] hover:bg-[#aecbfa] transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Create Link Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#292a2d] border border-[#3c4043] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#3c4043] px-6 py-4">
              <h3 className="text-base font-medium text-white">Create Testimonial Link</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-[#9aa0a6] hover:bg-[#3c4043] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={createLink} className="space-y-4 p-6">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#9aa0a6] uppercase tracking-wider">
                  Recipient Name *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="Jane Smith"
                  className="w-full rounded-lg bg-[#202124] border border-[#3c4043] px-3 py-2.5 text-sm text-white placeholder:text-[#5f6368] focus:outline-none focus:ring-2 focus:ring-[#8ab4f8]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#9aa0a6] uppercase tracking-wider">
                  Email (optional)
                </label>
                <input
                  type="email"
                  value={createEmail}
                  onChange={(e) => setCreateEmail(e.target.value)}
                  placeholder="jane@example.com"
                  className="w-full rounded-lg bg-[#202124] border border-[#3c4043] px-3 py-2.5 text-sm text-white placeholder:text-[#5f6368] focus:outline-none focus:ring-2 focus:ring-[#8ab4f8]"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 rounded-full border border-[#3c4043] py-2.5 text-sm text-[#9aa0a6] hover:bg-[#3c4043] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !createName.trim()}
                  className="flex-1 flex items-center justify-center gap-2 rounded-full bg-[#8ab4f8] py-2.5 text-sm font-medium text-[#202124] hover:bg-[#aecbfa] transition-colors disabled:opacity-50"
                >
                  {creating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Create Link"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
