"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import kneoxtLogo from "../../../public/Kneoxt/kneoxt_light.svg";
import {
  Copy,
  Trash2,
  Plus,
  LogOut,
  Check,
  Video,
  Clock,
  X,
  Loader2,
  Users,
  CheckCircle2,
  CircleDot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Logo from "@/components/Logo";

interface TestimonialLink {
  id: string;
  token: string;
  recipientName: string;
  recipientEmail: string | null;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  createdAt: string;
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

  const logout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } finally {
      window.location.href = "/login";
    }
  };

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

  return (
    <div className="relative min-h-screen flex flex-col bg-tl-navy overflow-hidden">
      {/* Background ambient glow effect */}
      <div className="absolute top-0 left-1/4 -z-10 h-[300px] w-[300px] rounded-full bg-[#13A983]/5 blur-[120px]" />
      <div className="absolute top-1/3 right-1/4 -z-10 h-[400px] w-[400px] rounded-full bg-tl-success/5 blur-[150px]" />
      <div className="absolute bottom-10 left-10 -z-10 h-[300px] w-[300px] rounded-full bg-[#13A983]/5 blur-[120px]" />

      {/* Header */}
      <header className="border-b border-white/[0.06] bg-tl-navy-800/80 backdrop-blur-md px-4 py-3 sm:px-6 sm:py-4 sticky top-0 z-40">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <Logo size="sm" />
            <span className="rounded-full bg-[#13A983]/10 border border-[#13A983]/20 px-2.5 py-0.5 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.08em] text-[#13A983]">
              Admin
            </span>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 sm:gap-2 rounded-lg border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] px-3.5 py-2 text-xs sm:text-sm text-white/80 hover:text-white transition-all duration-150 ease-out active:scale-[0.98]"
          >
            <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Logout
          </button>
        </div>
      </header>

      <main className="flex-1 w-full mx-auto max-w-6xl space-y-6 sm:space-y-8 p-4 sm:p-6 relative">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
          {[
            {
              label: "Total Links",
              value: links.length,
              icon: Users,
              colorClass: "text-[#13A983]",
              bgClass: "bg-[#13A983]/10 border-[#13A983]/20",
              glowClass: "shadow-[0_0_20px_rgba(19,169,131,0.07)]",
            },
            {
              label: "Pending",
              value: pending,
              icon: Clock,
              colorClass: "text-[#8da8a3]",
              bgClass: "bg-[#8da8a3]/10 border-[#8da8a3]/20",
              glowClass: "shadow-[0_0_20px_rgba(141,168,163,0.07)]",
            },
            {
              label: "In Progress",
              value: inProgress,
              icon: CircleDot,
              colorClass: "text-[#F59E0B]",
              bgClass: "bg-[#F59E0B]/10 border-[#F59E0B]/20",
              glowClass: "shadow-[0_0_20px_rgba(245,158,11,0.07)]",
            },
            {
              label: "Completed",
              value: completed,
              icon: CheckCircle2,
              colorClass: "text-tl-success",
              bgClass: "bg-tl-success/10 border-tl-success/20",
              glowClass: "shadow-[0_0_20px_rgba(16,185,129,0.07)]",
            },
          ].map(({ label, value, icon: Icon, colorClass, bgClass, glowClass }) => (
            <div
              key={label}
              className={`relative overflow-hidden rounded-xl bg-tl-navy-800/40 border border-white/[0.06] p-5 backdrop-blur-md transition-all duration-300 hover:translate-y-[-2px] hover:border-white/10 hover:bg-tl-navy-800/60 group ${glowClass}`}
            >
              {/* Subtle top gradient accent */}
              <div className={`absolute top-0 left-0 right-0 h-[2px] bg-current opacity-30 ${colorClass}`} />
              
              <div className="flex items-center justify-between">
                <p className="text-xs sm:text-sm font-medium text-white/50 group-hover:text-white/70 transition-colors">{label}</p>
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${bgClass}`}>
                  <Icon className={`h-4.5 w-4.5 ${colorClass}`} />
                </div>
              </div>
              <div className="mt-4 flex items-baseline">
                <p className="text-3xl font-bold tracking-tight text-white font-mono">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Links table */}
        <div className="rounded-xl bg-tl-navy-800/40 border border-white/[0.06] backdrop-blur-md shadow-xl overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4 sm:px-6">
            <div>
              <h2 className="text-base font-semibold text-white">Testimonial Links</h2>
              <p className="text-xs text-white/40 mt-0.5">Manage and monitor link invitation status</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="relative overflow-hidden rounded-lg bg-gradient-to-r from-[#34B558] to-[#13A983] text-white hover:opacity-95 shadow-md shadow-[#13A983]/15 transition-all hover:scale-[1.02] active:scale-[0.98] px-3.5 py-2 text-xs sm:text-sm font-semibold flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Create link
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-[#13A983]" />
            </div>
          ) : links.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
              <div className="relative mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.02] border border-white/[0.06] text-white/30">
                <Video className="h-6 w-6 text-[#13A983]" />
                <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#13A983] text-[10px] font-bold text-white">
                  +
                </div>
              </div>
              <h3 className="text-base font-semibold text-white">No testimonial links</h3>
              <p className="mx-auto mt-1 max-w-sm text-xs text-white/40">
                Create a secure recording link to send to your clients and collect high-fidelity video testimonials.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-5 rounded-lg border border-white/10 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white transition-all active:scale-[0.98]"
              >
                Create your first link
              </button>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.06]">
              {links.map((link) => (
                <div
                  key={link.id}
                  className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:gap-6 sm:px-6 hover:bg-white/[0.01] transition-all duration-200"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-sm sm:text-base">{link.recipientName}</p>
                    <p className="text-xs text-white/40 mt-1 flex items-center gap-1.5">
                      <span>{link.recipientEmail ?? "No email address"}</span>
                      <span className="text-white/10">•</span>
                      <span>Created {formatDate(link.createdAt)}</span>
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-2 sm:contents">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <StatusBadge status={link.status} />
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => copyLink(link.token, link.id)}
                        title="Copy recording link"
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] text-white/60 hover:text-white transition-all duration-150 ease-out"
                      >
                        {copiedId === link.id ? (
                          <Check className="h-4 w-4 text-[#10B981]" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => deleteLink(link.id)}
                        disabled={deletingId === link.id}
                        title="Delete link"
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/5 bg-white/[0.02] hover:bg-tl-error/10 text-white/60 hover:text-[#EF4444] transition-all duration-150 ease-out disabled:opacity-50"
                      >
                        {deletingId === link.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>

      {/* Create Link Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-[#0c1f1b] border border-white/10 shadow-2xl p-0 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4.5">
              <div>
                <h3 className="text-base font-semibold text-white">Create Testimonial Link</h3>
                <p className="text-xs text-white/40 mt-0.5">Generate a secure invitation link</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={createLink} className="space-y-5 p-6">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-white/40 uppercase tracking-[0.08em]">
                  Recipient Name *
                </label>
                <Input
                  type="text"
                  required
                  autoFocus
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="e.g. Jane Smith"
                  className="bg-black/20 border-white/10 text-white placeholder:text-white/20 focus:border-[#13A983]/50 focus:ring-1 focus:ring-[#13A983]/50 rounded-lg py-5"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-white/40 uppercase tracking-[0.08em]">
                  Email Address (optional)
                </label>
                <Input
                  type="email"
                  value={createEmail}
                  onChange={(e) => setCreateEmail(e.target.value)}
                  placeholder="e.g. jane@example.com"
                  className="bg-black/20 border-white/10 text-white placeholder:text-white/20 focus:border-[#13A983]/50 focus:ring-1 focus:ring-[#13A983]/50 rounded-lg py-5"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 rounded-lg border-white/10 text-white/70 hover:text-white hover:bg-white/5"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={creating || !createName.trim()}
                  className="flex-1 rounded-lg bg-gradient-to-r from-[#34B558] to-[#13A983] text-white hover:opacity-95 shadow-md shadow-[#13A983]/10"
                >
                  {creating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Create Link"
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
          <div className="flex items-center gap-2 text-xs text-white/50">
            <span>A tenon-Link product by</span>
            <Image
              src={kneoxtLogo}
              alt="Kneoxt"
              className="h-3.5 w-auto object-contain brightness-0 invert opacity-60 hover:opacity-100 transition-opacity duration-150"
            />
          </div>
        </div>
      </footer>
    </div>
  );
}
