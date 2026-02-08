"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Input } from "./ui/input";
import { Loader2, Mail, X, CheckCircle2, AlertCircle, UserPlus } from "lucide-react";

interface InviteModalProps {
  sessionName: string;
  isOpen: boolean;
  onClose: () => void;
}

interface SentInvite {
  email: string;
  status: "success" | "error";
  message: string;
}

export default function InviteModal({
  sessionName,
  isOpen,
  onClose,
}: InviteModalProps) {
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sentInvites, setSentInvites] = useState<SentInvite[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setEmail("");
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === backdropRef.current) {
        onClose();
      }
    },
    [onClose]
  );

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || isSending) return;

    setIsSending(true);

    try {
      const res = await fetch("/api/send-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trimmed,
          sessionName,
          inviterName: undefined, // could pass current user name
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSentInvites((prev) => [
          { email: trimmed, status: "error", message: data.error || "Failed to send" },
          ...prev,
        ]);
      } else {
        setSentInvites((prev) => [
          { email: trimmed, status: "success", message: "Invitation sent!" },
          ...prev,
        ]);
        setEmail("");
        inputRef.current?.focus();
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Network error";
      setSentInvites((prev) => [
        { email: trimmed, status: "error", message },
        ...prev,
      ]);
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <div className="w-full max-w-md rounded-2xl bg-[#292a2d] border border-[#3c4043] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#3c4043] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#8ab4f8]/10">
              <UserPlus className="h-4 w-4 text-[#8ab4f8]" />
            </div>
            <div>
              <h2 className="text-base font-medium text-white">
                Invite people
              </h2>
              <p className="text-xs text-[#9aa0a6]">
                Session:{" "}
                <span className="font-mono font-medium text-[#8ab4f8]">
                  {sessionName}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#9aa0a6] hover:bg-[#3c4043] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-4">
          <form onSubmit={handleSendInvite} className="flex gap-2">
            <Input
              ref={inputRef}
              type="email"
              placeholder="colleague@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSending}
              className="flex-1 bg-[#202124] border-[#3c4043] text-white placeholder:text-[#5f6368] focus-visible:ring-[#8ab4f8]"
              required
            />
            <button
              type="submit"
              disabled={!email.trim() || isSending}
              className="flex items-center gap-1.5 rounded-full bg-[#8ab4f8] text-[#202124] px-4 py-2 text-sm font-medium hover:bg-[#aecbfa] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Mail className="h-4 w-4" />
                  Send
                </>
              )}
            </button>
          </form>

          {/* Sent invites list */}
          {sentInvites.length > 0 && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              <p className="text-xs font-medium text-[#9aa0a6] uppercase tracking-wider">
                Sent Invitations
              </p>
              {sentInvites.map((invite, i) => (
                <div
                  key={`${invite.email}-${i}`}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                    invite.status === "success"
                      ? "bg-green-500/10 text-green-400"
                      : "bg-red-500/10 text-red-400"
                  }`}
                >
                  {invite.status === "success" ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 shrink-0" />
                  )}
                  <span className="truncate font-medium">{invite.email}</span>
                  <span className="ml-auto text-xs opacity-75 shrink-0">
                    {invite.message}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[#3c4043] px-6 py-3">
          <p className="text-xs text-[#5f6368] text-center">
            An email with the session link will be sent to the recipient
          </p>
        </div>
      </div>
    </div>
  );
}
