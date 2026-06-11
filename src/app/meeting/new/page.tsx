"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Logo from "@/components/Logo";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export default function NewMeetingPage() {
  const [sessionName, setSessionName] = useState("");
  const [userName, setUserName] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedSession = sessionName.trim();
    const trimmedName = userName.trim();
    if (trimmedSession && trimmedName) {
      const params = new URLSearchParams({ name: trimmedName });
      router.push(
        `/meeting/${encodeURIComponent(trimmedSession)}?${params.toString()}`
      );
    }
  };

  const isValid = sessionName.trim() && userName.trim();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-tl-navy p-6">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <Logo size="md" className="justify-center" />
          <p className="text-white/60 text-sm">Start or join a video meeting</p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-lg bg-tl-navy-800 p-6 shadow-xl border border-white/[0.08]"
        >
          <div className="space-y-1.5">
            <label
              htmlFor="user-name"
              className="text-[11px] font-medium text-white/60 uppercase tracking-[0.08em]"
            >
              Your name
            </label>
            <Input
              id="user-name"
              type="text"
              placeholder="Enter your name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              autoFocus
              autoComplete="off"
            />
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="session-name"
              className="text-[11px] font-medium text-white/60 uppercase tracking-[0.08em]"
            >
              Meeting code
            </label>
            <Input
              id="session-name"
              type="text"
              placeholder="e.g. team-standup"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              autoComplete="off"
            />
          </div>
          <Button type="submit" className="w-full h-11" disabled={!isValid}>
            Join meeting
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>

        <div className="flex flex-col items-center gap-2">
          <p className="text-center text-[11px] text-white/30">
            Powered by Zoom Video SDK
          </p>
          <div className="flex items-center gap-2 text-xs text-white/20">
            <span>A tenon-Link product by</span>
            <Image
              src="/Kneoxt/dark.png"
              alt="Kneoxt"
              width={16}
              height={16}
              className="rounded-sm opacity-40 grayscale hover:opacity-100 transition-opacity"
            />
            <span className="font-medium text-white/40">Kneoxt</span>
          </div>
        </div>
      </div>
    </main>
  );
}
