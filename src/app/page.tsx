"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Video } from "lucide-react";

export default function Home() {
  const [sessionName, setSessionName] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = sessionName.trim();
    if (trimmed) {
      router.push(`/call/${encodeURIComponent(trimmed)}`);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Video className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            jenis akkage app eka
          </h1>
          <p className="text-muted-foreground">
            Enter a session name to start or join a video call
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-xl border bg-card p-6 shadow-lg"
        >
          <div className="space-y-2">
            <label
              htmlFor="session-name"
              className="text-sm font-medium leading-none"
            >
              Session Name
            </label>
            <Input
              id="session-name"
              type="text"
              placeholder="e.g. my-meeting"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              autoFocus
              autoComplete="off"
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={!sessionName.trim()}
          >
            Create / Join Session
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          Powered by Zoom Video SDK
        </p>
      </div>
    </main>
  );
}
