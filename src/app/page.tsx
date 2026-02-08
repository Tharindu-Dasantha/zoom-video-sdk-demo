"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Video, ArrowRight } from "lucide-react";

export default function Home() {
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
        `/call/${encodeURIComponent(trimmedSession)}?${params.toString()}`
      );
    }
  };

  const isValid = sessionName.trim() && userName.trim();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#202124] p-6">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#8ab4f8]/10">
            <Video className="h-7 w-7 text-[#8ab4f8]" />
          </div>
          <h1 className="text-3xl font-medium text-white tracking-tight">
            Jenis Akkage App Eka
          </h1>
          <p className="text-[#9aa0a6] text-sm">
            Start or join a video meeting
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl bg-[#292a2d] p-6 shadow-xl border border-[#3c4043]"
        >
          <div className="space-y-1.5">
            <label
              htmlFor="user-name"
              className="text-xs font-medium text-[#9aa0a6] uppercase tracking-wider"
            >
              Your Name
            </label>
            <Input
              id="user-name"
              type="text"
              placeholder="Enter your name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              autoFocus
              autoComplete="off"
              className="bg-[#202124] border-[#3c4043] text-white placeholder:text-[#5f6368] focus-visible:ring-[#8ab4f8]"
            />
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="session-name"
              className="text-xs font-medium text-[#9aa0a6] uppercase tracking-wider"
            >
              Meeting Code
            </label>
            <Input
              id="session-name"
              type="text"
              placeholder="e.g. team-standup"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              autoComplete="off"
              className="bg-[#202124] border-[#3c4043] text-white placeholder:text-[#5f6368] focus-visible:ring-[#8ab4f8]"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-[#8ab4f8] text-[#202124] hover:bg-[#aecbfa] font-medium h-11 rounded-full"
            disabled={!isValid}
          >
            Join meeting
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>

        <p className="text-center text-xs text-[#5f6368]">
          Powered by Zoom Video SDK
        </p>
      </div>
    </main>
  );
}
