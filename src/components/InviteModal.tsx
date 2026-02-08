"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "./ui/button";
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
    >
      <div className="w-full max-w-md rounded-xl border bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <UserPlus className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Invite to Session</h2>
              <p className="text-xs text-muted-foreground">
                Send an email invite to join{" "}
                <span className="font-mono font-medium text-foreground">
                  {sessionName}
                </span>
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
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
              className="flex-1"
              required
            />
            <Button
              type="submit"
              disabled={!email.trim() || isSending}
              className="shrink-0"
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Mail className="mr-1.5 h-4 w-4" />
                  Send
                </>
              )}
            </Button>
          </form>

          {/* Sent invites list */}
          {sentInvites.length > 0 && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Sent Invitations
              </p>
              {sentInvites.map((invite, i) => (
                <div
                  key={`${invite.email}-${i}`}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                    invite.status === "success"
                      ? "bg-green-500/10 text-green-700 dark:text-green-400"
                      : "bg-destructive/10 text-destructive"
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
        <div className="border-t px-6 py-3">
          <p className="text-xs text-muted-foreground text-center">
            An email with the session link will be sent to the recipient
          </p>
        </div>
      </div>
    </div>
  );
}
