"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Logo from "@/components/Logo";

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
      <span className="inline-flex items-center gap-1.5 rounded-full bg-tl-success/10 px-2.5 py-1 text-xs font-medium text-tl-success">
        <CheckCircle2 className="h-3 w-3" />
        Completed
      </span>
    );
  }
  if (status === "IN_PROGRESS") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-tl-warning/10 px-2.5 py-1 text-xs font-medium text-tl-warning">
        <CircleDot className="h-3 w-3" />
        In progress
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-tl-neutral/10 px-2.5 py-1 text-xs font-medium text-tl-neutral">
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
    <div className="min-h-screen bg-tl-navy">
      {/* Header */}
      <header className="border-b border-white/[0.08] bg-tl-navy-800 px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <span className="rounded-full bg-tl-navy-700 border border-white/10 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-[0.08em] text-white/60">
              Admin
            </span>
          </div>
          <a
            href="/api/admin/logout"
            className="flex items-center gap-2 rounded-sm border border-white/20 px-4 py-2 text-sm text-white hover:bg-white/[0.06] transition-colors duration-150 ease-out"
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
            { label: "In progress", value: inProgress, icon: CircleDot },
            { label: "Completed", value: completed, icon: CheckCircle2 },
          ].map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="rounded-lg bg-tl-navy-800 border border-white/[0.08] p-4 text-center"
            >
              <Icon className="mx-auto mb-2 h-5 w-5 text-tl-blue" />
              <p className="text-2xl font-semibold text-white">{value}</p>
              <p className="text-xs text-white/60">{label}</p>
            </div>
          ))}
        </div>

        {/* Links table */}
        <div className="rounded-lg bg-tl-navy-800 border border-white/[0.08] overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
            <h2 className="text-sm font-semibold text-white">Testimonial links</h2>
            <Button onClick={() => setShowCreateModal(true)} size="sm">
              <Plus className="h-4 w-4 mr-1.5" />
              Create link
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-tl-blue" />
            </div>
          ) : links.length === 0 ? (
            <div className="py-16 text-center text-sm text-white/60">
              No links yet. Create one to get started.
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {links.map((link) => (
                <div
                  key={link.id}
                  className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white">{link.recipientName}</p>
                    <p className="text-xs text-white/60 mt-0.5">
                      {link.recipientEmail ?? "No email"} · {formatDate(link.createdAt)}
                    </p>
                  </div>

                  <StatusBadge status={link.status} />

                  {link.recording && (
                    <a
                      href={link.recording.uploadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 rounded-full bg-tl-blue/10 px-3 py-1.5 text-xs font-medium text-tl-blue hover:bg-tl-blue/20 transition-colors duration-150 ease-out"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View recording
                      {link.recording.durationSec && (
                        <span className="text-white/60">
                          · {formatDuration(link.recording.durationSec)}
                        </span>
                      )}
                    </a>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyLink(link.token, link.id)}
                      title="Copy recording link"
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-tl-navy-700 hover:bg-tl-navy-600 text-white/60 transition-colors duration-150 ease-out"
                    >
                      {copiedId === link.id ? (
                        <Check className="h-4 w-4 text-tl-success" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => deleteLink(link.id)}
                      disabled={deletingId === link.id}
                      title="Delete link"
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-tl-navy-700 hover:bg-tl-error/20 text-white/60 hover:text-tl-error transition-colors duration-150 ease-out disabled:opacity-50"
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
          <div className="rounded-lg bg-tl-navy-800 border border-white/[0.08] overflow-hidden">
            <div className="border-b border-white/10 px-6 py-4">
              <h2 className="text-sm font-semibold text-white">Recordings</h2>
            </div>
            <div className="divide-y divide-white/10">
              {recordings.map((link) => (
                <div
                  key={link.id}
                  className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:gap-4"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-tl-blue/10">
                    <Video className="h-5 w-5 text-tl-blue" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white">{link.recipientName}</p>
                    <p className="text-xs text-white/60 mt-0.5">
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
                    className="flex items-center gap-1.5 rounded-sm bg-tl-blue px-4 py-2 text-sm font-medium text-white hover:bg-tl-blue-700 transition-colors duration-150 ease-out"
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
          <div className="w-full max-w-md rounded-xl bg-tl-navy-800 border border-white/[0.08] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <h3 className="text-base font-semibold text-white">Create testimonial link</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-white/60 hover:bg-white/[0.06] transition-colors duration-150 ease-out"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={createLink} className="space-y-4 p-6">
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-white/60 uppercase tracking-[0.08em]">
                  Recipient name *
                </label>
                <Input
                  type="text"
                  required
                  autoFocus
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="Jane Smith"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-white/60 uppercase tracking-[0.08em]">
                  Email (optional)
                </label>
                <Input
                  type="email"
                  value={createEmail}
                  onChange={(e) => setCreateEmail(e.target.value)}
                  placeholder="jane@example.com"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={creating || !createName.trim()}
                  className="flex-1"
                >
                  {creating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Create link"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-white/[0.08] mt-12 bg-tl-navy-800">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} tenon-Link Connect
          </p>
          <div className="flex items-center gap-2 text-xs text-white/60">
            <span>A tenon-Link product by</span>
            <Image
              src="/Kneoxt/dark.png"
              alt="Kneoxt"
              width={20}
              height={20}
              className="rounded-sm"
            />
            <span className="font-medium text-white">Kneoxt</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
